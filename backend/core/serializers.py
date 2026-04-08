from rest_framework import serializers
from django.contrib.contenttypes.models import ContentType
from .models import Activity

class ActivitySerializer(serializers.ModelSerializer):
    icon = serializers.ReadOnlyField()
    color = serializers.ReadOnlyField()
    action_display = serializers.CharField(source='get_action_type_display', read_only=True)
    actor_name = serializers.CharField(source='actor.get_full_name', read_only=True)
    time_ago = serializers.SerializerMethodField()
    
    class Meta:
        model = Activity
        fields = [
            'id', 'action_type', 'action_display', 'title', 'description',
            'icon', 'color', 'actor_name', 'is_read', 'is_public',
            'created_at', 'time_ago'
        ]
        read_only_fields = fields
    
    def get_time_ago(self, obj):
        from django.utils import timezone
        from datetime import datetime
        
        now = timezone.now()
        diff = now - obj.created_at
        
        if diff.days > 30:
            return f"{diff.days // 30} months ago"
        elif diff.days > 0:
            return f"{diff.days} days ago"
        elif diff.seconds > 3600:
            return f"{diff.seconds // 3600} hours ago"
        elif diff.seconds > 60:
            return f"{diff.seconds // 60} minutes ago"
        else:
            return "Just now"