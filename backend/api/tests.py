from django.test import TestCase
from django.urls import reverse

from .models import Order, OrderItem, Product


class ProductApiTests(TestCase):
    def setUp(self):
        Product.objects.all().delete()
        self.product = Product.objects.create(
            name='Тестовая ваза',
            category=Product.Category.CERAMICS,
            price=3200,
            image='https://example.com/vase.jpg',
            stock=4,
        )

    def test_products_returns_active_catalog_and_csrf_token(self):
        Product.objects.create(
            name='Скрытый товар',
            category=Product.Category.HOME,
            price=500,
            image='https://example.com/hidden.jpg',
            is_active=False,
        )

        response = self.client.get(reverse('products'))

        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.json()['products']), 1)
        self.assertEqual(response.json()['products'][0]['id'], self.product.pk)
        self.assertTrue(response.json()['csrfToken'])
        self.assertIn('csrftoken', response.cookies)

    def test_order_uses_server_prices_and_decreases_stock(self):
        response = self.client.post(
            reverse('create-order'),
            data={
                'customerName': 'Анна Иванова',
                'phone': '+7 999 123-45-67',
                'address': 'Москва, Тверская улица, 1',
                'items': [{'productId': self.product.pk, 'quantity': 2}],
            },
            content_type='application/json',
        )

        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.json()['order']['total'], 6400)
        self.assertEqual(Order.objects.count(), 1)
        self.assertEqual(OrderItem.objects.get().unit_price, 3200)
        self.product.refresh_from_db()
        self.assertEqual(self.product.stock, 2)

    def test_order_ignores_client_price(self):
        response = self.client.post(
            reverse('create-order'),
            data={
                'customerName': 'Анна Иванова',
                'phone': '+7 999 123-45-67',
                'address': 'Москва, Тверская улица, 1',
                'items': [{
                    'productId': self.product.pk,
                    'quantity': 1,
                    'price': 1,
                }],
            },
            content_type='application/json',
        )

        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.json()['order']['total'], 3200)

    def test_order_rejects_insufficient_stock_without_saving(self):
        response = self.client.post(
            reverse('create-order'),
            data={
                'customerName': 'Анна Иванова',
                'phone': '+7 999 123-45-67',
                'address': 'Москва, Тверская улица, 1',
                'items': [{'productId': self.product.pk, 'quantity': 5}],
            },
            content_type='application/json',
        )

        self.assertEqual(response.status_code, 409)
        self.assertEqual(Order.objects.count(), 0)
        self.product.refresh_from_db()
        self.assertEqual(self.product.stock, 4)

    def test_order_rejects_invalid_payload(self):
        response = self.client.post(
            reverse('create-order'),
            data={'customerName': '', 'phone': 'abc', 'items': []},
            content_type='application/json',
        )

        self.assertEqual(response.status_code, 400)
        self.assertEqual(Order.objects.count(), 0)

    def test_order_requires_csrf_token(self):
        client = self.client_class(enforce_csrf_checks=True)
        response = client.post(
            reverse('create-order'),
            data={
                'customerName': 'Анна Иванова',
                'phone': '+7 999 123-45-67',
                'address': 'Москва, Тверская улица, 1',
                'items': [{'productId': self.product.pk, 'quantity': 1}],
            },
            content_type='application/json',
        )

        self.assertEqual(response.status_code, 403)

        token_response = client.get(reverse('csrf-token'))
        token = token_response.json()['csrfToken']
        response = client.post(
            reverse('create-order'),
            data={
                'customerName': 'Анна Иванова',
                'phone': '+7 999 123-45-67',
                'address': 'Москва, Тверская улица, 1',
                'items': [{'productId': self.product.pk, 'quantity': 1}],
            },
            content_type='application/json',
            HTTP_X_CSRFTOKEN=token,
        )
        self.assertEqual(response.status_code, 201)
