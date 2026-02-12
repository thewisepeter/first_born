# drives/admin.py
from django.contrib import admin
from django.utils.html import format_html
from .models import Drive, DriveContribution, DriveUpdate

@admin.register(Drive)
class DriveAdmin(admin.ModelAdmin):
    list_display = ['title', 'category', 'status', 'goal_amount', 
                    'current_amount', 'get_progress_percentage', 
                    'is_featured', 'created_at']
    list_filter = ['status', 'category', 'is_featured', 'is_urgent', 'is_published']
    search_fields = ['title', 'description']
    readonly_fields = ['current_amount', 'contributions_count', 'views_count', 
                      'get_progress_percentage', 'get_days_remaining']
    
    # Define custom method for list display
    def get_progress_percentage(self, obj):
        if not obj.pk:
            return "—"
        return f"{float(obj.progress_percentage):.1f}%"
    get_progress_percentage.short_description = 'Progress'
    get_progress_percentage.admin_order_field = 'current_amount'
    
    # Add days remaining to list display if needed
    def get_days_remaining(self, obj):
        days = obj.days_remaining
        if days is None:
            return "No end date"
        return f"{days} days"
    get_days_remaining.short_description = 'Days Remaining'
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('title', 'description', 'category')
        }),
        ('Financial Goals', {
            'fields': ('goal_amount', 'current_amount', 'get_progress_percentage')
        }),
        ('Dates', {
            'fields': ('start_date', 'end_date', 'get_days_remaining')
        }),
        ('Visuals', {
            'fields': ('color_scheme',)
        }),
        ('Status Flags', {
            'fields': ('status', 'is_featured', 'is_urgent', 'is_published')
        }),
        ('Statistics', {
            'fields': ('views_count', 'contributions_count'),
            'classes': ('collapse',)
        }),
    )

@admin.register(DriveContribution)
class DriveContributionAdmin(admin.ModelAdmin):
    list_display = ['contribution_number', 'drive', 'get_partner_name', 'amount', 
                    'is_anonymous', 'is_verified', 'contributed_at']
    list_filter = ['is_anonymous', 'is_verified', 'contributed_at']
    search_fields = ['contribution_number', 'partner__user__email', 'drive__title']
    readonly_fields = ['contribution_number', 'contributed_at']
    
    def get_partner_name(self, obj):
        if obj.is_anonymous:
            return "Anonymous"
        return obj.partner.user.get_full_name()
    get_partner_name.short_description = 'Partner'

@admin.register(DriveUpdate)
class DriveUpdateAdmin(admin.ModelAdmin):
    list_display = ['title', 'drive', 'update_type', 'is_pinned', 'created_at']
    list_filter = ['update_type', 'is_pinned']
    search_fields = ['title', 'content']