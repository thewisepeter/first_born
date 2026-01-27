from rest_framework import serializers
from django.contrib.auth import get_user_model

from .models import Partner, PartnerRequest

User = get_user_model()

class PartnerSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(source="user.email", read_only=True)
    first_name = serializers.CharField(source="user.first_name", read_only=True)
    last_name = serializers.CharField(source="user.last_name", read_only=True)

    class Meta:
        model = Partner
        fields = [
            "id",
            "email",
            "first_name",
            "last_name",
            "phone",
            "commitment_note",
            "is_active",
            "joined_at",
        ]
        read_only_fields = fields

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

    def validate(self, data):
        if data["password"] != data["password_confirm"]:
            raise serializers.ValidationError(
                {"password_confirm": "Passwords do not match."}
            )
        return data
