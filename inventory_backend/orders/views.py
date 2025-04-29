from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import permissions, status
from rest_framework import status
from django.shortcuts import get_object_or_404
from decimal import Decimal
from .models import Order, OrderItem
from products.models import Product
from customers.models import Customer
from django.http import HttpResponse
from django.template.loader import render_to_string
from weasyprint import HTML
import tempfile
from .serializers import OrderSerializer
from rest_framework.pagination import PageNumberPagination
from django.views.decorators.csrf import csrf_exempt
from decimal import Decimal
from collections import defaultdict
from django.db.models import Q
from django.db.models import Sum, Count
from datetime import datetime, timedelta
from manufacturers.models import Manufacturer
from products.models import Product
from categories.models import Category
from django.contrib.auth import get_user_model
from num2words import num2words
VAT_RATE = Decimal('0.15')  # Example VAT rate of 15%

@csrf_exempt
@api_view(['POST'])
def create_order(request):
    if request.method == "POST":
        product_data = request.data.get("products")  # List of {"product_id": id, "quantity": qty}

        if not product_data:
            return Response({"error": "Products are required."}, status=status.HTTP_400_BAD_REQUEST)

        total_amount = Decimal(0)
        customer_id = request.data.get("customer_id")
        customer = get_object_or_404(Customer, id=customer_id) if customer_id else None

        # Aggregate total quantity required for each product
        required_quantities = defaultdict(int)
        for item in product_data:
            product_id = item.get("product_id")
            quantity = item.get("quantity")

            if not product_id or not quantity:
                return Response({"error": "Product ID and quantity are required for each product"}, status=status.HTTP_400_BAD_REQUEST)

            required_quantities[product_id] += quantity

        # Check stock availability **before** updating products
        # Check stock availability **before** updating products
            # Check stock availability **before** updating products
        for product_id, total_quantity in required_quantities.items():
            product = get_object_or_404(Product, id=product_id)
            if product.quantity < total_quantity:
                return Response({
                    "error": f"Not enough stock for product '{product.name}' (Available: {product.quantity}, Required: {total_quantity})"
                }, status=status.HTTP_400_BAD_REQUEST)



        # Create the order after all validations pass
        order = Order.objects.create(customer=customer, status="pending", total_amount=0)

        # Process the order
        for product_id, total_quantity in required_quantities.items():
            product = get_object_or_404(Product, id=product_id)

            price = product.price * total_quantity
            total_amount += price

            # Deduct stock
            product.quantity -= total_quantity
            product.save()

            # Save the order item
            OrderItem.objects.create(order=order, product=product, quantity=total_quantity, price=price)

        # Apply VAT
        vat_amount = total_amount * VAT_RATE
        order.total_amount = total_amount + vat_amount
        order.save()

        # Serialize the order and return response
        serializer = OrderSerializer(order)
        return Response({
            "message": "Order placed successfully",
            "order": serializer.data,
            "total_amount": str(order.total_amount),
            "vat": str(vat_amount)
        }, status=status.HTTP_201_CREATED)

@api_view(['GET'])
def generate_invoice(request, order_id):
    order = get_object_or_404(Order, id=order_id)
    order_items = OrderItem.objects.filter(order=order)
    tin = order.customer.tin if order.customer else None

    # Calculate subtotal and item totals
    subtotal = Decimal(0)
    item_totals = []
    for item in order_items:
        item_total = item.price * item.quantity
        item_totals.append(item_total)
        subtotal += item_total

    # Calculate VAT and total
    VAT_RATE = Decimal('0.15')  # Make sure it's defined
    vat_amount = subtotal * VAT_RATE
    total_amount = subtotal + vat_amount

    # Convert total to words AFTER total is calculated
    total_in_words = num2words(total_amount, to='currency', lang='en', currency='USD')
    
    # Replace commas and change dollars to birr
    total_in_words = total_in_words.replace(',', '').replace('dollars', 'birr')

    # Separate the birr and cents with "and"
    if 'and' in total_in_words:
        total_in_words = total_in_words.replace('and', 'and ')

    order_item_totals = zip(order_items, item_totals)

    context = {
        'order': order,
        'order_item_totals': order_item_totals,
        'subtotal': subtotal,
        'vat_rate': VAT_RATE * 100,  # to display 15%
        'vat_amount': vat_amount,
        'total_amount': total_amount,
        'total_in_words': total_in_words.title(),
    }

    html_string = render_to_string('invoice_template.html', context)
    
    response = HttpResponse(content_type='application/pdf')
    response['Content-Disposition'] = f'inline; filename="invoice_{order.id}.pdf"'

    with tempfile.NamedTemporaryFile(delete=True) as temp_file:
        HTML(string=html_string).write_pdf(temp_file.name)
        with open(temp_file.name, 'rb') as pdf:
            response.write(pdf.read())

    return response

class OrderPagination(PageNumberPagination):
    page_size = 10  # You can adjust the page size

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def get_orders(request):
    customer_id = request.query_params.get('customer_id', None)
    status_filter = request.query_params.get('status', None)
    search_query = request.query_params.get('search', '').strip()

    orders = Order.objects.all()

    if customer_id:
        orders = orders.filter(customer_id=customer_id)

    if status_filter:
        orders = orders.filter(status=status_filter)

    if search_query:
        orders = orders.filter(
            Q(id__icontains=search_query) | 
            Q(customer__name__icontains=search_query) |
            Q(products__name__icontains=search_query)
        )

    paginator = OrderPagination()
    paginated_orders = paginator.paginate_queryset(orders, request)

    serializer = OrderSerializer(paginated_orders, many=True)

    return paginator.get_paginated_response(serializer.data)

User = get_user_model()

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def dashboard_summary(request):
    start_date = request.query_params.get('start_date')
    end_date = request.query_params.get('end_date')

    orders = Order.objects.all()
    completed_orders = orders.filter(status='completed')
    
    if start_date and end_date:
        try:
            start = datetime.strptime(start_date, "%Y-%m-%d")
            end = datetime.strptime(end_date, "%Y-%m-%d")
            orders = orders.filter(order_date__date__range=(start, end))
            completed_orders = completed_orders.filter(order_date__date__range=(start, end))
        except ValueError:
            return Response({"error": "Invalid date format. Use YYYY-MM-DD."}, status=400)

    total_orders = orders.count()
    completed_order_count = completed_orders.count()
    pending_order_count = orders.filter(status='pending').count()
    reversed_order_count = orders.filter(status='reversed').count()

    total_revenue = completed_orders.aggregate(Sum('total_amount'))['total_amount__sum'] or 0
    estimated_profit = total_revenue * Decimal("0.20")

    total_customers = Customer.objects.count()
    total_manufacturers = Manufacturer.objects.count()
    total_products = Product.objects.count()
    low_stock_products = Product.objects.filter(quantity__lt=10).count()
    total_categories = Category.objects.count()

    total_users = User.objects.count()
    active_users = User.objects.filter(is_active=True).count()

    inactive_users = User.objects.filter(is_active=False).count()
    # user_roles = User.objects.values('role__name').annotate(count=Count('id'))

    return Response({
        "orders": {
            "total": total_orders,
            "completed": completed_order_count,
            "pending": pending_order_count,
            "reversed": reversed_order_count,
            "revenue": f"{total_revenue:.2f}",
            "profit": f"{estimated_profit:.2f}",
        },
        "customers": {
            "total": total_customers,
        },
        "manufacturers": {
            "total": total_manufacturers,
        },
        "products": {
            "total": total_products,
            "low_stock": low_stock_products,
        },
        "categories": {
            "total": total_categories,
        },
        "users": {
            "total": total_users,
            "active": active_users,
            "inactive": inactive_users,
            # "by_role": user_roles,
        }
    })
@api_view(['PATCH'])
@permission_classes([permissions.IsAuthenticated])
def complete_order(request, order_id):
    order = get_object_or_404(Order, id=order_id)

    if order.status != 'pending':
        return Response({"error": "Order is already completed or cancelled."}, status=status.HTTP_400_BAD_REQUEST)

    order.status = 'completed'
    order.save()

    return Response({"message": "Order marked as completed."}, status=status.HTTP_200_OK)




@api_view(['PATCH'])
@permission_classes([permissions.IsAuthenticated])
def reverse_order(request, order_id):
    order = get_object_or_404(Order, id=order_id)

    if order.status != 'completed':
        return Response({"error": "Order must be completed to be reversed."}, status=status.HTTP_400_BAD_REQUEST)

    # Change status to 'reversed' or 'pending' based on your needs
    order.status = 'reversed'
    order.save()

    # Return the updated order data
    return Response({"message": "Order status updated to reversed.", "order": order.id}, status=status.HTTP_200_OK)
