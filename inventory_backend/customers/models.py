from django.db import models

class Customer(models.Model):
    name = models.CharField(max_length=255)
    tin = models.CharField(max_length=10, unique=True, null=True, blank=True)     
    email = models.EmailField()
    phone = models.CharField(max_length=15)
    address = models.TextField()

    def __str__(self):
        return self.name
