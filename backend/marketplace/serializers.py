# marketplace/serializers.py
from rest_framework import serializers
from .models import (
    MarketplaceCategory, MarketplaceListing, 
    MarketplaceLike, MarketplaceSave, 
    MarketplaceInquiry, MarketplaceReport
)
from partners.serializer import PartnerSerializer


class MarketplaceCategorySerializer(serializers.ModelSerializer):
    """Serializer for marketplace categories"""
    listings_count = serializers.IntegerField(read_only=True)
    
    class Meta:
        model = MarketplaceCategory
        fields = [
            'id', 'name', 'description', 'category_type',
            'icon_name', 'display_order', 'is_active',
            'listings_count', 'created_at'
        ]
        read_only_fields = ['listings_count', 'created_at']


class MarketplaceListingSerializer(serializers.ModelSerializer):
    """Serializer for marketplace listings (list view)"""
    partner_name = serializers.CharField(source='partner.user.get_full_name', read_only=True)
    partner_community = serializers.CharField(source='partner.partner_type', read_only=True)
    category_name = serializers.CharField(source='category.name', read_only=True)
    days_remaining = serializers.IntegerField(read_only=True)
    is_liked = serializers.SerializerMethodField()
    is_saved = serializers.SerializerMethodField()
    
    class Meta:
        model = MarketplaceListing
        fields = [
            'id', 'slug', 'title', 'description', 'listing_type',
            'category', 'category_name', 'status', 'price', 'currency',
            'is_price_negotiable', 'is_free', 'location',
            'is_location_flexible', 'image', 'image_url',
            'contact_method', 'contact_info', 'contact_visible',
            'partner_name', 'partner_community', 'tags',
            'views_count', 'likes_count', 'saves_count', 'inquiries_count',
            'is_featured', 'is_urgent', 'is_verified', 'is_active',
            'posted_date', 'updated_at', 'expiry_date', 'days_remaining',
            'is_liked', 'is_saved'
        ]
        read_only_fields = [
            'slug', 'views_count', 'likes_count', 'saves_count',
            'inquiries_count', 'posted_date', 'updated_at',
            'is_liked', 'is_saved'
        ]
    
    def get_is_liked(self, obj):
        """Check if current user liked this listing"""
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            try:
                partner = request.user.partner_profile
                return obj.likes.filter(partner=partner).exists()
            except:
                return False
        return False
    
    def get_is_saved(self, obj):
        """Check if current user saved this listing"""
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            try:
                partner = request.user.partner_profile
                return obj.saves.filter(partner=partner).exists()
            except:
                return False
        return False


class MarketplaceListingDetailSerializer(MarketplaceListingSerializer):
    """Serializer for detailed listing view"""
    partner_details = PartnerSerializer(source='partner', read_only=True)
    
    class Meta(MarketplaceListingSerializer.Meta):
        fields = MarketplaceListingSerializer.Meta.fields + ['partner_details']


class MarketplaceListingCreateUpdateSerializer(serializers.ModelSerializer):
    """Serializer for creating/updating listings"""
    class Meta:
        model = MarketplaceListing
        fields = [
            'title', 'description', 'listing_type', 'category',
            'price', 'currency', 'is_price_negotiable', 'is_free',
            'location', 'is_location_flexible', 'image', 'image_url',
            'contact_method', 'contact_info', 'contact_visible',
            'tags', 'status', 'expiry_date'
        ]
    
    def validate(self, data):
        # Validate price
        if not data.get('is_free') and not data.get('price'):
            raise serializers.ValidationError({
                'price': 'Price is required for non-free listings.'
            })
        
        # Validate contact info based on method
        contact_method = data.get('contact_method')
        contact_info = data.get('contact_info', '')
        
        if contact_method == 'phone' and not contact_info:
            raise serializers.ValidationError({
                'contact_info': 'Phone number is required for phone contact method.'
            })
        elif contact_method == 'email' and not contact_info:
            raise serializers.ValidationError({
                'contact_info': 'Email address is required for email contact method.'
            })
        elif contact_method == 'whatsapp' and not contact_info:
            raise serializers.ValidationError({
                'contact_info': 'Phone number is required for WhatsApp contact method.'
            })
        
        return data
    
    def create(self, validated_data):
        """Auto-set partner from request"""
        request = self.context.get('request')
        validated_data['partner'] = request.user.partner_profile
        return super().create(validated_data)


class MarketplaceLikeSerializer(serializers.ModelSerializer):
    """Serializer for listing likes"""
    listing_title = serializers.CharField(source='listing.title', read_only=True)
    
    class Meta:
        model = MarketplaceLike
        fields = ['id', 'listing', 'listing_title', 'created_at']
        read_only_fields = ['created_at']


class MarketplaceSaveSerializer(serializers.ModelSerializer):
    """Serializer for saved listings"""
    listing_details = MarketplaceListingSerializer(source='listing', read_only=True)
    
    class Meta:
        model = MarketplaceSave
        fields = ['id', 'listing', 'listing_details', 'created_at']
        read_only_fields = ['created_at']


class MarketplaceInquirySerializer(serializers.ModelSerializer):
    """Serializer for listing inquiries"""
    listing_title = serializers.CharField(source='listing.title', read_only=True)
    inquirer_name = serializers.CharField(source='inquirer.user.get_full_name', read_only=True)
    
    class Meta:
        model = MarketplaceInquiry
        fields = [
            'id', 'listing', 'listing_title', 'inquirer', 'inquirer_name',
            'message', 'contact_method', 'contact_info', 'status',
            'responded_at', 'response', 'created_at', 'updated_at'
        ]
        read_only_fields = [
            'inquirer_name', 'listing_title', 'responded_at',
            'response', 'created_at', 'updated_at'
        ]


class MarketplaceInquiryCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating inquiries"""
    class Meta:
        model = MarketplaceInquiry
        fields = ['listing', 'message', 'contact_method', 'contact_info']
    
    def validate(self, data):
        # Check if listing is active
        listing = data['listing']
        if not listing.is_active:
            raise serializers.ValidationError({
                'listing': 'This listing is no longer available.'
            })
        
        # Check if user is inquiring about their own listing
        request = self.context.get('request')
        if request and hasattr(request.user, 'partner_profile'):
            if listing.partner == request.user.partner_profile:
                raise serializers.ValidationError({
                    'listing': 'You cannot inquire about your own listing.'
                })
        
        return data
    
    def create(self, validated_data):
        """Auto-set inquirer and increment inquiry count"""
        request = self.context.get('request')
        validated_data['inquirer'] = request.user.partner_profile
        
        # Create inquiry
        inquiry = super().create(validated_data)
        
        # Increment listing inquiry count
        inquiry.listing.increment_inquiries()
        
        return inquiry


class MarketplaceReportSerializer(serializers.ModelSerializer):
    """Serializer for listing reports"""
    listing_title = serializers.CharField(source='listing.title', read_only=True)
    reporter_name = serializers.CharField(source='reporter.user.get_full_name', read_only=True)
    
    class Meta:
        model = MarketplaceReport
        fields = [
            'id', 'listing', 'listing_title', 'reporter', 'reporter_name',
            'reason', 'details', 'status', 'reviewed_by', 'reviewed_at',
            'review_notes', 'created_at'
        ]
        read_only_fields = [
            'listing_title', 'reporter_name', 'reviewed_by',
            'reviewed_at', 'review_notes', 'created_at'
        ]


class MarketplaceStatsSerializer(serializers.Serializer):
    """Serializer for marketplace statistics"""
    total_listings = serializers.IntegerField()
    active_listings = serializers.IntegerField()
    total_products = serializers.IntegerField()
    total_services = serializers.IntegerField()
    total_needs = serializers.IntegerField()
    
    # Category counts
    by_category = serializers.DictField(child=serializers.IntegerField())
    
    # Recent activity
    recent_listings = MarketplaceListingSerializer(many=True)
    featured_listings = MarketplaceListingSerializer(many=True)