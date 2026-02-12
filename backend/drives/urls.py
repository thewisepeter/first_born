# drives/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    DriveViewSet, 
    DriveContributionViewSet,
    DriveUpdateViewSet,
    ActiveDrivesView
)

router = DefaultRouter()
router.register(r'drives', DriveViewSet, basename='drive')
router.register(r'contributions', DriveContributionViewSet, basename='contribution')
router.register(r'updates', DriveUpdateViewSet, basename='drive-update')

urlpatterns = [
    path('', include(router.urls)),
    path('drives/active/', ActiveDrivesView.as_view(), name='active-drives'),
]