# opportunities/views.py
from rest_framework import viewsets, generics, status, permissions
from rest_framework.response import Response
from rest_framework.decorators import action
from django.shortcuts import get_object_or_404
from django.db.models import Q, Count
from datetime import date

from partners.models import Partner
from .models import Opportunity
from .serializers import (
    OpportunityListSerializer,
    OpportunityDetailSerializer,
    OpportunityCreateUpdateSerializer,
)


class OpportunityViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Opportunities.
    Admin can create/edit, all partners can view.
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """Get opportunities based on filters"""
        queryset = Opportunity.objects.filter(status='active')
        
        # Filter by community
        community = self.request.query_params.get('community', None)
        if community:
            queryset = queryset.filter(community=community)
        
        # Filter by type
        opportunity_type = self.request.query_params.get('type', None)
        if opportunity_type:
            queryset = queryset.filter(opportunity_type=opportunity_type)
        
        # Filter by location (search)
        location = self.request.query_params.get('location', None)
        if location:
            queryset = queryset.filter(location__icontains=location)
        
        # Filter by remote/hybrid
        remote = self.request.query_params.get('remote', None)
        if remote is not None:
            queryset = queryset.filter(is_remote=remote.lower() == 'true')
        
        # Filter by featured
        featured = self.request.query_params.get('featured', None)
        if featured is not None:
            queryset = queryset.filter(is_featured=featured.lower() == 'true')
        
        # Filter by urgent
        urgent = self.request.query_params.get('urgent', None)
        if urgent is not None:
            queryset = queryset.filter(is_urgent=urgent.lower() == 'true')
        
        # Filter active opportunities only (not expired)
        today = date.today()
        queryset = queryset.filter(deadline__gte=today)
        
        return queryset.order_by('-is_featured', '-posted_date')
    
    def get_serializer_class(self):
        if self.action == 'list':
            return OpportunityListSerializer
        elif self.action == 'retrieve':
            return OpportunityDetailSerializer
        elif self.action in ['create', 'update', 'partial_update']:
            return OpportunityCreateUpdateSerializer
        return OpportunityListSerializer
    
    def retrieve(self, request, *args, **kwargs):
        """Record view when retrieving opportunity detail"""
        instance = self.get_object()
        instance.mark_as_viewed()
        return super().retrieve(request, *args, **kwargs)
    
    def create(self, request, *args, **kwargs):
        """Only admin can create opportunities"""
        if not request.user.is_staff:
            return Response(
                {'error': 'Only administrators can create opportunities.'},
                status=status.HTTP_403_FORBIDDEN
            )
        return super().create(request, *args, **kwargs)
    
    def update(self, request, *args, **kwargs):
        """Only admin can update opportunities"""
        if not request.user.is_staff:
            return Response(
                {'error': 'Only administrators can update opportunities.'},
                status=status.HTTP_403_FORBIDDEN
            )
        return super().update(request, *args, **kwargs)
    
    def destroy(self, request, *args, **kwargs):
        """Only admin can delete opportunities"""
        if not request.user.is_staff:
            return Response(
                {'error': 'Only administrators can delete opportunities.'},
                status=status.HTTP_403_FORBIDDEN
            )
        return super().destroy(request, *args, **kwargs)
    
    @action(detail=False, methods=['get'])
    def stats(self, request):
        """Get opportunities statistics"""
        today = date.today()
        
        total_opportunities = Opportunity.objects.filter(
            status='active',
            deadline__gte=today
        ).count()
        
        # Count by type
        by_type = Opportunity.objects.filter(
            status='active',
            deadline__gte=today
        ).values('opportunity_type').annotate(count=Count('id'))
        
        # Count by community
        by_community = Opportunity.objects.filter(
            status='active',
            deadline__gte=today
        ).values('community').annotate(count=Count('id'))
        
        return Response({
            'total_opportunities': total_opportunities,
            'by_type': {item['opportunity_type']: item['count'] for item in by_type},
            'by_community': {item['community']: item['count'] for item in by_community},
        })
    
    @action(detail=True, methods=['post'])
    def apply(self, request, pk=None):
        """Apply to an opportunity"""
        opportunity = self.get_object()
        
        # Check if opportunity is active
        if not opportunity.is_active:
            return Response(
                {'error': 'This opportunity is no longer active.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Check if user has partner profile
        try:
            partner = request.user.partner_profile
        except Partner.DoesNotExist:
            return Response(
                {'error': 'You need a partner profile to apply for opportunities.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Check if already applied
        if OpportunityApplication.objects.filter(
            opportunity=opportunity, 
            partner=partner
        ).exists():
            return Response(
                {'error': 'You have already applied to this opportunity.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Create application
        serializer = OpportunityApplicationCreateSerializer(
            data=request.data,
            context={'request': request}
        )
        serializer.is_valid(raise_exception=True)
        
        application = serializer.save(
            opportunity=opportunity,
            partner=partner
        )
        
        # Increment opportunity application count
        opportunity.increment_applications()
        
        return Response({
            'message': 'Application submitted successfully!',
            'application_id': application.id,
            'status': application.status
        }, status=status.HTTP_201_CREATED)



class ActiveOpportunitiesView(generics.ListAPIView):
    """Get active opportunities (optimized for dashboard)"""
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = OpportunityListSerializer
    
    def get_queryset(self):
        today = date.today()
        
        return Opportunity.objects.filter(
            status='active',
            deadline__gte=today
        ).order_by('-is_featured', '-posted_date')