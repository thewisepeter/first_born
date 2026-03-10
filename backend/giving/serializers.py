# giving/serializers.py
from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Giving, GivingGoal, GivingStatement, ScheduledGiving
from partners.serializer import PartnerSerializer
from django.utils import timezone

User = get_user_model()


class GivingSerializer(serializers.ModelSerializer):
    """Serializer for giving history"""
    partner_name = serializers.CharField(source='partner.user.get_full_name', read_only=True)
    
    class Meta:
        model = Giving
        fields = [
            'id', 'transaction_id', 'amount', 'giving_type', 'payment_method',
             'status', 'date', 'recorded_at', 'is_scheduled', 'frequency',
            'partner_name', 'is_verified', 'receipt_sent'
        ]
        read_only_fields = [
            'transaction_id', 'recorded_at', 'is_verified',
            'receipt_sent', 'partner_name'
        ]


class GivingCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating giving records (admin only)"""
    class Meta:
        model = Giving
        fields = [
            'partner', 'amount', 'giving_type', 'payment_method',
            'date', 'is_scheduled', 'frequency', 'next_payment_date',
            'schedule_end_date', 'drive'
        ]
        extra_kwargs = {
            'partner': {'required': True},  # Partner is now required
            'status': {'required': False, 'default': 'completed'},
        }
    
    def validate(self, data):
        # Validate date is not in future unless scheduled
        
        if data['date'] > timezone.now().date() and not data.get('is_scheduled', False):
            raise serializers.ValidationError({
                'date': 'Giving date cannot be in the future for non-scheduled payments.'
            })
        
        # Validate amount
        if data['amount'] <= 0:
            raise serializers.ValidationError({
                'amount': 'Amount must be greater than 0.'
            })
        
        return data


class GivingGoalSerializer(serializers.ModelSerializer):
    """Serializer for giving goals"""
    current_amount = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    progress_percentage = serializers.DecimalField(max_digits=5, decimal_places=2, read_only=True)
    
    class Meta:
        model = GivingGoal
        fields = [
            'id', 'period', 'target_amount', 'start_date', 'end_date',
            'is_active', 'current_amount', 'progress_percentage',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['current_amount', 'progress_percentage']


class GivingStatementSerializer(serializers.ModelSerializer):
    """Serializer for giving statements"""
    partner_name = serializers.CharField(source='partner.user.get_full_name', read_only=True)
    period_display = serializers.SerializerMethodField()
    
    class Meta:
        model = GivingStatement
        fields = [
            'id', 'statement_type', 'period_start', 'period_end',
            'period_display', 'file', 'file_url', 'total_amount',
            'transaction_count', 'partner_name', 'generated_at',
            'downloaded_count', 'last_downloaded_at'
        ]
        read_only_fields = fields
    
    def get_period_display(self, obj):
        if obj.statement_type == 'quarterly':
            quarter = ((obj.period_start.month - 1) // 3) + 1
            return f"Q{quarter} {obj.period_start.year}"
        elif obj.statement_type == 'annual':
            return f"Annual {obj.period_start.year}"
        else:
            return f"Custom: {obj.period_start} to {obj.period_end}"


class ScheduledGivingSerializer(serializers.ModelSerializer):
    """Serializer for scheduled giving"""
    days_until_next = serializers.SerializerMethodField()
    
    class Meta:
        model = ScheduledGiving
        fields = [
            'id', 'amount', 'giving_type', 'title', 'frequency', 'start_date',
            'next_payment_date', 'end_date', 'status', 'drive',
            'days_until_next', 'created_at', 'updated_at'
        ]
        extra_kwargs = {
            'end_date': {'required': False, 'allow_null': True}
        }
        read_only_fields = ['days_until_next', 'created_at', 'updated_at']
    
    def get_days_until_next(self, obj):
        from datetime import date
        today = date.today()
        if obj.next_payment_date:
            return (obj.next_payment_date - today).days
        return None


class ScheduledGivingCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating scheduled giving"""
    class Meta:
        model = ScheduledGiving
        fields = [
            'amount', 'giving_type', 'title', 'frequency', 'start_date',
            'end_date', 'drive'
        ]
    
    def validate(self, data):
        from datetime import date
        
        # Validate start date is today or in future
        if data['start_date'] < date.today():
            raise serializers.ValidationError({
                'start_date': 'Start date must be today or in the future.'
            })
        
        # Validate end date if provided
        if data.get('end_date') and data['end_date'] <= data['start_date']:
            raise serializers.ValidationError({
                'end_date': 'End date must be after start date.'
            })
        
        # Validate amount
        if data['amount'] <= 0:
            raise serializers.ValidationError({
                'amount': 'Amount must be greater than 0.'
            })
        
        return data
    
    def create(self, validated_data):
        request = self.context.get('request')
        
        # Set next payment date to start date
        validated_data['next_payment_date'] = validated_data['start_date']
        
        # Set partner from request
        validated_data['partner'] = request.user.partner_profile
        
        # Set created by
        validated_data['created_by'] = request.user
        
        return super().create(validated_data)


class GivingStatsSerializer(serializers.Serializer):
    """Serializer for giving statistics"""
    total_given = serializers.DecimalField(max_digits=10, decimal_places=2)
    monthly_goal = serializers.DecimalField(max_digits=10, decimal_places=2)
    goal_progress = serializers.DecimalField(max_digits=5, decimal_places=2)
    upcoming_payments = serializers.IntegerField()
    this_month_giving = serializers.DecimalField(max_digits=10, decimal_places=2)
    last_month_giving = serializers.DecimalField(max_digits=10, decimal_places=2)
    month_over_month_change = serializers.DecimalField(max_digits=5, decimal_places=2)
    
    # Additional stats
    by_type = serializers.DictField(child=serializers.DecimalField(max_digits=10, decimal_places=2))
    recent_transactions = GivingSerializer(many=True)
    active_schedules = ScheduledGivingSerializer(many=True)