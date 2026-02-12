from rest_framework import serializers
from .models import Audio, Video

class AudioSerializer(serializers.ModelSerializer):
    driveUrl = serializers.CharField(source='drive_url')
    id = serializers.SerializerMethodField()
    date = serializers.SerializerMethodField()

    class Meta:
        model = Audio
        fields = ['id', 'title', 'speaker', 'date', 'active', 'description', 'category', 'driveUrl']

    def get_id(self, obj):
        return str(obj.id)

    def get_date(self, obj):
        if obj.date:
            return obj.date.strftime("%B %d, %Y")  # e.g. "February 11, 2024"
        return ""


class VideoSerializer(serializers.ModelSerializer):
    date = serializers.SerializerMethodField()

    class Meta:
        model = Video
        fields = ['id', 'title', 'description', 'embed_id', 'source_url', 'category', 'date']

    def get_date(self, obj):
        return obj.formatted_date()

