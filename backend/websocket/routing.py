from django.urls import path
from . import consumers

websocket_urlpatterns = [
    path('ws/some_path/<str:id>/', consumers.MyWebSocketConsumer.as_asgi()),
]