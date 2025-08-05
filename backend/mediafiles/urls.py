from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import AudioViewSet, VideoViewSet

router = DefaultRouter()
router.register(r'audio', AudioViewSet)
router.register(r'video', VideoViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
