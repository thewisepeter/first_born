# drives/views.py
from rest_framework import viewsets, generics, status, permissions
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.pagination import PageNumberPagination
from django.db.models import Q, Sum, Count
from django.shortcuts import get_object_or_404
from django.utils import timezone

from partners.models import Partner
from .models import Drive, DriveContribution, DriveUpdate
from .permissions import IsAdminUser, IsAdminOrReadOnly
from .serializers import (
    DriveListSerializer, DriveDetailSerializer, 
    DriveCreateUpdateSerializer, DriveUpdateSerializer,
    ContributionCreateSerializer, DriveContributionSerializer
)


class StandardPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 100


class DrivePagination(StandardPagination):
    page_size = 2  # Match your frontend requirement


class IsAdminOrReadOnly(permissions.BasePermission):
    """Permission: Admin can do everything, others can only read"""
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return request.user and request.user.is_staff


class DriveViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Drives.
    Admin can create/edit, all partners can view.
    """
    permission_classes = [permissions.IsAuthenticated, IsAdminOrReadOnly]
    pagination_class = DrivePagination
    
    def get_queryset(self):
        """Return drives based on query parameters"""
        queryset = Drive.objects.filter(is_published=True)
        
        # Filter by status
        status_filter = self.request.query_params.get('status', None)
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        
        # Filter by category
        category_filter = self.request.query_params.get('category', None)
        if category_filter:
            queryset = queryset.filter(category=category_filter)
        
        # Filter by featured
        featured = self.request.query_params.get('featured', None)
        if featured is not None:
            queryset = queryset.filter(is_featured=featured.lower() == 'true')
        
        # Filter by urgent
        urgent = self.request.query_params.get('urgent', None)
        if urgent is not None:
            queryset = queryset.filter(is_urgent=urgent.lower() == 'true')
        
        # Filter active drives (for main listing)
        active_only = self.request.query_params.get('active_only', None)
        if active_only is not None and active_only.lower() == 'true':
            queryset = queryset.filter(status='active')
            if self.action == 'list':
                # For listing, also check dates
                from datetime import date
                today = date.today()
                queryset = queryset.filter(
                    Q(end_date__gte=today) | Q(end_date__isnull=True)
                )
        
        return queryset.select_related('created_by')
    
    def get_serializer_class(self):
        if self.action == 'list':
            return DriveListSerializer
        elif self.action == 'retrieve':
            return DriveDetailSerializer
        elif self.action in ['create', 'update', 'partial_update']:
            return DriveCreateUpdateSerializer
        return DriveListSerializer
    
    def perform_create(self, serializer):
        """Set created_by to current user (admin)"""
        serializer.save(created_by=self.request.user)
    
    def retrieve(self, request, *args, **kwargs):
        """Record view when retrieving drive detail"""
        instance = self.get_object()
        instance.record_view()
        return super().retrieve(request, *args, **kwargs)
    
    @action(detail=False, methods=['get'])
    def stats(self, request):
        """Get drives statistics"""
        total_drives = Drive.objects.filter(is_published=True).count()
        active_drives = Drive.objects.filter(
            status='active', 
            is_published=True
        ).count()
        
        total_raised = Drive.objects.filter(is_published=True).aggregate(
            total=Sum('current_amount')
        )['total'] or 0
        
        total_goal = Drive.objects.filter(is_published=True).aggregate(
            total=Sum('goal_amount')
        )['total'] or 0
        
        return Response({
            'total_drives': total_drives,
            'active_drives': active_drives,
            'total_raised': total_raised,
            'total_goal': total_goal,
            'overall_progress': (total_raised / total_goal * 100) if total_goal > 0 else 0
        })
    
    @action(detail=True, methods=['get'])
    def updates(self, request, pk=None):
        """Get updates for a specific drive"""
        drive = self.get_object()
        updates = drive.updates.all()
        serializer = DriveUpdateSerializer(updates, many=True)
        return Response(serializer.data)


class DriveContributionViewSet(viewsets.ModelViewSet):
    """Simple contributions - partners can contribute to drives"""
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = DriveContributionSerializer
    
    def get_queryset(self):
        """Partners can only see their own contributions"""
        try:
            partner = self.request.user.partner_profile
            return DriveContribution.objects.filter(
                partner=partner
            ).order_by('-contributed_at')
        except Partner.DoesNotExist:
            # Return empty queryset if no partner profile
            return DriveContribution.objects.none()
    
    def get_serializer_class(self):
        if self.action == 'create':
            return ContributionCreateSerializer
        return self.serializer_class
    
    def create(self, request, *args, **kwargs):
        """Create a contribution to a drive"""
        serializer = ContributionCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        drive_id = request.data.get('drive')
        drive = get_object_or_404(Drive, id=drive_id, is_published=True, status='active')
        
        # Check if user has partner profile
        try:
            partner = request.user.partner_profile
        except Partner.DoesNotExist:
            return Response(
                {'error': 'You need a partner profile to make contributions.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Create contribution
        contribution = DriveContribution.objects.create(
            drive=drive,
            partner=partner,
            amount=serializer.validated_data['amount'],
            is_anonymous=serializer.validated_data.get('is_anonymous', False),
            message=serializer.validated_data.get('message', '')
        )
        
        # Update drive totals
        drive.current_amount += contribution.amount
        drive.contributions_count += 1
        drive.save()
        
        return Response({
            'message': 'Contribution successful!',
            'contribution_id': contribution.id,
            'amount': contribution.amount
        }, status=status.HTTP_201_CREATED)
    
class DriveUpdateViewSet(viewsets.ModelViewSet):
    """
    ViewSet for drive updates.
    ONLY ADMIN can create/update/delete.
    All authenticated partners can READ.
    """
    serializer_class = DriveUpdateSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdminOrReadOnly]
    
    def get_queryset(self):
        # Partners can only see approved updates
        queryset = DriveUpdate.objects.all()

        # Filter by drive if specified
        drive_id = self.request.query_params.get('drive_id', None)
        if drive_id:
            queryset = queryset.filter(drive_id=drive_id)
        
        
        # Admin can see all updates (including pending)
        if self.request.user.is_staff:
            queryset = DriveUpdate.objects.all()
        
        # Filter by drive if specified
        drive_id = self.request.query_params.get('drive_id', None)
        if drive_id:
            queryset = queryset.filter(drive_id=drive_id)
        
        return queryset.select_related('author', 'drive')
    
    def get_serializer_class(self):
        # Use admin-only serializer for create/update
        if self.action in ['create', 'update', 'partial_update']:
            return DriveCreateUpdateSerializer
        return DriveUpdateSerializer
    
    def perform_create(self, serializer):
        # Automatically set the author to current user (admin)
        serializer.save(author=self.request.user)
    
    def create(self, request, *args, **kwargs):
        # Double-check admin status before creation
        if not request.user.is_staff:
            return Response(
                {'error': 'Only administrators can create drive updates.'},
                status=status.HTTP_403_FORBIDDEN
            )
        return super().create(request, *args, **kwargs)
    
    def update(self, request, *args, **kwargs):
        # Double-check admin status before update
        if not request.user.is_staff:
            return Response(
                {'error': 'Only administrators can update drive updates.'},
                status=status.HTTP_403_FORBIDDEN
            )
        return super().update(request, *args, **kwargs)
    
    def destroy(self, request, *args, **kwargs):
        # Double-check admin status before delete
        if not request.user.is_staff:
            return Response(
                {'error': 'Only administrators can delete drive updates.'},
                status=status.HTTP_403_FORBIDDEN
            )
        return super().destroy(request, *args, **kwargs)

class ActiveDrivesView(generics.ListAPIView):
    """View specifically for active drives (optimized for dashboard)"""
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = DriveListSerializer
    pagination_class = DrivePagination
    
    def get_queryset(self):
        from datetime import date
        today = date.today()
        
        return Drive.objects.filter(
            status='active',
            is_published=True
        ).filter(
            Q(end_date__gte=today) | Q(end_date__isnull=True)
        ).order_by('-is_featured', '-created_at')