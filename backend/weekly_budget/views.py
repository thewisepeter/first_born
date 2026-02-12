# weekly_budget/views.py
from rest_framework import viewsets, generics, status, permissions
from rest_framework.response import Response
from rest_framework.decorators import action
from django.shortcuts import get_object_or_404
from django.db.models import Q, Sum, Count
from django.utils import timezone
from datetime import date, timedelta
import calendar

from .models import (
    WeeklyBudget, BudgetCategory, BudgetBreakdown,
    BudgetContribution, WeeklyBudgetStats
)
from .serializers import (
    WeeklyBudgetSerializer, WeeklyBudgetDetailSerializer,
    WeeklyBudgetCreateUpdateSerializer, BudgetCategorySerializer,
    BudgetBreakdownSerializer, BudgetContributionSerializer,
    BudgetContributionCreateSerializer, WeeklyBudgetStatsSerializer,
    CurrentWeeklyBudgetSerializer
)


class IsAdminOrReadOnly(permissions.BasePermission):
    """Permission: Admin can do everything, others can only read"""
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return request.user and request.user.is_staff


class BudgetCategoryViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for budget categories (read-only)"""
    queryset = BudgetCategory.objects.filter(is_active=True)
    serializer_class = BudgetCategorySerializer
    permission_classes = [permissions.IsAuthenticated]


class WeeklyBudgetViewSet(viewsets.ModelViewSet):
    """
    ViewSet for weekly budgets.
    Admin can create/edit, all partners can view.
    """
    permission_classes = [permissions.IsAuthenticated, IsAdminOrReadOnly]
    
    def get_queryset(self):
        """Get budgets based on filters"""
        queryset = WeeklyBudget.objects.filter(is_published=True)
        
        # Filter by status
        status_filter = self.request.query_params.get('status', None)
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        
        # Filter by year
        year_filter = self.request.query_params.get('year', None)
        if year_filter:
            queryset = queryset.filter(year=year_filter)
        
        # Filter by week
        week_filter = self.request.query_params.get('week', None)
        if week_filter:
            queryset = queryset.filter(week_number=week_filter)
        
        # Filter by date range
        start_date = self.request.query_params.get('start_date', None)
        end_date = self.request.query_params.get('end_date', None)
        if start_date:
            queryset = queryset.filter(start_date__gte=start_date)
        if end_date:
            queryset = queryset.filter(end_date__lte=end_date)
        
        return queryset.select_related('created_by').prefetch_related('breakdown_items')
    
    def get_serializer_class(self):
        if self.action == 'list':
            return WeeklyBudgetSerializer
        elif self.action == 'retrieve':
            return WeeklyBudgetDetailSerializer
        elif self.action in ['create', 'update', 'partial_update']:
            return WeeklyBudgetCreateUpdateSerializer
        return WeeklyBudgetSerializer
    
    def perform_create(self, serializer):
        """Set created_by to current user (admin)"""
        serializer.save(created_by=self.request.user)
    
    @action(detail=False, methods=['get'])
    def current(self, request):
        """Get current week's budget"""
        today = date.today()
        
        try:
            current_budget = WeeklyBudget.objects.get(
                start_date__lte=today,
                end_date__gte=today,
                status='active',
                is_published=True
            )
            serializer = CurrentWeeklyBudgetSerializer(current_budget)
            return Response(serializer.data)
        except WeeklyBudget.DoesNotExist:
            return Response(
                {'detail': 'No active budget for current week.'},
                status=status.HTTP_404_NOT_FOUND
            )
    
    @action(detail=False, methods=['get'])
    def stats(self, request):
        """Get weekly budget statistics"""
        # Get current week
        today = date.today()
        
        # Current week budget
        current_budget = WeeklyBudget.objects.filter(
            start_date__lte=today,
            end_date__gte=today,
            status='active',
            is_published=True
        ).first()
        
        # Previous week budget
        last_week_start = today - timedelta(days=7)
        last_week_end = today - timedelta(days=1)
        
        previous_budget = WeeklyBudget.objects.filter(
            start_date__lte=last_week_end,
            end_date__gte=last_week_start,
            is_published=True
        ).first()
        
        # Year-to-date totals
        year_start = date(today.year, 1, 1)
        ytd_totals = WeeklyBudget.objects.filter(
            start_date__gte=year_start,
            is_published=True
        ).aggregate(
            total_target=Sum('target_amount'),
            total_raised=Sum('current_amount'),
            total_budgets=Count('id')
        )
        
        # Weekly averages
        weekly_average = WeeklyBudget.objects.filter(
            start_date__gte=year_start,
            is_published=True
        ).aggregate(
            avg_target=Sum('target_amount') / Count('id'),
            avg_raised=Sum('current_amount') / Count('id')
        )
        
        stats = {
            'current_week': CurrentWeeklyBudgetSerializer(current_budget).data if current_budget else None,
            'previous_week': WeeklyBudgetSerializer(previous_budget).data if previous_budget else None,
            'year_to_date': {
                'total_target': ytd_totals['total_target'] or 0,
                'total_raised': ytd_totals['total_raised'] or 0,
                'total_budgets': ytd_totals['total_budgets'] or 0,
            },
            'weekly_averages': {
                'avg_target': weekly_average['avg_target'] or 0,
                'avg_raised': weekly_average['avg_raised'] or 0,
            }
        }
        
        return Response(stats)
    
    @action(detail=True, methods=['post'])
    def contribute(self, request, pk=None):
        """Make a contribution to this budget"""
        weekly_budget = self.get_object()
        
        serializer = BudgetContributionCreateSerializer(
            data=request.data,
            context={'request': request}
        )
        serializer.is_valid(raise_exception=True)
        
        # Create contribution
        contribution = serializer.save(weekly_budget=weekly_budget)
        
        return Response({
            'message': 'Contribution successful!',
            'contribution_id': contribution.id,
            'contribution_number': contribution.contribution_number,
            'current_total': weekly_budget.current_amount,
            'progress_percentage': weekly_budget.progress_percentage
        }, status=status.HTTP_201_CREATED)
    
    @action(detail=True, methods=['get'])
    def contributions(self, request, pk=None):
        """Get contributions for this budget"""
        weekly_budget = self.get_object()
        contributions = weekly_budget.contributions.all().select_related('partner__user', 'category')
        
        # Check if user wants their own contributions only
        mine_only = request.query_params.get('mine', '').lower() == 'true'
        if mine_only:
            try:
                partner = request.user.partner_profile
                contributions = contributions.filter(partner=partner)
            except:
                contributions = contributions.none()
        
        serializer = BudgetContributionSerializer(contributions, many=True)
        return Response(serializer.data)


class BudgetContributionViewSet(viewsets.ModelViewSet):
    """ViewSet for budget contributions"""
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = BudgetContributionSerializer
    
    def get_queryset(self):
        """Get current partner's contributions"""
        try:
            partner = self.request.user.partner_profile
            return BudgetContribution.objects.filter(
                partner=partner
            ).select_related('weekly_budget', 'category').order_by('-contributed_at')
        except:
            return BudgetContribution.objects.none()
    
    def get_serializer_class(self):
        if self.action == 'create':
            return BudgetContributionCreateSerializer
        return BudgetContributionSerializer


class CurrentWeeklyBudgetView(generics.RetrieveAPIView):
    """Get current week's budget"""
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = CurrentWeeklyBudgetSerializer
    
    def get_object(self):
        today = date.today()
        
        budget = get_object_or_404(
            WeeklyBudget.objects.select_related('created_by').prefetch_related('breakdown_items__category'),
            start_date__lte=today,
            end_date__gte=today,
            status='active',
            is_published=True
        )
        return budget


class WeeklyBudgetStatsView(generics.RetrieveAPIView):
    """Get comprehensive weekly budget statistics"""
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = WeeklyBudgetStatsSerializer
    
    def get_object(self):
        # Get or create stats for current week
        today = date.today()
        year, week_number, _ = today.isocalendar()
        
        stats, created = WeeklyBudgetStats.objects.get_or_create(
            year=year,
            week_number=week_number
        )
        
        if created or (timezone.now() - stats.generated_at).seconds > 3600:  # Update hourly
            self.update_stats(stats, year, week_number)
        
        return stats
    
    def update_stats(self, stats, year, week_number):
        """Update statistics for the given week"""
        # Get current week's budget
        try:
            weekly_budget = WeeklyBudget.objects.get(
                year=year,
                week_number=week_number,
                is_published=True
            )
            
            stats.total_target = weekly_budget.target_amount
            stats.total_raised = weekly_budget.current_amount
            
            # Count contributions and unique partners
            contributions = weekly_budget.contributions.all()
            stats.total_contributions = contributions.count()
            stats.total_partners = contributions.values('partner').distinct().count()
            
            # Category breakdown
            category_data = {}
            for breakdown in weekly_budget.breakdown_items.all():
                if breakdown.category:
                    category_data[breakdown.category.name] = {
                        'allocated': breakdown.allocated_amount,
                        'current': breakdown.current_amount,
                        'progress': breakdown.progress_percentage
                    }
            stats.category_breakdown = category_data
            
            # Previous week comparison
            last_week_start = date.today() - timedelta(days=7)
            last_year, last_week, _ = last_week_start.isocalendar()
            
            try:
                last_week_budget = WeeklyBudget.objects.get(
                    year=last_year,
                    week_number=last_week,
                    is_published=True
                )
                stats.previous_week_total = last_week_budget.current_amount
                if last_week_budget.current_amount > 0:
                    week_change = ((weekly_budget.current_amount - last_week_budget.current_amount) / 
                                  last_week_budget.current_amount) * 100
                    stats.week_over_week_change = week_change
            except WeeklyBudget.DoesNotExist:
                stats.previous_week_total = 0
                stats.week_over_week_change = 0
            
            stats.save()
            
        except WeeklyBudget.DoesNotExist:
            pass