from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action
from .models import Product
from .serializers import ProductSerializer

class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer

    def create(self, request, *args, **kwargs):
        """ Handles adding a new product """
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def update(self, request, *args, **kwargs):
        """ Handles editing a product """
        product = self.get_object()
        serializer = self.get_serializer(product, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def destroy(self, request, *args, **kwargs):
        """ Handles deleting a product """
        product = self.get_object()
        product.delete()
        return Response({"message": "Product deleted successfully"}, status=status.HTTP_204_NO_CONTENT)

    @action(detail=False, methods=['get'])
    def list_products(self, request):
        """ Fetches all products """
        products = Product.objects.all()
        serializer = self.get_serializer(products, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
