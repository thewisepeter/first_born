# weekly_budget/serializers.py
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
            'id', 'budget_id', 'title', 'year', 'week_number',
            'start_date', 'end_date', 'target_amount', 'current_amount',
            'balance', 'progress_percentage', 'status', 'is_published',
            'is_current_week', 'days_remaining', 'description',
            'breakdown_summary', 'created_at'
        ]
        read_only_fields = [
            'budget_id', 'balance', 'progress_percentage',
            'is_current_week', 'days_remaining', 'created_at'
        ]
    
    def get_breakdown_summary(self, obj):
        """Get summary of top 3 categories"""
        breakdown_items = obj.breakdown_items.all()[:3]
        return BudgetBreakdownSerializer(breakdown_items, many=True).data


class WeeklyBudgetDetailSerializer(WeeklyBudgetSerializer):
    """Detailed serializer for weekly budget"""
    breakdown_items = BudgetBreakdownSerializer(many=True, read_only=True)
    contributions_count = serializers.IntegerField(source='contributions.count', read_only=True)
    
    class Meta(WeeklyBudgetSerializer.Meta):
        fields = WeeklyBudgetSerializer.Meta.fields + [
            'notes', 'breakdown_items', 'contributions_count',
            'updated_at', 'published_at'
        ]


class WeeklyBudgetCreateUpdateSerializer(serializers.ModelSerializer):
    """Serializer for creating/updating weekly budgets"""
    breakdown = BudgetBreakdownSerializer(many=True, required=False)
    
    class Meta:
        model = WeeklyBudget
        fields = [
            'title', 'year', 'week_number', 'start_date', 'end_date',
            'target_amount', 'description', 'notes', 'status',
            'is_published', 'breakdown'
        ]
    
    def validate(self, data):
        # Validate date range is exactly 7 days
        if data['end_date'] <= data['start_date']:
            raise serializers.ValidationError({
                'end_date': 'End date must be after start date'
            })
        
        # Check if week duration is approximately 7 days
        days_difference = (data['end_date'] - data['start_date']).days
        if days_difference != 6:  # 7 days inclusive
            raise serializers.ValidationError({
                'end_date': 'Budget period should be exactly one week (7 days)'
            })
        
        # Validate target amount
        if data['target_amount'] <= 0:
            raise serializers.ValidationError({
                'target_amount': 'Target amount must be greater than 0'
            })
        
        return data
    
    def create(self, validated_data):
        breakdown_data = validated_data.pop('breakdown', [])
        request = self.context.get('request')
        
        # Create weekly budget
        weekly_budget = WeeklyBudget.objects.create(
            **validated_data,
            created_by=request.user if request else None
        )
        
        # Create breakdown items
        for item_data in breakdown_data:
            BudgetBreakdown.objects.create(
                weekly_budget=weekly_budget,
                **item_data
            )
        
        return weekly_budget
    
    def update(self, instance, validated_data):
        breakdown_data = validated_data.pop('breakdown', None)
        
        # Update weekly budget
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        
        # Update breakdown if provided
        if breakdown_data is not None:
            # Clear existing breakdown
            instance.breakdown_items.all().delete()
            
            # Create new breakdown items
            for item_data in breakdown_data:
                BudgetBreakdown.objects.create(
                    weekly_budget=instance,
                    **item_data
                )
        
        return instance


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
            'week_number': obj.weekly_budget.week_number,
            'year': obj.weekly_budget.year,
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
            'id', 'budget_id', 'title', 'year', 'week_number',
            'start_date', 'end_date', 'target_amount', 'current_amount',
            'balance', 'progress_percentage', 'days_remaining',
            'description', 'breakdown'
        ]