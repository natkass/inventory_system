from rest_framework import serializers
from .models import Order, OrderItem, Customer

class OrderItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderItem
        fields = ['product', 'quantity', 'price', 'subtotal']

class OrderSerializer(serializers.ModelSerializer):
    order_items = OrderItemSerializer(many=True, read_only=True)  # Nested serializer for items
    customer_name = serializers.CharField(source='customer.name', read_only=True)  # Customer's name field
    order_date = serializers.DateTimeField(read_only=True)  # Read-only field for the order creation date
    class Meta:
        model = Order
        fields = ['id', 'status', 'total_amount', 'customer', 'customer_name', 'order_items', 'order_date']  # Add 'customer_name' to fields
