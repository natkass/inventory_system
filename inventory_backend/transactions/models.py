from django.db import models

class Transaction(models.Model):
    TRANSACTION_TYPES = (
        ('purchase', 'Purchase'),
        ('sale', 'Sale'),
        ('adjustment', 'Adjustment'),
    )

    product = models.ForeignKey('products.Product', related_name='transactions', on_delete=models.CASCADE)
    transaction_type = models.CharField(max_length=50, choices=TRANSACTION_TYPES)
    quantity = models.IntegerField()
    price_per_item = models.DecimalField(max_digits=10, decimal_places=2)
    total_price = models.DecimalField(max_digits=12, decimal_places=2)
    date = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):
        self.total_price = self.quantity * self.price_per_item
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.transaction_type} of {self.quantity} {self.product.name} at {self.date}"
