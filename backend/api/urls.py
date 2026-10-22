from django.urls import path
from .views import create_order, csrf_token, hello, products

urlpatterns = [
    path('hello/', hello),
    path('products/', products, name='products'),
    path('csrf/', csrf_token, name='csrf-token'),
    path('orders/', create_order, name='create-order'),
]
