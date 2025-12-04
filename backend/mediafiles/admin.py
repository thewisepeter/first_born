from django.contrib import admin
from .models import Audio, Video


class AudioAdmin(admin.ModelAdmin):
    # Only show these fields in the form
    fields = ('title', 'date', 'active', 'description', 'original_url')

    # If you want some fields readonly, add them here
    readonly_fields = ('date', 'speaker')  # optional

    # What to show in the list page
    list_display = ('title', 'speaker', 'active')


admin.site.register(Audio, AudioAdmin)


class VideoAdmin(admin.ModelAdmin):
    fields = ('title', 'description', 'original_url', 'category')
    readonly_fields = ('date_posted',)
    list_display = ('title', 'category', 'formatted_date')


admin.site.register(Video, VideoAdmin)
