# drives/serializers.py
from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Drive, DriveContribution, DriveUpdate

User = get_user_model()

class DriveUpdateSerializer(serializers.ModelSerializer):
    author_name = serializers.CharField(source='author.get_full_name', read_only=True)
    
    class Meta:
        model = DriveUpdate
        fields = [
            'id', 'title', 'content', 'update_type',
            'is_pinned', 'author_name', 'created_at'
        ]
        read_only_fields = ['author_name', 'created_at']

    
class DriveContributionSerializer(serializers.ModelSerializer):
    partner_name = serializers.SerializerMethodField()
    
    class Meta:
        model = DriveContribution
        fields = [
            'id', 'contribution_number', 'amount', 'is_anonymous',
             'partner_name', 'contributed_at', 'is_verified'
        ]
        read_only_fields = ['contribution_number', 'partner_name', 'contributed_at', 'is_verified']
    
    def get_partner_name(self, obj):
        if obj.is_anonymous:
            return "Anonymous"
        return obj.partner.user.get_full_name()


# drives/serializers.py
class DriveListSerializer(serializers.ModelSerializer):
    """Serializer for drive listings (cards)"""
    progress_percentage = serializers.SerializerMethodField()
    days_remaining = serializers.SerializerMethodField()  # Changed to SerializerMethodField
    contributions_count = serializers.IntegerField(read_only=True)
    
    class Meta:
        model = Drive
        fields = [
            'id', 'title', 'description', 'category',
            'goal_amount', 'start_date', 'end_date',
            'color_scheme', 'is_featured', 'is_urgent',
            'is_published', 'progress_percentage', 
            'days_remaining', 'contributions_count'  # Added missing fields
        ]

    def get_progress_percentage(self, obj):
        return obj.progress_percentage
    
    def get_days_remaining(self, obj):
        return obj.days_remaining


class DriveDetailSerializer(DriveListSerializer):
    """Serializer for detailed drive view"""

    recent_contributions = serializers.SerializerMethodField()
    
    class Meta(DriveListSerializer.Meta):
        fields = DriveListSerializer.Meta.fields + [
            'updates', 'recent_contributions', 'views_count'
        ]
    
    def get_recent_contributions(self, obj):
        contributions = obj.contributions.filter(is_verified=True).order_by('-contributed_at')[:10]
        return DriveContributionSerializer(contributions, many=True).data

class DriveCreateUpdateSerializer(serializers.ModelSerializer):
    """Serializer for admin create/update operations"""
    class Meta:
        model = Drive
        fields = [
            'title', 'description', 'category',
            'goal_amount', 'start_date', 'end_date',
            'color_scheme', 'is_featured', 'is_urgent', 'is_published'
        ]
    
    def validate(self, data):
        # Validate dates
        if data.get('end_date') and data['end_date'] < data['start_date']:
            raise serializers.ValidationError({
                'end_date': 'End date must be after start date'
            })
        
        # Validate goal amount
        if data['goal_amount'] <= 0:
            raise serializers.ValidationError({
                'goal_amount': 'Goal amount must be greater than 0'
            })
        
        return data


class ContributionCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating contributions"""
    class Meta:
        model = DriveContribution
        fields = ['amount', 'is_anonymous']
    
    def validate_amount(self, value):
        if value <= 0:
            raise serializers.ValidationError("Amount must be greater than 0")
        return value