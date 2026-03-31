from rest_framework import serializers
from .models import (
    WeeklyBudget, BudgetCategory, BudgetBreakdown,
    BudgetContribution, WeeklyBudgetStats
)
from partners.serializer import PartnerSerializer


class BudgetCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = BudgetCategory
        fields = [
            'id', 'name', 'category_type', 'description',
            'default_percentage', 'display_order', 'is_active'
        ]


class BudgetBreakdownSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)
    category_type = serializers.CharField(source='category.category_type', read_only=True)
    progress_percentage = serializers.DecimalField(max_digits=5, decimal_places=2, read_only=True)
    balance = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)
    
    class Meta:
        model = BudgetBreakdown
        fields = [
            'id', 'category', 'category_name', 'category_type',
            'allocated_amount', 'current_amount', 'percentage',
            'progress_percentage', 'balance', 'description',
            'created_at', 'updated_at'
        ]


class WeeklyBudgetSerializer(serializers.ModelSerializer):
    """Serializer for weekly budget listing"""
    balance = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)
    progress_percentage = serializers.DecimalField(max_digits=5, decimal_places=2, read_only=True)
    is_current_week = serializers.BooleanField(read_only=True)
    days_remaining = serializers.IntegerField(read_only=True)
    breakdown_summary = serializers.SerializerMethodField()
    
    class Meta:
        model = WeeklyBudget
        fields = [
            'id', 'budget_id', 'title',
            'start_date', 'end_date', 'target_amount', 'current_amount',
            'balance', 'progress_percentage', 'status', 'is_published',
            'is_current_week', 'days_remaining',
            'breakdown_summary', 'created_at', 'updated_at'
        ]
        read_only_fields = [
            'budget_id', 'balance', 'progress_percentage',
            'is_current_week', 'days_remaining', 'created_at', 'updated_at'
        ]
    
    def get_breakdown_summary(self, obj):
        """Get summary of top 3 categories"""
        breakdown_items = obj.breakdown_items.all()[:3]
        return BudgetBreakdownSerializer(breakdown_items, many=True).data


class WeeklyBudgetDetailSerializer(WeeklyBudgetSerializer):
    """Detailed serializer for weekly budget with full breakdown"""
    breakdown_items = BudgetBreakdownSerializer(many=True, read_only=True)
    contributions_count = serializers.IntegerField(source='contributions.count', read_only=True)
    
    class Meta(WeeklyBudgetSerializer.Meta):
        fields = WeeklyBudgetSerializer.Meta.fields + [
            'breakdown_items', 'contributions_count'
        ]


class WeeklyBudgetCreateUpdateSerializer(serializers.ModelSerializer):
    """Serializer for creating/updating weekly budgets"""
    
    class Meta:
        model = WeeklyBudget
        fields = [
            'title', 'start_date', 'target_amount',
            'status', 'is_published'
        ]
    
    def validate(self, data):
        """Validate the budget data"""
        from datetime import date, timedelta
        
        # Validate start_date is not in the past (optional)
        if data['start_date'] < date.today():
            raise serializers.ValidationError({
                'start_date': 'Start date cannot be in the past.'
            })
        
        # Validate target_amount is positive
        if data['target_amount'] <= 0:
            raise serializers.ValidationError({
                'target_amount': 'Target amount must be greater than 0.'
            })
        
        return data
    
    def create(self, validated_data):
        """Create with auto-calculated end_date"""
        from datetime import timedelta
        
        # Calculate end_date = start_date + 6 days (7-day week)
        validated_data['end_date'] = validated_data['start_date'] + timedelta(days=6)
        
        return super().create(validated_data)
    
    def update(self, instance, validated_data):
        """Update with auto-calculated end_date if start_date changed"""
        from datetime import timedelta
        
        # If start_date is being updated, recalculate end_date
        if 'start_date' in validated_data:
            validated_data['end_date'] = validated_data['start_date'] + timedelta(days=6)
        
        return super().update(instance, validated_data)


class BudgetContributionSerializer(serializers.ModelSerializer):
    """Serializer for budget contributions"""
    partner_name = serializers.CharField(source='partner.user.get_full_name', read_only=True)
    weekly_budget_info = serializers.SerializerMethodField()
    
    class Meta:
        model = BudgetContribution
        fields = [
            'id', 'contribution_number', 'weekly_budget', 'weekly_budget_info',
            'partner', 'partner_name', 'amount', 'category',
            'description', 'is_anonymous', 'payment_method',
            'contributed_at', 'is_verified'
        ]
        read_only_fields = [
            'contribution_number', 'partner_name', 'weekly_budget_info',
            'contributed_at', 'is_verified'
        ]
    
    def get_weekly_budget_info(self, obj):
        return {
            'start_date': obj.weekly_budget.start_date,
            'end_date': obj.weekly_budget.end_date,
            'title': obj.weekly_budget.title
        }


class BudgetContributionCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating contributions"""
    class Meta:
        model = BudgetContribution
        fields = [
            'weekly_budget', 'amount', 'category',
            'description', 'is_anonymous', 'payment_method'
        ]
    
    def validate(self, data):
        weekly_budget = data['weekly_budget']
        
        # Check if budget is active
        if weekly_budget.status != 'active':
            raise serializers.ValidationError({
                'weekly_budget': 'This budget is not currently active.'
            })
        
        # Check if budget is published
        if not weekly_budget.is_published:
            raise serializers.ValidationError({
                'weekly_budget': 'This budget is not published.'
            })
        
        # Check amount
        if data['amount'] <= 0:
            raise serializers.ValidationError({
                'amount': 'Amount must be greater than 0.'
            })
        
        return data
    
    def create(self, validated_data):
        request = self.context.get('request')
        
        # Get partner from request
        try:
            partner = request.user.partner_profile
        except:
            raise serializers.ValidationError({
                'error': 'Partner profile not found.'
            })
        
        # Create contribution
        contribution = BudgetContribution.objects.create(
            partner=partner,
            **validated_data
        )
        
        return contribution


class WeeklyBudgetStatsSerializer(serializers.ModelSerializer):
    """Serializer for budget statistics"""
    progress_percentage = serializers.SerializerMethodField()
    formatted_total_target = serializers.SerializerMethodField()
    formatted_total_raised = serializers.SerializerMethodField()
    
    class Meta:
        model = WeeklyBudgetStats
        fields = [
            'year', 'week_number', 'total_target', 'total_raised',
            'total_contributions', 'total_partners', 'category_breakdown',
            'previous_week_total', 'week_over_week_change',
            'progress_percentage', 'formatted_total_target',
            'formatted_total_raised', 'generated_at'
        ]
        read_only_fields = fields
    
    def get_progress_percentage(self, obj):
        if obj.total_target == 0:
            return 0
        return (obj.total_raised / obj.total_target) * 100
    
    def get_formatted_total_target(self, obj):
        return f"UGX {obj.total_target:,.2f}"
    
    def get_formatted_total_raised(self, obj):
        return f"UGX {obj.total_raised:,.2f}"


class CurrentWeeklyBudgetSerializer(serializers.ModelSerializer):
    """Serializer for current week's budget"""
    balance = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)
    progress_percentage = serializers.DecimalField(max_digits=5, decimal_places=2, read_only=True)
    days_remaining = serializers.IntegerField(read_only=True)
    breakdown = BudgetBreakdownSerializer(many=True, source='breakdown_items')
    
    class Meta:
        model = WeeklyBudget
        fields = [
            'id', 'budget_id', 'title',
            'start_date', 'end_date', 'target_amount', 'current_amount',
            'balance', 'progress_percentage', 'days_remaining',
            'description', 'breakdown'
        ]