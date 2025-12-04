from django.contrib import admin
from .models import Audio, Video

admin.site.register(Audio)


class VideoAdmin(admin.ModelAdmin):
    # Fields to show in the edit form
    fields = ('title', 'description', 'original_url', 'category')
    
    # Optional: read-only fields
    readonly_fields = ('date_posted',)

    # Fields to display in the admin list view
    list_display = ('title', 'category', 'formatted_date')


admin.site.register(Video, VideoAdmin)