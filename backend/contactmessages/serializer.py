from rest_framework import serializers
from .models import TestimonyMessage, ContactMessage


class ProphetMessageSerializer(serializers.Serializer):
    fullName = serializers.CharField(max_length=100)
    email = serializers.EmailField()
    phone = serializers.RegexField(r'^[\d\s\-+()]+$', max_length=200)
    message = serializers.CharField(min_length=10)

class TestimonyMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = TestimonyMessage
        fields = '__all__'


class ContactMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ContactMessage
        fields = '__all__'
