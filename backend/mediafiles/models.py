from django.db import models
from django.utils import timezone
from django.core.exceptions import ValidationError
from urllib.parse import urlparse, parse_qs


class Audio(models.Model):
    CATEGORY_CHOICES = (
        ('Spirit_World', 'Spirit World'),
        ('Partners', 'Partners'),
    )

    title = models.CharField(max_length=255)
    speaker = models.CharField(max_length=255, editable=False, default='Prophet Namara Ernest')
    date = models.DateTimeField(default=timezone.now, blank=True, null=True)
    active = models.BooleanField(default=False)
    description = models.TextField(blank=True, null=True)
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES, default='Spirit_World')

    # User pastes this into the admin
    original_url = models.URLField(null=False, blank=False, default='https://drive.google.com/file/d/1CtcO2nRbULMYMoI4QuWNBt5m8yibF_sC/view?usp=sharing')

    # This will be auto-generated
    drive_url = models.URLField(blank=True, null=True)

    def __str__(self):
        return self.title

    def extract_drive_file_id(self, url):
        """
        Extract file ID from Google Drive URL formats.
        Supports:
        - https://drive.google.com/file/d/<ID>/view?usp=sharing
        - https://drive.google.com/open?id=<ID>
        - anything containing /d/<ID>/
        """
        import re

        patterns = [
            r'/file/d/([^/]+)',       # /file/d/<ID>
            r'id=([^&]+)'             # id=<ID>
        ]

        for pattern in patterns:
            match = re.search(pattern, url)
            if match:
                return match.group(1)

        return None

    def save(self, *args, **kwargs):
        if self.original_url:
            file_id = self.extract_drive_file_id(self.original_url)
            if file_id:
                self.drive_url = f"https://drive.google.com/file/d/{file_id}/preview"
        
        super().save(*args, **kwargs)


class Video(models.Model):
    CATEGORY_CHOICES = (
        ('Prophecy', 'Prophecy'),
        ('Testimony', 'Testimony'),
        ('Partners', 'Partners'),
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


def livestream_embed_url(url: str) -> str:
    """Accept only canonical YouTube video URLs and return a safe embed URL."""
    import re

    parsed = urlparse(url)
    host = (parsed.hostname or '').lower()
    try:
        valid_authority = not (parsed.username or parsed.password or parsed.port)
    except ValueError:
        valid_authority = False
    if parsed.scheme not in ('http', 'https') or not valid_authority:
        raise ValidationError('Enter a valid YouTube video URL.')

    parts = parsed.path.strip('/').split('/')
    video_id = None
    if host in ('youtube.com', 'www.youtube.com', 'm.youtube.com'):
        if parts == ['watch']:
            video_id = parse_qs(parsed.query).get('v', [None])[0]
        elif len(parts) == 2 and parts[0] in ('live', 'embed', 'shorts'):
            video_id = parts[1]
    elif host == 'youtu.be' and len(parts) == 1:
        video_id = parts[0]

    if not video_id or not re.fullmatch(r'[A-Za-z0-9_-]{11}', video_id):
        raise ValidationError('Enter a supported YouTube watch, live, short, or embed URL.')
    return f'https://www.youtube-nocookie.com/embed/{video_id}'


class Livestream(models.Model):
    title = models.CharField(max_length=255)
    video_url = models.URLField(blank=True)
    is_live = models.BooleanField(default=False)
    next_broadcast_at = models.DateTimeField(blank=True, null=True)
    offline_message = models.TextField(blank=True)

    def clean(self):
        super().clean()
        if self.is_live and not self.video_url:
            raise ValidationError({'video_url': 'A video URL is required while live.'})
        if self.video_url:
            try:
                livestream_embed_url(self.video_url)
            except ValidationError as error:
                raise ValidationError({'video_url': error.messages})

    @property
    def embed_url(self):
        return livestream_embed_url(self.video_url) if self.video_url else None

    def __str__(self):
        return self.title
