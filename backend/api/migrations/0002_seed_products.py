from django.db import migrations


PRODUCTS = [
    (
        'Ваза «Тихое утро»',
        'Керамика',
        3200,
        'https://images.unsplash.com/photo-1578500494198-246f612d3b3d?auto=format&fit=crop&w=900&q=85',
        'Хит',
        20,
    ),
    (
        'Льняная скатерть',
        'Текстиль',
        4900,
        'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=900&q=85',
        '',
        20,
    ),
    (
        'Чашка «Облако»',
        'Керамика',
        1800,
        'https://images.unsplash.com/photo-1577937927133-66ef06acdf18?auto=format&fit=crop&w=900&q=85',
        'Новинка',
        20,
    ),
    (
        'Подсвечник «Форма»',
        'Для дома',
        2400,
        'https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=900&q=85',
        '',
        20,
    ),
    (
        'Настольная лампа',
        'Свет',
        8700,
        'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=900&q=85',
        'Мало осталось',
        8,
    ),
    (
        'Плед «Тёплый песок»',
        'Текстиль',
        6200,
        'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=900&q=85',
        '',
        20,
    ),
    (
        'Керамическая ваза',
        'Керамика',
        3900,
        'https://images.unsplash.com/photo-1577937927133-66ef06acdf18?auto=format&fit=crop&w=900&q=85',
        '',
        20,
    ),
    (
        'Диффузор «Лес после дождя»',
        'Для дома',
        2900,
        'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&w=900&q=85',
        '',
        20,
    ),
]


def seed_products(apps, schema_editor):
    Product = apps.get_model('api', 'Product')
    Product.objects.bulk_create(
        Product(
            name=name,
            category=category,
            price=price,
            image=image,
            badge=badge,
            stock=stock,
        )
        for name, category, price, image, badge, stock in PRODUCTS
    )


def remove_seed_products(apps, schema_editor):
    Product = apps.get_model('api', 'Product')
    Product.objects.filter(name__in=[product[0] for product in PRODUCTS]).delete()


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0001_initial'),
    ]

    operations = [
        migrations.RunPython(seed_products, remove_seed_products),
    ]
