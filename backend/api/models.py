from django.db import models


class Product(models.Model):
    class Category(models.TextChoices):
        CERAMICS = 'Керамика', 'Керамика'
        TEXTILES = 'Текстиль', 'Текстиль'
        HOME = 'Для дома', 'Для дома'
        LIGHTING = 'Свет', 'Свет'

    name = models.CharField(max_length=160)
    category = models.CharField(max_length=32, choices=Category.choices)
    price = models.PositiveIntegerField()
    image = models.URLField(max_length=500)
    badge = models.CharField(max_length=48, blank=True)
    stock = models.PositiveIntegerField(default=20)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ('id',)

    def __str__(self):
        return self.name


class Order(models.Model):
    class Status(models.TextChoices):
        NEW = 'new', 'Новый'
        PROCESSING = 'processing', 'В обработке'
        COMPLETED = 'completed', 'Завершён'
        CANCELLED = 'cancelled', 'Отменён'

    customer_name = models.CharField(max_length=120)
    phone = models.CharField(max_length=32)
    address = models.CharField(max_length=300)
    status = models.CharField(
        max_length=16,
        choices=Status.choices,
        default=Status.NEW,
    )
    total = models.PositiveIntegerField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ('-created_at',)

    def __str__(self):
        return f'Заказ №{self.pk}'


class OrderItem(models.Model):
    order = models.ForeignKey(
        Order,
        related_name='items',
        on_delete=models.CASCADE,
    )
    product = models.ForeignKey(Product, on_delete=models.PROTECT)
    product_name = models.CharField(max_length=160)
    unit_price = models.PositiveIntegerField()
    quantity = models.PositiveIntegerField()

    def __str__(self):
        return f'{self.product_name} × {self.quantity}'
