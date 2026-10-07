from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import AudioViewSet, VideoViewSet, livestream_status

router = DefaultRouter()
router.register(r'audio', AudioViewSet)
router.register(r'video', VideoViewSet)

urlpatterns = [
    path('live/', livestream_status, name='livestream-status'),
    path('', include(router.urls)),
]
