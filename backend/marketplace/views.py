# marketplace/views.py

from rest_framework import viewsets, generics, status, permissions
from rest_framework.pagination import PageNumberPagination
from rest_framework import serializers
from rest_framework.response import Response
from rest_framework.decorators import action
from django.shortcuts import get_object_or_404
from django.db.models import Q, Count
from django.utils import timezone
from datetime import timedelta

from partners.models import Partner
from .models import (
    MarketplaceCategory, MarketplaceListing,
    MarketplaceLike, MarketplaceSave,
    MarketplaceInquiry, MarketplaceReport
)
from .serializers import (
    MarketplaceCategorySerializer, MarketplaceListingSerializer,
    MarketplaceListingDetailSerializer, MarketplaceListingCreateUpdateSerializer,
    MarketplaceLikeSerializer, MarketplaceSaveSerializer,
    MarketplaceInquirySerializer, MarketplaceInquiryCreateSerializer,
    MarketplaceReportSerializer, MarketplaceStatsSerializer
)


# 👈 Add this pagination class
class StandardResultsSetPagination(PageNumberPagination):
    page_size = 12  # Good for grid layouts
    page_size_query_param = 'page_size'
    max_page_size = 100
    page_query_param = 'page'


class IsPartnerOwnerOrAdmin(permissions.BasePermission):
    """
    Permission to only allow:
    - Owner partner to edit/delete their own listings
    - Admin to do anything
    - All partners to view
    """
    def has_object_permission(self, request, view, obj):
        # Always allow safe methods (GET, HEAD, OPTIONS)
        if request.method in permissions.SAFE_METHODS:
            return True
        
        # Admin can do anything
        if request.user.is_staff:
            return True
        
        # Partner can only modify their own listings
        if hasattr(obj, 'partner'):
            return obj.partner.user == request.user
        elif hasattr(obj, 'inquirer'):
            return obj.inquirer.user == request.user
        elif hasattr(obj, 'reporter'):
            return obj.reporter.user == request.user
        
        return False


class MarketplaceCategoryViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for marketplace categories (read-only)"""
    queryset = MarketplaceCategory.objects.filter(is_active=True)
    serializer_class = MarketplaceCategorySerializer
    permission_classes = [permissions.IsAuthenticated]
    # Categories usually don't need pagination


class MarketplaceListingViewSet(viewsets.ModelViewSet):
    """
    ViewSet for marketplace listings.
    Partners can create/edit/delete their own, view all.
    """
    permission_classes = [permissions.IsAuthenticated, IsPartnerOwnerOrAdmin]
    
    # 👈 Add this line to enable pagination
    pagination_class = StandardResultsSetPagination
    
    def get_queryset(self):
        """Get filtered listings"""
        queryset = MarketplaceListing.objects.filter(
            status__in=['available', 'pending']
        ).select_related('partner__user', 'category')
        
        # Apply filters from query parameters
        listing_type = self.request.query_params.get('type', None)
        if listing_type:
            queryset = queryset.filter(listing_type=listing_type)
        
        category_id = self.request.query_params.get('category', None)
        if category_id:
            queryset = queryset.filter(category_id=category_id)
        
        location = self.request.query_params.get('location', None)
        if location:
            queryset = queryset.filter(location__icontains=location)
        
        search = self.request.query_params.get('search', None)
        if search:
            queryset = queryset.filter(
                Q(title__icontains=search) |
                Q(description__icontains=search) |
                Q(tags__contains=[search])
            )
        
        # Filter by price range
        min_price = self.request.query_params.get('min_price', None)
        if min_price:
            queryset = queryset.filter(price__gte=min_price)
        
        max_price = self.request.query_params.get('max_price', None)
        if max_price:
            queryset = queryset.filter(price__lte=max_price)
        
        # Filter by featured/urgent
        featured = self.request.query_params.get('featured', None)
        if featured is not None:
            queryset = queryset.filter(is_featured=featured.lower() == 'true')
        
        urgent = self.request.query_params.get('urgent', None)
        if urgent is not None:
            queryset = queryset.filter(is_urgent=urgent.lower() == 'true')
        
        # Filter by partner's own listings
        mine = self.request.query_params.get('mine', None)
        if mine is not None and mine.lower() == 'true':
            try:
                partner = self.request.user.partner_profile
                queryset = queryset.filter(partner=partner)
            except Partner.DoesNotExist:
                queryset = queryset.none()
        
        # Order by featured first, then date
        return queryset.order_by('-is_featured', '-posted_date')
    
    def get_serializer_class(self):
        if self.action == 'list':
            return MarketplaceListingSerializer
        elif self.action == 'retrieve':
            return MarketplaceListingDetailSerializer
        elif self.action in ['create', 'update', 'partial_update']:
            return MarketplaceListingCreateUpdateSerializer
        return MarketplaceListingSerializer
    
    def perform_create(self, serializer):
        """Auto-set partner from request user"""
        try:
            partner = self.request.user.partner_profile
            serializer.save(partner=partner)
        except Partner.DoesNotExist:
            raise serializers.ValidationError({
                'error': 'You need a partner profile to create listings.'
            })
    
    def retrieve(self, request, *args, **kwargs):
        """Increment view count when retrieving"""
        instance = self.get_object()
        instance.increment_views()
        return super().retrieve(request, *args, **kwargs)
    
    @action(detail=True, methods=['post'])
    def like(self, request, pk=None):
        """Like/unlike a listing"""
        listing = self.get_object()
        partner = request.user.partner_profile
        
        like, created = MarketplaceLike.objects.get_or_create(
            listing=listing,
            partner=partner
        )
        
        if not created:
            # Unlike if already liked
            like.delete()
            listing.likes_count = max(0, listing.likes_count - 1)
            message = 'Like removed'
        else:
            listing.likes_count += 1
            message = 'Listing liked'
        
        listing.save(update_fields=['likes_count'])
        
        return Response({
            'message': message,
            'likes_count': listing.likes_count,
            'is_liked': created
        })
    
    @action(detail=True, methods=['post'])
    def save(self, request, pk=None):
        """Save/unsave a listing"""
        listing = self.get_object()
        partner = request.user.partner_profile
        
        save, created = MarketplaceSave.objects.get_or_create(
            listing=listing,
            partner=partner
        )
        
        if not created:
            # Unsave if already saved
            save.delete()
            listing.saves_count = max(0, listing.saves_count - 1)
            message = 'Listing removed from saves'
        else:
            listing.saves_count += 1
            message = 'Listing saved'
        
        listing.save(update_fields=['saves_count'])
        
        return Response({
            'message': message,
            'saves_count': listing.saves_count,
            'is_saved': created
        })
    
    @action(detail=True, methods=['post'])
    def report(self, request, pk=None):
        """Report a listing"""
        listing = self.get_object()
        partner = request.user.partner_profile
        
        # Check if already reported
        if MarketplaceReport.objects.filter(listing=listing, reporter=partner).exists():
            return Response(
                {'error': 'You have already reported this listing.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        serializer = MarketplaceReportSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        serializer.save(
            listing=listing,
            reporter=partner
        )
        
        return Response({
            'message': 'Listing reported successfully.',
            'report': serializer.data
        }, status=status.HTTP_201_CREATED)
    
    @action(detail=False, methods=['get'])
    def stats(self, request):
        """Get marketplace statistics"""
        try:
            total_listings = MarketplaceListing.objects.count()
            active_listings = MarketplaceListing.objects.filter(
                status__in=['available', 'pending']
            ).count()
            
            # Count by type
            total_products = MarketplaceListing.objects.filter(
                listing_type='product',
                status__in=['available', 'pending']
            ).count()
            
            total_services = MarketplaceListing.objects.filter(
                listing_type='service',
                status__in=['available', 'pending']
            ).count()
            
            total_needs = MarketplaceListing.objects.filter(
                listing_type='need',
                status__in=['available', 'pending']
            ).count()
            
            # Count by category - FIXED VERSION
            from django.db.models import Count, Q
            
            categories = MarketplaceCategory.objects.filter(is_active=True)
            by_category_dict = {}
            
            for category in categories:
                count = MarketplaceListing.objects.filter(
                    category=category,
                    status__in=['available', 'pending']
                ).count()
                by_category_dict[category.name] = count
            
            # Get recent listings
            recent_listings = MarketplaceListing.objects.filter(
                status__in=['available', 'pending']
            ).order_by('-posted_date')[:6]
            
            # Get featured listings
            featured_listings = MarketplaceListing.objects.filter(
                is_featured=True,
                status__in=['available', 'pending']
            ).order_by('-posted_date')[:3]
            
            # Prepare stats dictionary
            stats_data = {
                'total_listings': total_listings,
                'active_listings': active_listings,
                'total_products': total_products,
                'total_services': total_services,
                'total_needs': total_needs,
                'by_category': by_category_dict,
                'recent_listings': MarketplaceListingSerializer(
                    recent_listings, many=True, context={'request': request}
                ).data,
                'featured_listings': MarketplaceListingSerializer(
                    featured_listings, many=True, context={'request': request}
                ).data,
            }
            
            return Response(stats_data)
        except Exception as e:
            print(f"Error in stats endpoint: {str(e)}")
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class MarketplaceLikeViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for liked listings"""
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = MarketplaceLikeSerializer
    
    # 👈 Add pagination for likes (if there could be many)
    pagination_class = StandardResultsSetPagination
    
    def get_queryset(self):
        """Get current partner's likes"""
        try:
            partner = self.request.user.partner_profile
            return MarketplaceLike.objects.filter(
                partner=partner
            ).select_related('listing').order_by('-created_at')
        except Partner.DoesNotExist:
            return MarketplaceLike.objects.none()


class MarketplaceSaveViewSet(viewsets.ModelViewSet):
    """ViewSet for saved listings"""
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = MarketplaceSaveSerializer
    
    # 👈 Add pagination for saves
    pagination_class = StandardResultsSetPagination
    
    def get_queryset(self):
        """Get current partner's saves"""
        try:
            partner = self.request.user.partner_profile
            return MarketplaceSave.objects.filter(
                partner=partner
            ).select_related('listing').order_by('-created_at')
        except Partner.DoesNotExist:
            return MarketplaceSave.objects.none()


class MarketplaceInquiryViewSet(viewsets.ModelViewSet):
    """ViewSet for listing inquiries"""
    permission_classes = [permissions.IsAuthenticated, IsPartnerOwnerOrAdmin]
    serializer_class = MarketplaceInquirySerializer
    
    # 👈 Add pagination for inquiries
    pagination_class = StandardResultsSetPagination
    
    def get_queryset(self):
        """Filter inquiries based on user role"""
        if self.request.user.is_staff:
            return MarketplaceInquiry.objects.all().order_by('-created_at')
        
        try:
            partner = self.request.user.partner_profile
            
            # Partners can see inquiries about their own listings AND their own inquiries
            return MarketplaceInquiry.objects.filter(
                Q(listing__partner=partner) | Q(inquirer=partner)
            ).select_related('listing', 'inquirer__user').order_by('-created_at')
        except Partner.DoesNotExist:
            return MarketplaceInquiry.objects.none()
    
    def get_serializer_class(self):
        if self.action == 'create':
            return MarketplaceInquiryCreateSerializer
        return MarketplaceInquirySerializer
    
    @action(detail=True, methods=['post'])
    def respond(self, request, pk=None):
        """Respond to an inquiry (listing owner only)"""
        inquiry = self.get_object()
        
        # Check if user is the listing owner
        if inquiry.listing.partner.user != request.user:
            return Response(
                {'error': 'Only the listing owner can respond to inquiries.'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        response_text = request.data.get('response', '')
        if not response_text:
            return Response(
                {'error': 'Response text is required.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        inquiry.mark_as_responded(response_text)
        
        return Response({
            'message': 'Response sent successfully.',
            'inquiry': MarketplaceInquirySerializer(inquiry).data
        })


class MyListingsView(generics.ListAPIView):
    """Get current partner's listings"""
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = MarketplaceListingSerializer
    
    # 👈 Add pagination for my listings
    pagination_class = StandardResultsSetPagination
    
    def get_queryset(self):
        try:
            partner = self.request.user.partner_profile
            return MarketplaceListing.objects.filter(
                partner=partner
            ).order_by('-posted_date')
        except Partner.DoesNotExist:
            return MarketplaceListing.objects.none()


class RecentListingsView(generics.ListAPIView):
    """Get recent listings for dashboard (limited, no pagination needed)"""
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = MarketplaceListingSerializer
    
    def get_queryset(self):
        return MarketplaceListing.objects.filter(
            status__in=['available', 'pending']
        ).order_by('-posted_date')[:6]  # This is intentionally limited