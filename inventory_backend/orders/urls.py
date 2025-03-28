from django.urls import path
from . import views

urlpatterns = [
    path('create/', views.create_order, name='create_order'),
    path('invoice/<int:order_id>/', views.generate_invoice, name='generate_invoice'),
    path('get/', views.get_orders, name="get_orders")
]
