# giving/admin.py
from django.contrib import admin
from django.utils.html import format_html
from .models import Giving, GivingGoal, GivingStatement, ScheduledGiving

@admin.register(Giving)
class GivingAdmin(admin.ModelAdmin):
    list_display = ['transaction_id', 'partner', 'amount', 'giving_type', 
                   'date', 'status', 'payment_method', 'is_verified']
    list_filter = ['status', 'giving_type', 'payment_method', 'is_verified', 'is_scheduled']
    search_fields = ['transaction_id', 'partner__user__email', 'title', 'description']
    readonly_fields = ['transaction_id', 'recorded_at']
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('partner', 'transaction_id', 'amount', 'giving_type', 'title')
        }),
        ('Details', {
            'fields': ('description', 'notes', 'date', 'status', 'payment_method')
        }),
        ('Scheduling', {
            'fields': ('is_scheduled', 'frequency', 'next_payment_date', 'schedule_end_date'),
            'classes': ('collapse',)
        }),
        ('Verification', {
            'fields': ('is_verified', 'verified_by', 'verified_at', 'receipt_sent', 'receipt_sent_at'),
            'classes': ('collapse',)
        }),
        ('Linked Entities', {
            'fields': ('drive',),
            'classes': ('collapse',)
        }),
    )

@admin.register(GivingGoal)
class GivingGoalAdmin(admin.ModelAdmin):
    list_display = ['partner', 'period', 'target_amount', 'current_amount_display',
                   'progress_percentage_display', 'start_date', 'end_date', 'is_active']
    list_filter = ['period', 'is_active']
    search_fields = ['partner__user__email']
    
    def current_amount_display(self, obj):
        return f"UGX {obj.current_amount:,.2f}"
    current_amount_display.short_description = 'Current Amount'
    
    def progress_percentage_display(self, obj):
        progress = obj.progress_percentage
        if progress >= 100:
            color = 'green'
            style = f'color: {color}; font-weight: bold'
        elif progress >= 50:
            color = 'orange'
            style = f'color: {color}; font-weight: bold'
        else:
            color = 'red'
            style = f'color: {color}; font-weight: bold'
        return format_html('<span style="{}">{:.1f}%</span>', style, progress)
    progress_percentage_display.short_description = 'Progress'

@admin.register(GivingStatement)
class GivingStatementAdmin(admin.ModelAdmin):
    list_display = ['partner', 'statement_type', 'period_start', 'period_end',
                   'total_amount', 'transaction_count', 'downloaded_count']
    list_filter = ['statement_type']
    search_fields = ['partner__user__email']

@admin.register(ScheduledGiving)
class ScheduledGivingAdmin(admin.ModelAdmin):
    list_display = ['partner', 'title', 'amount', 'frequency', 'next_payment_date',
                   'status', 'payment_method']
    list_filter = ['status', 'frequency', 'payment_method']
    search_fields = ['partner__user__email', 'title', 'description']