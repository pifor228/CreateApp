# Тихо — магазин предметов для дома

Проект включает React/Vite витрину и Django API. В production Django также отдаёт собранный интерфейс и статические файлы.

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

## Публикация на GitHub и запуск сайта

GitHub хранит исходный код, но GitHub Pages не может запустить Django. Для демонстрационного развёртывания всего приложения используется бесплатный web service Render.

1. Отправьте проект в GitHub.
2. Войдите в [Render](https://render.com/) и создайте новый **Blueprint** из репозитория `pifor228/CreateApp`.
3. Render прочитает `render.yaml`, соберёт React и Django из `Dockerfile`, создаст секрет `DJANGO_SECRET_KEY` и запустит приложение.
4. После успешного deploy откройте адрес вида `https://createapp.onrender.com`.

Бесплатный Render может останавливать сервис после простоя; первый запрос после паузы может загружаться медленно. Локальная SQLite-база на бесплатном контейнере не предназначена для постоянного хранения данных. Сейчас каталог и корзина демонстрационные; оформление заказов и оплата не реализованы.

Для production с постоянными данными настройте PostgreSQL и задайте переменную окружения `DATABASE_URL` в Render. Не добавляйте секретный ключ, пароли или `.env` в GitHub.
