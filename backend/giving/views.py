# giving/views.py
from rest_framework import viewsets, generics, status, permissions
from rest_framework.response import Response
from rest_framework.decorators import action
from django.shortcuts import get_object_or_404
from django.db.models import Sum, Count, Q
from django.utils import timezone
from datetime import date, timedelta
import calendar

from partners.models import Partner
from .models import Giving, GivingGoal, GivingStatement, ScheduledGiving
from .serializers import (
    GivingSerializer, GivingCreateSerializer, GivingGoalSerializer,
    GivingStatementSerializer, ScheduledGivingSerializer,
    ScheduledGivingCreateSerializer, GivingStatsSerializer
)


class IsPartnerOwnerOrAdmin(permissions.BasePermission):
    """
    Permission to only allow:
    - Partner to access their own data
    - Admin to access any data
    """
    def has_object_permission(self, request, view, obj):
        # Admin can do anything
        if request.user.is_staff:
            return True
        
        # Partner can only access their own data
        if hasattr(obj, 'partner'):
            return obj.partner.user == request.user
        elif hasattr(obj, 'user'):
            return obj.user == request.user
        
        return False


class GivingViewSet(viewsets.ModelViewSet):
    """
    ViewSet for partner giving history.
    Partner can view their own, admin can view all.
    """
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = GivingSerializer
    
    def get_queryset(self):
        """Filter giving records based on user permissions"""
        if self.request.user.is_staff:
            # Admin can see all
            return Giving.objects.all().select_related('partner__user')
        
        # Partner can only see their own
        try:
            partner = self.request.user.partner_profile
            return Giving.objects.filter(partner=partner)
        except Partner.DoesNotExist:
            return Giving.objects.none()
    
    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return GivingCreateSerializer
        return GivingSerializer
    
    def create(self, request, *args, **kwargs):
        """Only admin can create giving records directly"""
        if not request.user.is_staff:
            return Response(
                {'error': 'Only administrators can create giving records directly.'},
                status=status.HTTP_403_FORBIDDEN
            )
        return super().create(request, *args, **kwargs)
    
    def update(self, request, *args, **kwargs):
        """Only admin can update giving records"""
        if not request.user.is_staff:
            return Response(
                {'error': 'Only administrators can update giving records.'},
                status=status.HTTP_403_FORBIDDEN
            )
        return super().update(request, *args, **kwargs)
    
    def destroy(self, request, *args, **kwargs):
        """Only admin can delete giving records"""
        if not request.user.is_staff:
            return Response(
                {'error': 'Only administrators can delete giving records.'},
                status=status.HTTP_403_FORBIDDEN
            )
        return super().destroy(request, *args, **kwargs)
    
    @action(detail=False, methods=['get'])
    def stats(self, request):
        """Get giving statistics for the current partner"""
        try:
            partner = request.user.partner_profile
        except Partner.DoesNotExist:
            return Response(
                {'error': 'Partner profile not found.'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Calculate date ranges
        today = date.today()
        first_day_of_month = today.replace(day=1)
        
        # Get this month's giving
        this_month_giving = Giving.objects.filter(
            partner=partner,
            status='completed',
            date__gte=first_day_of_month,
            date__lte=today
        ).aggregate(total=Sum('amount'))['total'] or 0
        
        # Get last month's giving
        last_day_of_last_month = first_day_of_month - timedelta(days=1)
        first_day_of_last_month = last_day_of_last_month.replace(day=1)
        
        last_month_giving = Giving.objects.filter(
            partner=partner,
            status='completed',
            date__gte=first_day_of_last_month,
            date__lte=last_day_of_last_month
        ).aggregate(total=Sum('amount'))['total'] or 0
        
        # Calculate month-over-month change
        if last_month_giving > 0:
            month_over_month_change = ((this_month_giving - last_month_giving) / last_month_giving) * 100
        else:
            month_over_month_change = 100 if this_month_giving > 0 else 0
        
        # Get active monthly goal
        monthly_goal = 0
        try:
            current_goal = GivingGoal.objects.get(
                partner=partner,
                period='monthly',
                start_date__lte=today,
                end_date__gte=today,
                is_active=True
            )
            monthly_goal = current_goal.target_amount
            goal_progress = (this_month_giving / monthly_goal * 100) if monthly_goal > 0 else 0
        except GivingGoal.DoesNotExist:
            goal_progress = 0
        
        # Get upcoming scheduled payments
        upcoming_payments = ScheduledGiving.objects.filter(
            partner=partner,
            status='active',
            next_payment_date__gte=today
        ).count()
        
        # Get total given
        total_given = Giving.objects.filter(
            partner=partner,
            status='completed'
        ).aggregate(total=Sum('amount'))['total'] or 0
        
        # Get giving by type (this month)
        by_type = Giving.objects.filter(
            partner=partner,
            status='completed',
            date__gte=first_day_of_month
        ).values('giving_type').annotate(total=Sum('amount'))
        
        by_type_dict = {item['giving_type']: item['total'] for item in by_type}
        
        # Get recent transactions
        recent_transactions = Giving.objects.filter(
            partner=partner
        ).order_by('-date')[:5]
        
        # Get active schedules
        active_schedules = ScheduledGiving.objects.filter(
            partner=partner,
            status='active'
        )
        
        stats = {
            'total_given': total_given,
            'monthly_goal': monthly_goal,
            'goal_progress': goal_progress,
            'upcoming_payments': upcoming_payments,
            'this_month_giving': this_month_giving,
            'last_month_giving': last_month_giving,
            'month_over_month_change': month_over_month_change,
            'by_type': by_type_dict,
            'recent_transactions': GivingSerializer(recent_transactions, many=True).data,
            'active_schedules': ScheduledGivingSerializer(active_schedules, many=True).data,
        }
        
        serializer = GivingStatsSerializer(stats)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def monthly_summary(self, request):
        """Get monthly summary for the current year"""
        try:
            partner = request.user.partner_profile
        except Partner.DoesNotExist:
            return Response(
                {'error': 'Partner profile not found.'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        year = request.query_params.get('year', date.today().year)
        
        # Get monthly totals for the year
        monthly_totals = []
        for month in range(1, 13):
            month_start = date(int(year), month, 1)
            month_end = date(int(year), month, calendar.monthrange(int(year), month)[1])
            
            total = Giving.objects.filter(
                partner=partner,
                status='completed',
                date__gte=month_start,
                date__lte=month_end
            ).aggregate(total=Sum('amount'))['total'] or 0
            
            monthly_totals.append({
                'month': month_start.strftime('%b'),
                'total': total,
                'month_number': month
            })
        
        return Response(monthly_totals)


class GivingGoalViewSet(viewsets.ModelViewSet):
    """ViewSet for giving goals"""
    permission_classes = [permissions.IsAuthenticated, IsPartnerOwnerOrAdmin]
    serializer_class = GivingGoalSerializer
    
    def get_queryset(self):
        """Filter goals based on user permissions"""
        if self.request.user.is_staff:
            return GivingGoal.objects.all()
        
        try:
            partner = self.request.user.partner_profile
            return GivingGoal.objects.filter(partner=partner)
        except Partner.DoesNotExist:
            return GivingGoal.objects.none()
    
    def perform_create(self, serializer):
        """Auto-set partner if not admin"""
        if not self.request.user.is_staff:
            partner = self.request.user.partner_profile
            serializer.save(partner=partner)
        else:
            serializer.save()


class GivingStatementViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for giving statements (read-only)"""
    permission_classes = [permissions.IsAuthenticated, IsPartnerOwnerOrAdmin]
    serializer_class = GivingStatementSerializer
    
    def get_queryset(self):
        """Filter statements based on user permissions"""
        if self.request.user.is_staff:
            return GivingStatement.objects.all()
        
        try:
            partner = self.request.user.partner_profile
            return GivingStatement.objects.filter(partner=partner)
        except Partner.DoesNotExist:
            return GivingStatement.objects.none()
    
    @action(detail=True, methods=['post'])
    def download(self, request, pk=None):
        """Record a statement download"""
        statement = self.get_object()
        statement.increment_download()
        
        return Response({
            'message': 'Download recorded',
            'download_count': statement.downloaded_count,
            'file_url': statement.file.url if statement.file else statement.file_url
        })
    
    @action(detail=False, methods=['post'])
    def generate(self, request):
        """Generate a new statement (admin only)"""
        if not request.user.is_staff:
            return Response(
                {'error': 'Only administrators can generate statements.'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # This would typically call a statement generation service
        # For now, return a placeholder
        return Response({
            'message': 'Statement generation request received',
            'note': 'This would typically generate a PDF and store it'
        })


class ScheduledGivingViewSet(viewsets.ModelViewSet):
    """ViewSet for scheduled giving"""
    permission_classes = [permissions.IsAuthenticated, IsPartnerOwnerOrAdmin]
    
    def get_queryset(self):
        """Filter schedules based on user permissions"""
        if self.request.user.is_staff:
            return ScheduledGiving.objects.all()
        
        try:
            partner = self.request.user.partner_profile
            return ScheduledGiving.objects.filter(partner=partner)
        except Partner.DoesNotExist:
            return ScheduledGiving.objects.none()
    
    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return ScheduledGivingCreateSerializer
        return ScheduledGivingSerializer
    
    @action(detail=True, methods=['post'])
    def pause(self, request, pk=None):
        """Pause a scheduled giving"""
        schedule = self.get_object()
        schedule.status = 'paused'
        schedule.save()
        
        return Response({
            'message': 'Scheduled giving paused',
            'status': schedule.status
        })
    
    @action(detail=True, methods=['post'])
    def resume(self, request, pk=None):
        """Resume a paused scheduled giving"""
        schedule = self.get_object()
        schedule.status = 'active'
        schedule.save()
        
        return Response({
            'message': 'Scheduled giving resumed',
            'status': schedule.status
        })
    
    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        """Cancel a scheduled giving"""
        schedule = self.get_object()
        schedule.status = 'cancelled'
        schedule.save()
        
        return Response({
            'message': 'Scheduled giving cancelled',
            'status': schedule.status
        })
    
    @action(detail=True, methods=['post'])
    def process_now(self, request, pk=None):
        """Process a scheduled payment immediately (admin only)"""
        if not request.user.is_staff:
            return Response(
                {'error': 'Only administrators can process payments immediately.'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        schedule = self.get_object()
        giving = schedule.process_payment()
        
        return Response({
            'message': 'Payment processed',
            'giving_id': giving.id,
            'transaction_id': giving.transaction_id
        })


class RecentGivingView(generics.ListAPIView):
    """Get recent giving for dashboard"""
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = GivingSerializer
    
    def get_queryset(self):
        """Get recent giving for current partner"""
        try:
            partner = self.request.user.partner_profile
            return Giving.objects.filter(
                partner=partner
            ).order_by('-date')[:10]
        except Partner.DoesNotExist:
            return Giving.objects.none()


class UpcomingPaymentsView(generics.ListAPIView):
    """Get upcoming scheduled payments"""
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = ScheduledGivingSerializer
    
    def get_queryset(self):
        """Get upcoming payments for current partner"""
        try:
            partner = self.request.user.partner_profile
            return ScheduledGiving.objects.filter(
                partner=partner,
                status='active',
                next_payment_date__gte=date.today()
            ).order_by('next_payment_date')
        except Partner.DoesNotExist:
            return ScheduledGiving.objects.none()