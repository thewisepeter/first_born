from rest_framework import serializers
from .models import Audio, Video

class AudioSerializer(serializers.ModelSerializer):
    class Meta:
        model = Audio
        fields = '__all__'

class VideoSerializer(serializers.ModelSerializer):
    date = serializers.SerializerMethodField()

    class Meta:
        model = Video
        fields = ['id', 'title', 'description', 'embed_id', 'source_url', 'duration', 'views', 'category', 'date']

    def get_date(self, obj):
        return obj.formatted_date()

