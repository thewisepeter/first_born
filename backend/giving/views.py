# giving/views.py
from rest_framework import viewsets, generics, status, permissions
from rest_framework.response import Response
from rest_framework.decorators import action

from django.shortcuts import get_object_or_404
from django.db.models import Sum, Count, Q
from django.utils import timezone
from django.http import FileResponse
from django.conf import settings
from django.core.files.base import ContentFile

from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import inch
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_RIGHT

from io import BytesIO

from datetime import datetime, date, timedelta
import calendar
import os

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
        """Allow partners to create their own giving records"""
        try:
            # Check if user has a partner profile
            partner = request.user.partner_profile
            
            # Add the partner to the request data
            mutable_data = request.data.copy()
            mutable_data['partner'] = partner.id
            
            serializer = self.get_serializer(data=mutable_data)
            serializer.is_valid(raise_exception=True)
            self.perform_create(serializer)
            
            headers = self.get_success_headers(serializer.data)
            return Response(
                serializer.data, 
                status=status.HTTP_201_CREATED, 
                headers=headers
            )
            
        except Partner.DoesNotExist:
            return Response(
                {'error': 'Partner profile not found.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
    
    def perform_create(self, serializer):
        """Save with the current user's partner profile"""
        serializer.save()
    
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
        """Generate a custom statement PDF"""
        try:
            partner = request.user.partner_profile
        except Partner.DoesNotExist:
            return Response(
                {'error': 'Partner profile not found.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        period_start = request.data.get('period_start')
        period_end = request.data.get('period_end')
        statement_type = request.data.get('statement_type', 'custom')
        
        if not period_start or not period_end:
            return Response(
                {'error': 'Period start and end dates are required.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Validate dates
        if period_start > period_end:
            return Response(
                {'error': 'Start date must be before end date.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # 1. Fetch giving data for this period
        giving_records = Giving.objects.filter(
            partner=partner,
            status='completed',
            date__gte=period_start,
            date__lte=period_end
        ).order_by('-date')

    
        
        # 2. Calculate totals
        total_amount = giving_records.aggregate(total=Sum('amount'))['total'] or 0
        transaction_count = giving_records.count()
        
        # 3. Generate PDF in memory
        pdf_buffer = self._generate_pdf(
            partner, 
            giving_records, 
            period_start, 
            period_end, 
            total_amount
        )
        
        # 4. Create filename
        filename = f"statement_{partner.id}_{period_start}_{period_end}.pdf"

        records_data = []
        for record in giving_records:
            records_data.append({
                'date': record.date.isoformat(),  # Convert date to string
                'amount': str(record.amount),
                'giving_type': record.giving_type
            })

        summary_data = {
            'records': records_data,
            'total': str(total_amount),
            'count': transaction_count
        }
        
        # 5. Create the database record with the file
        statement = GivingStatement(
            partner=partner,
            statement_type=statement_type,
            period_start=period_start,
            period_end=period_end,
            total_amount=total_amount,
            transaction_count=transaction_count,
            generated_by=request.user,
            summary_data=summary_data
        )
        
        # Save the PDF to the file field
        statement.file.save(filename, ContentFile(pdf_buffer.getvalue()), save=True)
        
        # 6. Build absolute URL
        file_url = request.build_absolute_uri(statement.file.url)
        
        return Response({
            'message': 'Statement generated successfully',
            'file_url': file_url,
            'statement_id': statement.id,
            'period_start': period_start,
            'period_end': period_end,
            'total_amount': str(total_amount),
            'transaction_count': transaction_count
        }, status=status.HTTP_201_CREATED)
    
    def _generate_pdf(self, partner, giving_records, start_date, end_date, total_amount):
        """Helper method to generate PDF and return BytesIO buffer"""
        
        # Create a buffer for the PDF
        buffer = BytesIO()
        
        # Create the PDF document
        doc = SimpleDocTemplate(buffer, pagesize=A4)
        styles = getSampleStyleSheet()
        elements = []
        
        # Title
        title_style = ParagraphStyle(
            'CustomTitle',
            parent=styles['Heading1'],
            alignment=TA_CENTER,
            fontSize=18,
            spaceAfter=30
        )
        elements.append(Paragraph(f"Giving Statement", title_style))
        
        # Partner info
        info_style = ParagraphStyle(
            'Info',
            parent=styles['Normal'],
            fontSize=12,
            spaceAfter=10
        )
        elements.append(Paragraph(f"Partner: {partner.user.get_full_name()}", info_style))
        elements.append(Paragraph(f"Email: {partner.user.email}", info_style))
        elements.append(Paragraph(f"Period: {start_date} to {end_date}", info_style))
        elements.append(Spacer(1, 20))
        
        # Summary
        summary_style = ParagraphStyle(
            'Summary',
            parent=styles['Normal'],
            fontSize=14,
            spaceAfter=5
        )
        elements.append(Paragraph(f"Total Given: UGX {total_amount:,.2f}", summary_style))
        elements.append(Paragraph(f"Number of Transactions: {giving_records.count()}", summary_style))
        elements.append(Spacer(1, 20))
        
        # Transactions table
        if giving_records.exists():
            data = [['Date', 'Transaction ID', 'Type', 'Amount (UGX)']]
            for record in giving_records:
                giving_type_display = record.giving_type.replace('_', ' ').title()
                data.append([
                    record.date.strftime('%Y-%m-%d'),
                    record.transaction_id,
                    giving_type_display,
                    f"{record.amount:,.2f}"
                ])
            
            # Add total row
            data.append(['', '', 'TOTAL', f"{total_amount:,.2f}"])
            
            table = Table(data, colWidths=[80, 150, 100, 100])
            table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
                ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
                ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
                ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                ('FONTSIZE', (0, 0), (-1, 0), 12),
                ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
                ('BACKGROUND', (0, 1), (-1, -2), colors.beige),
                ('BACKGROUND', (0, -1), (-1, -1), colors.lightgrey),
                ('FONTNAME', (0, -1), (-1, -1), 'Helvetica-Bold'),
                ('GRID', (0, 0), (-1, -1), 1, colors.black)
            ]))
            elements.append(table)
        
        # Footer
        elements.append(Spacer(1, 30))
        footer_style = ParagraphStyle(
            'Footer',
            parent=styles['Normal'],
            fontSize=10,
            alignment=TA_CENTER,
            textColor=colors.grey
        )
        elements.append(Paragraph(f"Generated on {timezone.now().strftime('%Y-%m-%d %H:%M')}", footer_style))
        
        # Build PDF
        doc.build(elements)
        
        # Reset buffer position to the beginning
        buffer.seek(0)
        
        return buffer
    
    @action(detail=True, methods=['post'])
    def download(self, request, pk=None):
        """Record a download and return the file"""
        statement = self.get_object()
        
        # Increment download count
        statement.increment_download()
        
        # Return the file
        if statement.file:
            return Response({
                'message': 'Download recorded',
                'download_count': statement.downloaded_count,
                'file_url': request.build_absolute_uri(statement.file.url)
            })
        else:
            return Response(
                {'error': 'File not found'},
                status=status.HTTP_404_NOT_FOUND
            )


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