from django.db import models
from django.utils import timezone
from urllib.parse import urlparse, parse_qs


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
    )

    title = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)

    # User will ONLY paste a normal YouTube URL here
    original_url = models.URLField(null=False, blank=False, default='https://youtu.be/h9fDRNOlDMM?si=7rDFj-ZW5pkvEagb')

    embed_id = models.CharField(max_length=50, default='h9fDRNOlDMM')
    source_url = models.URLField(blank=True, null=False, default='https://www.youtube.com/embed/h9fDRNOlDMM')
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES, default='Prophecy')
    date_posted = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title

    def formatted_date(self):
        return self.date_posted.strftime('%B %d, %Y')

    def save(self, *args, **kwargs):
        if self.original_url:
            try:
                video_id = extract_youtube_id(self.original_url)
                self.embed_id = video_id
                self.source_url = f"https://www.youtube.com/embed/{video_id}"
            except Exception:
                pass  # Optional: handle invalid URL
        super().save(*args, **kwargs)

def extract_youtube_id(url: str) -> str:
    parsed = urlparse(url)

    # Short URLs (youtu.be)
    if 'youtu.be' in parsed.netloc:
        return parsed.path.lstrip('/')

    # Normal URLs (youtube.com/watch?v=xxxx)
    if 'youtube.com' in parsed.netloc:
        query = parse_qs(parsed.query)
        if 'v' in query:
            return query['v'][0]

    raise ValueError("Invalid or unsupported YouTube URL")
