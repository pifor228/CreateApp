from django.shortcuts import render
from django.http import JsonResponse


def hello(request):
    return JsonResponse({
        "message" : "Привет из джанго",
        "status": "success"
    })
