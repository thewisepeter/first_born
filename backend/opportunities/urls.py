# opportunities/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    OpportunityViewSet,
    ActiveOpportunitiesView
)

router = DefaultRouter()
router.register(r'opportunities', OpportunityViewSet, basename='opportunity')


urlpatterns = [
    path('', include(router.urls)),
    path('active/', ActiveOpportunitiesView.as_view(), name='active-opportunities'),
    path('stats/', OpportunityViewSet.as_view({'get': 'stats'}), name='opportunity-stats'),
]