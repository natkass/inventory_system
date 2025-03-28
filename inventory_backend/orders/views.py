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

VAT_RATE = Decimal('0.15')  # Example VAT rate of 15%

@csrf_exempt
@api_view(['POST'])
def create_order(request):
    if request.method == "POST":
        # Retrieve product_data (list of products with their quantities)
        product_data = request.data.get("products")  # List of {"product_id": id, "quantity": qty}
        
        if not product_data:
            return Response({"error": "Products are required."}, status=status.HTTP_400_BAD_REQUEST)
        
        total_amount = Decimal(0)

        # Check if customer_id is provided, else set to None or default customer
        customer_id = request.data.get("customer_id")
        if customer_id:
            customer = get_object_or_404(Customer, id=customer_id)
        else:
            customer = None  # Or set a default customer if needed

        # Create the order
        order = Order.objects.create(customer=customer, status="pending", total_amount=0)

        # Process each product in the order
        for item in product_data:
            product_id = item.get("product_id")
            quantity = item.get("quantity")

            if not product_id or not quantity:
                return Response({"error": "Product ID and quantity are required for each product"}, status=status.HTTP_400_BAD_REQUEST)

            product = get_object_or_404(Product, id=product_id)

            # Check if the product has enough stock
            if product.quantity < quantity:
                return Response({"error": f"Not enough stock for {product.name}"}, status=status.HTTP_400_BAD_REQUEST)

            price = product.price * quantity
            total_amount += price

            # Deduct stock and save the product
            product.quantity -= quantity
            product.save()

            # Save the order item
            OrderItem.objects.create(order=order, product=product, quantity=quantity, price=price)

        # Apply VAT (if applicable)
        vat_amount = total_amount * VAT_RATE
        order.total_amount = total_amount + vat_amount
        order.save()

        # Serialize the order and return the response
        serializer = OrderSerializer(order)
        return Response({
            "message": "Order placed successfully",
            "order": serializer.data,  # Serialized order with order_date, customer name, etc.
            "total_amount": str(order.total_amount),  # Total amount as string to avoid precision issues
            "vat": str(vat_amount)  # VAT amount as string for precision
        }, status=status.HTTP_201_CREATED)

# Generate Invoice View
@api_view(['GET'])
def generate_invoice(request, order_id):
    order = get_object_or_404(Order, id=order_id)
    order_items = OrderItem.objects.filter(order=order)

    # Render HTML template for the invoice
    html_string = render_to_string('invoice_template.html', {'order': order, 'order_items': order_items})

    response = HttpResponse(content_type='application/pdf')
    response['Content-Disposition'] = f'attachment; filename="invoice_{order.id}.pdf"'

    # Generate PDF from the rendered HTML and return it as a response
    with tempfile.NamedTemporaryFile(delete=True) as temp_file:
        HTML(string=html_string).write_pdf(temp_file.name)
        with open(temp_file.name, 'rb') as pdf:
            response.write(pdf.read())

    return response


# Pagination class (optional but recommended for large datasets)
class OrderPagination(PageNumberPagination):
    page_size = 10  # You can adjust the page size

# Get Orders View
@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])  # You can adjust permissions as needed
def get_orders(request):
    # Check if a specific customer ID filter is provided
    customer_id = request.query_params.get('customer_id', None)
    status_filter = request.query_params.get('status', None)

    orders = Order.objects.all()

    if customer_id:
        orders = orders.filter(customer_id=customer_id)
    
    if status_filter:
        orders = orders.filter(status=status_filter)

    # Paginate the result
    paginator = OrderPagination()
    paginated_orders = paginator.paginate_queryset(orders, request)

    # Use the serializer to convert the orders to JSON format
    serializer = OrderSerializer(paginated_orders, many=True)

    return paginator.get_paginated_response(serializer.data)
@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def get_orders(request):
    customer_id = request.query_params.get('customer_id', None)
    status_filter = request.query_params.get('status', None)

    orders = Order.objects.all()

    if customer_id:
        orders = orders.filter(customer_id=customer_id)
    
    if status_filter:
        orders = orders.filter(status=status_filter)

    paginator = OrderPagination()
    paginated_orders = paginator.paginate_queryset(orders, request)

    # Use the serializer to convert the orders to JSON format
    serializer = OrderSerializer(paginated_orders, many=True)

    return paginator.get_paginated_response(serializer.data)
