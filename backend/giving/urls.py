# giving/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    GivingViewSet, GivingGoalViewSet, GivingStatementViewSet,
    ScheduledGivingViewSet, RecentGivingView, UpcomingPaymentsView
)

router = DefaultRouter()
router.register(r'givings', GivingViewSet, basename='giving')
router.register(r'goals', GivingGoalViewSet, basename='goal')
router.register(r'statements', GivingStatementViewSet, basename='statement')
router.register(r'scheduled', ScheduledGivingViewSet, basename='scheduled')

urlpatterns = [
    path('', include(router.urls)),
    
    # Dashboard endpoints
    path('stats/', GivingViewSet.as_view({'get': 'stats'}), name='giving-stats'),
    path('recent/', RecentGivingView.as_view(), name='recent-giving'),
    path('upcoming/', UpcomingPaymentsView.as_view(), name='upcoming-payments'),
    path('monthly-summary/', GivingViewSet.as_view({'get': 'monthly_summary'}), name='monthly-summary'),
    
    # Statement generation
    path('statements/generate/', GivingStatementViewSet.as_view({'post': 'generate'}), name='generate-statement'),
]