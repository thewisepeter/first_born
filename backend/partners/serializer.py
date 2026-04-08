from rest_framework import serializers
from django.contrib.auth import get_user_model

from .models import Partner, PartnerRequest, PartnerGoal

User = get_user_model()


class PartnerGoalSerializer(serializers.ModelSerializer):
    progress_percentage = serializers.DecimalField(max_digits=5, decimal_places=2, read_only=True)
    
    class Meta:
        model = PartnerGoal
        fields = [
            'id', 'name', 'description', 'category',
            'target_value', 'current_value', 'deadline',
            'is_active', 'progress_percentage', 'created_at',
            'updated_at'
        ]
        read_only_fields = ['progress_percentage', 'created_at', 'updated_at']

class PartnerSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(source="user.email", read_only=True)
    first_name = serializers.CharField(source="user.first_name", read_only=True)
    last_name = serializers.CharField(source="user.last_name", read_only=True)
    full_name = serializers.SerializerMethodField()
    months_active = serializers.IntegerField(read_only=True)
    goals = PartnerGoalSerializer(many=True, read_only=True)

    class Meta:
        model = Partner
        fields = [
            # Basic Information
            'id', 'email', 'first_name', 'last_name', 'full_name',
            'phone', 'partner_type', 'community', 'bio', 'location', 'organization',
            
            # Partnership Details
            'total_given', 'months_active',
            
            # Dates
            'joined_at', 'member_since', 'last_active',
            
            # Status
            'is_active',
            
            # Related Data
            'goals',
        ]
        read_only_fields = [
            'joined_at', 'member_since', 'last_active',
            'total_given', 'months_active',
        ]

    def get_full_name(self, obj):
        return obj.user.get_full_name()


class PartnerProfileUpdateSerializer(serializers.ModelSerializer):
    first_name = serializers.CharField(source='user.first_name', required=False)
    last_name = serializers.CharField(source='user.last_name', required=False)
    email = serializers.EmailField(source='user.email', required=False, read_only=True)
    
    class Meta:
        model = Partner
        fields = [
            'first_name', 'last_name', 'email',
            'phone', 'bio', 'location', 'organization',
            'partner_type'
        ]
    
    def update(self, instance, validated_data):
        # Handle user data
        user_data = validated_data.pop('user', {})
        if user_data:
            user = instance.user
            if 'first_name' in user_data:
                user.first_name = user_data['first_name']
            if 'last_name' in user_data:
                user.last_name = user_data['last_name']
            user.save()
        
        # Handle partner data
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        
        instance.save()
        return instance

class PartnerRequestSerializer(serializers.ModelSerializer):
    class Meta:
        model = PartnerRequest
        fields = [
            "id",
            "first_name",
            "last_name",
            "email",
            "phone",
            "status",
            "created_at",
        ]
        read_only_fields = ["status", "created_at"]

    def validate_email(self, value):
        return value.lower()


class PartnerSignupSerializer(serializers.Serializer):
    first_name = serializers.CharField(max_length=100)
    last_name = serializers.CharField(max_length=100)
    phone = serializers.CharField(max_length=30)

    password = serializers.CharField(
        write_only=True,
        min_length=8,
        style={"input_type": "password"}
    )

    password_confirm = serializers.CharField(
        write_only=True,
        style={"input_type": "password"}
    )

    # extended fields
    location = serializers.CharField(max_length=255, required=False, allow_blank=True)
    organization = serializers.CharField(max_length=255, required=False, allow_blank=True)
    partner_type = serializers.CharField(max_length=50, required=False, default='individual')
    bio = serializers.CharField(required=False, allow_blank=True)

    def validate(self, data):
        if data["password"] != data["password_confirm"]:
            raise serializers.ValidationError(
                {"password_confirm": "Passwords do not match."}
            )
        return data
