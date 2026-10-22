
from django.contrib import admin
from django.urls import path, include
from .views import frontend

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include("api.urls")),
    path('', frontend, name='home'),
]
