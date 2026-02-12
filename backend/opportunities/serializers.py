# opportunities/serializers.py
from rest_framework import serializers
from .models import Opportunity
from partners.serializer import PartnerSerializer

class OpportunityListSerializer(serializers.ModelSerializer):
    """Serializer for opportunity listings (cards)"""
    days_remaining = serializers.SerializerMethodField()
    is_active = serializers.BooleanField(read_only=True)
    
    class Meta:
        model = Opportunity
        fields = [
            'id', 'title', 'description', 'company',
            'opportunity_type', 'community', 'location',
            'is_remote', 'is_hybrid', 'deadline',
            'days_remaining', 'is_active', 'is_featured',
            'is_urgent', 'posted_date', 'requirements',
            'application_link'
        ]
        read_only_fields = ['posted_date']

    def get_days_remaining(self, obj):
        return obj.days_remaining


class OpportunityDetailSerializer(OpportunityListSerializer):
    """Serializer for detailed opportunity view"""
    pass


class OpportunityCreateUpdateSerializer(serializers.ModelSerializer):
    """Serializer for admin create/update operations"""
    class Meta:
        model = Opportunity
        fields = [
            'title', 'description', 'company',
            'opportunity_type', 'community', 'location',
            'is_remote', 'is_hybrid', 'deadline',
            'is_featured', 'is_urgent', 'is_verified',
            'application_link',
            'requirements',
            'status'
        ]
    
    def validate(self, data):
        # Validate deadline is in future
        from datetime import date
        if data['deadline'] <= date.today():
            raise serializers.ValidationError({
                'deadline': 'Deadline must be in the future.'
            })
        
        # Validate salary range
        if data.get('salary_min') and data.get('salary_max'):
            if data['salary_min'] > data['salary_max']:
                raise serializers.ValidationError({
                    'salary_min': 'Minimum salary cannot be greater than maximum salary.'
                })
        
        return data