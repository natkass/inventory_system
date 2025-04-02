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
    
    # Calculate the subtotal (sum of item totals) and VAT
    subtotal = Decimal(0)
    item_totals = []  # List to hold item totals for each item
    for item in order_items:
        # Calculate unit price and total for each item
        item_total = item.price * item.quantity
        item_totals.append(item_total)  # Store individual item totals
        subtotal += item_total  # Sum of all item totals

    vat_amount = subtotal * VAT_RATE  # Calculate VAT based on subtotal
    total_amount = subtotal + vat_amount  # Total amount including VAT

    # Zip order_items and item_totals together
    order_item_totals = zip(order_items, item_totals)

    # Pass necessary values to the template
    context = {
        'order': order,
        'order_item_totals': order_item_totals,  # Pass zipped list
        'subtotal': subtotal,
        'vat_rate': VAT_RATE,
        'vat_amount': vat_amount,
        'total_amount': total_amount,  # Pass the calculated total amount
    }

    html_string = render_to_string('invoice_template.html', context)
    
    response = HttpResponse(content_type='application/pdf')
    response['Content-Disposition'] = f'inline; filename="invoice_{order.id}.pdf"'

    with tempfile.NamedTemporaryFile(delete=True) as temp_file:
        HTML(string=html_string).write_pdf(temp_file.name)
        with open(temp_file.name, 'rb') as pdf:
            response.write(pdf.read())

    return response
# Pagination class (optional but recommended for large datasets)

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
