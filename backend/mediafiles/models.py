from django.db import models
from django.utils import timezone

class Audio(models.Model):
    title = models.CharField(max_length=255)
    speaker = models.CharField(max_length=255, editable=False, default='Prophet Namara Ernest')
    date = models.DateTimeField(default=timezone.now, blank=True, null=True)
    active = models.BooleanField(default=False)
    description = models.TextField(blank=True, null=True)
    drive_url = models.URLField()

    def __str__(self):
        return self.title

class Video(models.Model):
    CATEGORY_CHOICES = (
        ('Prophecy', 'Prophecy'),
        ('Testimony', 'Testimony'),
        ('Christmas Message', 'Christmas Message'),
        ('Sunday Service', 'Sunday Service'),
        # Add more as needed
    )

    title = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    embed_id = models.CharField(max_length=50, default='dQw4w9WgXcQ')  # e.g., 'dQw4w9WgXcQ'
    source_url = models.URLField(blank=True, null=False, default='https://www.youtube.com/embed/V85KJHciV9M?si=WBM1m9aOIXI-_5qf') 
    duration = models.CharField(max_length=10, blank=True, null=True)  # e.g., '35:30'
    views = models.CharField(max_length=10, blank=True, null=True)  # e.g., '5.1K'
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES, default='Prophecy')
    date_posted = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title

    def formatted_date(self):
        return self.date_posted.strftime('%B %d, %Y')  # e.g., 'December 24, 2023'

