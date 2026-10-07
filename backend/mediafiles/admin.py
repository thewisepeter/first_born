from django.contrib import admin
from .models import Audio, Video, Livestream


class AudioAdmin(admin.ModelAdmin):
    # Only show these fields in the form
    fields = ('title', 'date', 'active', 'category', 'description', 'original_url')

    # If you want some fields readonly, add them here
    readonly_fields = ('date', 'speaker')  # optional

    # What to show in the list page
    list_display = ('title', 'speaker', 'active', 'category')


admin.site.register(Audio, AudioAdmin)


class VideoAdmin(admin.ModelAdmin):
    fields = ('title', 'description', 'original_url', 'category')
    readonly_fields = ('date_posted',)
    list_display = ('title', 'category', 'formatted_date')


admin.site.register(Video, VideoAdmin)


@admin.register(Livestream)
class LivestreamAdmin(admin.ModelAdmin):
    fields = ('title', 'video_url', 'is_live', 'next_broadcast_at', 'offline_message')
    list_display = ('title', 'is_live', 'next_broadcast_at')

    def has_add_permission(self, request):
        return super().has_add_permission(request) and not Livestream.objects.exists()
