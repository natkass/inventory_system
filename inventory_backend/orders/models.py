from django.db import models
from django.core.exceptions import ValidationError
from products.models import Product
from customers.models import Customer
class Order(models.Model):
    customer = models.ForeignKey(Customer,null=True,blank=True ,related_name='orders', on_delete=models.CASCADE)
    products = models.ManyToManyField(Product, through='OrderItem')
    total_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    order_date = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=50, choices=[('pending', 'Pending'), ('completed', 'Completed'),('reversed', 'Reversed')])

    def __str__(self):
        return self.customer.name if self.customer else "No customer"
    
class OrderItem(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE)
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField()
    price = models.DecimalField(max_digits=10, decimal_places=2)

    def clean(self):
        """ Ensure ordered quantity is available """
        if self.quantity > self.product.quantity:
            raise ValidationError(f"Not enough stock for {self.product.name}. Available: {self.product.quantity}")

    def save(self, *args, **kwargs):
        self.full_clean()  # Ensure stock validation before saving
        self.product.quantity -= self.quantity  # Deduct stock
        self.product.save()
        super().save(*args, **kwargs)
