from rest_framework import serializers
from .models import TestimonyMessage, ContactMessage

class TestimonyMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = TestimonyMessage
        fields = '__all__'


class ContactMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ContactMessage
        fields = '__all__'
