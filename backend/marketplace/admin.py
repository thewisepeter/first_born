# marketplace/admin.py
from django.contrib import admin
from django.utils.html import format_html
from .models import (
    MarketplaceCategory, MarketplaceListing,
    MarketplaceLike, MarketplaceSave,
    MarketplaceInquiry, MarketplaceReport
)

@admin.register(MarketplaceCategory)
class MarketplaceCategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'category_type', 'display_order', 'is_active', 'listings_count_display']
    list_filter = ['category_type', 'is_active']
    search_fields = ['name', 'description']
    
    def listings_count_display(self, obj):
        return obj.listings_count
    listings_count_display.short_description = 'Listings'


@admin.register(MarketplaceListing)
class MarketplaceListingAdmin(admin.ModelAdmin):
    list_display = ['title', 'partner', 'listing_type', 'category', 
                   'price_display', 'status', 'location', 
                   'views_count', 'is_featured', 'posted_date']
    list_filter = ['listing_type', 'status', 'category', 'is_featured', 'is_urgent']
    search_fields = ['title', 'description', 'partner__user__email', 'location']
    readonly_fields = ['views_count', 'likes_count', 'saves_count', 'inquiries_count', 'posted_date']
    
    def price_display(self, obj):
        if obj.is_free:
            return "Free"
        elif obj.price:
            return f"{obj.currency} {obj.price:,.2f}"
        return "Not set"
    price_display.short_description = 'Price'
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('title', 'description', 'listing_type', 'category', 'partner')
        }),
        ('Pricing', {
            'fields': ('price', 'currency', 'is_price_negotiable', 'is_free')
        }),
        ('Location & Contact', {
            'fields': ('location', 'is_location_flexible', 'contact_method', 'contact_info', 'contact_visible')
        }),
        ('Media', {
            'fields': ('image', 'image_url'),
            'classes': ('collapse',)
        }),
        ('Status & Flags', {
            'fields': ('status', 'is_featured', 'is_urgent', 'is_verified', 'expiry_date')
        }),
        ('Statistics', {
            'fields': ('views_count', 'likes_count', 'saves_count', 'inquiries_count'),
            'classes': ('collapse',)
        }),
        ('Metadata', {
            'fields': ('tags', 'slug'),
            'classes': ('collapse',)
        }),
    )


@admin.register(MarketplaceInquiry)
class MarketplaceInquiryAdmin(admin.ModelAdmin):
    list_display = ['listing', 'inquirer', 'status', 'created_at', 'responded_at']
    list_filter = ['status', 'contact_method']
    search_fields = ['listing__title', 'inquirer__user__email', 'message']
    readonly_fields = ['created_at', 'updated_at']


@admin.register(MarketplaceReport)
class MarketplaceReportAdmin(admin.ModelAdmin):
    list_display = ['listing', 'reporter', 'reason', 'status', 'created_at']
    list_filter = ['reason', 'status']
    search_fields = ['listing__title', 'reporter__user__email', 'details']
    readonly_fields = ['created_at']


admin.site.register(MarketplaceLike)
admin.site.register(MarketplaceSave)