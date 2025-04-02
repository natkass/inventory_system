from rest_framework import viewsets
from .models import Manufacturer
from .serializers import ManufacturerSerializer


class ManufacturerViewSet(viewsets.ModelViewSet):
    queryset = Manufacturer.objects.all()
    serializer_class = ManufacturerSerializer
