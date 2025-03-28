from django.db import models

class Manufacturer(models.Model):
    name = models.CharField(max_length=255)
    contact_name = models.CharField(max_length=255)
    contact_email = models.EmailField()
    contact_phone = models.CharField(max_length=15)
    address = models.TextField()

    def __str__(self):
        return self.name
