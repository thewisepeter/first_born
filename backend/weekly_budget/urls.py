# weekly_budget/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    WeeklyBudgetViewSet, BudgetCategoryViewSet,
    BudgetContributionViewSet, CurrentWeeklyBudgetView,
    WeeklyBudgetStatsView
)

router = DefaultRouter()
router.register(r'budgets', WeeklyBudgetViewSet, basename='weekly-budget')
router.register(r'categories', BudgetCategoryViewSet, basename='budget-category')
router.register(r'contributions', BudgetContributionViewSet, basename='budget-contribution')

urlpatterns = [
    path('', include(router.urls)),
    
    # Special endpoints
    path('current/', CurrentWeeklyBudgetView.as_view(), name='current-weekly-budget'),
    path('stats/', WeeklyBudgetStatsView.as_view(), name='weekly-budget-stats'),
    
    # Budget actions
    path('budgets/<int:pk>/contribute/', WeeklyBudgetViewSet.as_view({'post': 'contribute'}), name='budget-contribute'),
    path('budgets/<int:pk>/contributions/', WeeklyBudgetViewSet.as_view({'get': 'contributions'}), name='budget-contributions'),
]