import json
import re

from django.db import transaction
from django.http import JsonResponse
from django.middleware.csrf import get_token
from django.views.decorators.csrf import ensure_csrf_cookie
from django.views.decorators.http import require_GET, require_POST

from .models import Order, OrderItem, Product


def _product_data(product):
    return {
        'id': product.pk,
        'name': product.name,
        'category': product.category,
        'price': product.price,
        'image': product.image,
        'badge': product.badge,
        'stock': product.stock,
    }


@require_GET
@ensure_csrf_cookie
def products(request):
    return JsonResponse({
        'products': [
            _product_data(product)
            for product in Product.objects.filter(is_active=True)
        ],
        'csrfToken': get_token(request),
    })


@require_GET
@ensure_csrf_cookie
def csrf_token(request):
    return JsonResponse({'csrfToken': get_token(request)})


def _error(message, status):
    return JsonResponse({'error': message}, status=status)


@require_POST
def create_order(request):
    if request.content_type != 'application/json':
        return _error('Ожидается запрос с Content-Type: application/json.', 415)

    if len(request.body) > 65_536:
        return _error('Запрос слишком большой.', 413)

    try:
        payload = json.loads(request.body)
    except (json.JSONDecodeError, UnicodeDecodeError):
        return _error('Некорректный JSON.', 400)

    if not isinstance(payload, dict):
        return _error('Ожидается JSON-объект.', 400)

    customer_name = payload.get('customerName')
    phone = payload.get('phone')
    address = payload.get('address')
    items = payload.get('items')

    if not isinstance(customer_name, str) or not 2 <= len(customer_name.strip()) <= 120:
        return _error('Укажите имя длиной от 2 до 120 символов.', 400)

    if (
        not isinstance(phone, str)
        or not re.fullmatch(r'[+()\d\s.-]{7,24}', phone.strip())
        or sum(character.isdigit() for character in phone) < 7
    ):
        return _error('Укажите корректный номер телефона.', 400)

    if not isinstance(address, str) or not 5 <= len(address.strip()) <= 300:
        return _error('Укажите адрес доставки длиной от 5 до 300 символов.', 400)

    if not isinstance(items, list) or not 1 <= len(items) <= 50:
        return _error('В заказе должно быть от 1 до 50 товаров.', 400)

    quantities = {}
    for item in items:
        if not isinstance(item, dict):
            return _error('Некорректная позиция заказа.', 400)
        product_id = item.get('productId')
        quantity = item.get('quantity')
        if (
            isinstance(product_id, bool)
            or not isinstance(product_id, int)
            or product_id < 1
        ):
            return _error('Некорректный идентификатор товара.', 400)
        if isinstance(quantity, bool) or not isinstance(quantity, int) or not 1 <= quantity <= 99:
            return _error('Количество товара должно быть от 1 до 99.', 400)
        quantities[product_id] = quantities.get(product_id, 0) + quantity
        if quantities[product_id] > 99:
            return _error('Нельзя заказать больше 99 единиц одного товара.', 400)

    with transaction.atomic():
        locked_products = list(
            Product.objects.select_for_update()
            .filter(pk__in=quantities, is_active=True)
            .order_by('pk')
        )
        products_by_id = {product.pk: product for product in locked_products}

        if len(products_by_id) != len(quantities):
            return _error('Один или несколько товаров больше недоступны.', 400)

        for product_id, quantity in quantities.items():
            if products_by_id[product_id].stock < quantity:
                return _error(
                    f'Недостаточно товара «{products_by_id[product_id].name}» на складе.',
                    409,
                )

        total = sum(
            products_by_id[product_id].price * quantity
            for product_id, quantity in quantities.items()
        )
        order = Order.objects.create(
            customer_name=customer_name.strip(),
            phone=phone.strip(),
            address=address.strip(),
            total=total,
        )
        order_items = []
        for product_id, quantity in quantities.items():
            product = products_by_id[product_id]
            order_items.append(OrderItem(
                order=order,
                product=product,
                product_name=product.name,
                unit_price=product.price,
                quantity=quantity,
            ))
            product.stock -= quantity
            product.save(update_fields=('stock',))
        OrderItem.objects.bulk_create(order_items)

    return JsonResponse(
        {
            'order': {
                'id': order.pk,
                'status': order.status,
                'total': order.total,
                'createdAt': order.created_at.isoformat(),
            },
            'products': [
                _product_data(product)
                for product in Product.objects.filter(pk__in=quantities)
            ],
            'message': 'Заказ принят. Мы свяжемся с вами для подтверждения.',
        },
        status=201,
    )


@require_GET
def hello(request):
    return JsonResponse({
        'message': 'Привет из Джанго',
        'status': 'success',
    })
