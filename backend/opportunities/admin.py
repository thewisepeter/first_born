# opportunities/admin.py
from django.contrib import admin
from django.utils.html import format_html
from .models import Opportunity

@admin.register(Opportunity)
class OpportunityAdmin(admin.ModelAdmin):
    list_display = ['title', 'company', 'opportunity_type', 'community', 
                   'location', 'deadline', 'days_remaining_display', 
                   'status', 'is_featured']
    list_filter = ['status', 'opportunity_type', 'community', 'is_featured', 'is_urgent']
    search_fields = ['title', 'company', 'description', 'location']
    readonly_fields = [ 'posted_date', 'created_at']
    
    def days_remaining_display(self, obj):
        days = obj.days_remaining
        if days <= 7:
            color = 'red'
            style = f'font-weight: bold; color: {color}'
        elif days <= 30:
            color = 'orange'
            style = f'font-weight: bold; color: {color}'
        else:
            color = 'green'
            style = f'color: {color}'
        return format_html('<span style="{}">{}</span>', style, f"{days} days")
    days_remaining_display.short_description = 'Days Left'
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('title', 'description', 'company', 'opportunity_type', 'community')
        }),
        ('Location & Logistics', {
            'fields': ('location', 'is_remote', 'is_hybrid', 'deadline')
        }),
        ('Contact & Application', {
            'fields': ('application_link', )
        }),
        ('Requirements & Compensation', {
            'fields': ('requirements',),
            'classes': ('collapse',)
        }),
        ('Status Flags', {
            'fields': ('status', 'is_featured', 'is_urgent', 'is_verified')
        }),
        ('Statistics', {
            'fields': ('posted_date',),
            'classes': ('collapse',)
        }),

    )
