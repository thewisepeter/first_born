# weekly_budget/admin.py
from django.contrib import admin
from django.utils.html import format_html
from .models import (
    WeeklyBudget, BudgetCategory, BudgetBreakdown,
    BudgetContribution, WeeklyBudgetStats
)

@admin.register(WeeklyBudget)
class WeeklyBudgetAdmin(admin.ModelAdmin):
    list_display = [
        'budget_id', 
        'title',
        'start_date',
        'target_amount',
        'current_amount',
        'progress_percentage',
        'status',
        'is_current_week'
    ]
    list_filter = ['status', 'is_published', 'start_date']
    search_fields = ['budget_id', 'title']
    readonly_fields = ['budget_id', 'created_at', 'updated_at', 'balance', 'progress_percentage', 'is_current_week', 'days_remaining']
    exclude = ['end_date']
    
    def get_readonly_fields(self, request, obj=None):
        if obj:  # editing existing object
            return self.readonly_fields
        return ['budget_id', 'created_at', 'updated_at']
    
    def progress_bar(self, obj):
        progress = obj.progress_percentage
        color = 'green' if progress >= 100 else 'orange' if progress >= 50 else 'red'
        return format_html(
            '<div style="width: 100px; background: #eee; border-radius: 3px;">'
            '<div style="width: {}%; background: {}; height: 20px; border-radius: 3px; '
            'text-align: center; color: white; font-weight: bold; line-height: 20px;">{}%</div>'
            '</div>',
            min(progress, 100), color, f"{progress:.1f}"
        )
    progress_bar.short_description = 'Progress'

@admin.register(BudgetCategory)
class BudgetCategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'category_type', 'default_percentage', 'display_order', 'is_active']
    list_filter = ['category_type', 'is_active']
    search_fields = ['name', 'description']

@admin.register(BudgetBreakdown)
class BudgetBreakdownAdmin(admin.ModelAdmin):
    list_display = ['weekly_budget', 'category', 'allocated_amount', 'current_amount',
                   'progress_bar', 'percentage']
    list_filter = ['category']
    search_fields = ['weekly_budget__title', 'category__name']
    
    def progress_bar(self, obj):
        progress = obj.progress_percentage
        color = 'green' if progress >= 100 else 'orange' if progress >= 50 else 'red'
        return format_html(
            '<div style="width: 80px; background: #eee; border-radius: 3px;">'
            '<div style="width: {}%; background: {}; height: 16px; border-radius: 3px;"></div>'
            '</div>',
            min(progress, 100), color
        )
    progress_bar.short_description = 'Progress'

admin.site.register(BudgetContribution)
admin.site.register(WeeklyBudgetStats)