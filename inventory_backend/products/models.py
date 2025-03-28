from django.db import models
from categories.models import Category
from manufacturers.models import Manufacturer

class Product(models.Model):
    name = models.CharField(max_length=255)
    description = models.TextField()
    quantity = models.IntegerField()
    price = models.DecimalField(max_digits=10, decimal_places=2)
    category = models.ForeignKey(Category, related_name='products', on_delete=models.SET_NULL, null=True)
    manufacturer = models.ForeignKey(Manufacturer, related_name='products', on_delete=models.SET_NULL, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name
