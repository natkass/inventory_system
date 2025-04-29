from django.urls import path
from . import views
from .views import dashboard_summary

urlpatterns = [
    path('create/', views.create_order, name='create_order'),
    path('invoice/<int:order_id>/', views.generate_invoice, name='generate_invoice'),
    path('get/', views.get_orders, name="get_orders"),
    path('complete/<int:order_id>/', views.complete_order, name='complete_order'),
    path('reverse/<int:order_id>/', views.reverse_order, name='reverse-order'),
    path("dashboard/", dashboard_summary, name="dashboard-summary"),
    # path("summary/", views.OrderSummaryView.as_view(), name="order-summary"),
    # path("chart/", views.OrderChartDataView.as_view(), name="order-chart-data"),

]
