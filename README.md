# Тихо — магазин предметов для дома

Проект включает React/Vite витрину и Django API. В production Django также отдаёт собранный интерфейс и статические файлы.

## Backend магазина

- `GET /api/products/` — активный каталог и CSRF-токен.
- `POST /api/orders/` — создать заказ. Сервер проверяет остатки и рассчитывает стоимость по каталогу, не доверяя цене из браузера.
- `/admin/` — управление товарами и заказами после создания суперпользователя.
- `GET /api/hello/` — проверочный endpoint.

Заказ сохраняет контакты покупателя, снимок цены товара и статус «Новый». Оплату и интеграцию доставки нужно подключить отдельно.

## Локальный запуск

Откройте два терминала из корня проекта.

Терминал 1 — Django:

```powershell
cd .\backend
..\venv\Scripts\python.exe manage.py migrate
..\venv\Scripts\python.exe manage.py runserver
```

Терминал 2 — витрина:

```powershell
cd .\miniapp
npm ci
npm run dev
```

Откройте адрес Vite, обычно <http://localhost:5173/>. Vite проксирует запросы `/api/` к Django на `127.0.0.1:8000`.

Чтобы управлять заказами через Django Admin, создайте администратора:

```powershell
cd .\backend
..\venv\Scripts\python.exe manage.py createsuperuser
```

Затем откройте <http://127.0.0.1:8000/admin/>.

## Публикация на GitHub и запуск сайта

GitHub хранит исходный код, но GitHub Pages не может запустить Django. Для демонстрационного развёртывания всего приложения используется бесплатный web service Render.

1. Отправьте проект в GitHub.
2. Войдите в [Render](https://render.com/) и создайте новый **Blueprint** из репозитория `pifor228/CreateApp`.
3. Render прочитает `render.yaml`, создаст web service и PostgreSQL, соберёт React и Django из `Dockerfile`, создаст секрет `DJANGO_SECRET_KEY` и запустит миграции.
4. После успешного deploy откройте адрес вида `https://createapp.onrender.com`.

Бесплатный Render может останавливать сервис после простоя; первый запрос после паузы может загружаться медленно. Бесплатный PostgreSQL имеет ограничения по доступности и хранению данных: перед использованием в production проверьте актуальные условия Render и настройте подходящий тариф и резервное копирование.

Не добавляйте секретный ключ, пароли или `.env` в GitHub. Для управления production-заказами создайте Django superuser через Shell сервиса Render командой `python manage.py createsuperuser`.
