from django.db import models
from django.utils import timezone
import math

class BlogPost(models.Model):
    STATUS_CHOICES = (
        ('Draft', 'Draft'),
        ('Published', 'Published'),
    )

    title = models.CharField(max_length=100)
    content = models.TextField()
    author = models.CharField(max_length=100, default="Prophet Namara Ernest")
    date_posted = models.DateTimeField(default=timezone.now)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='Draft')
    category = models.CharField(max_length=100, default="Faith")
    tags = models.JSONField(default=list, blank=True)  # Frontend expects a list of strings
    likes = models.PositiveIntegerField(default=0)
    comments = models.PositiveIntegerField(default=0)  # You can later relate this to a Comment model
    read_time = models.CharField(max_length=20, blank=True)  # Store '5 min read' or auto-calculate
    image = models.ImageField(upload_to='blog_images/', default='blog_images/prophet_namara_logo.png')

    def excerpt(self):
        return self.content[:150] + '...' if len(self.content) > 150 else self.content

    def full_content(self):
        return self.content

    def get_read_time(self):
        # Estimate: 200 words per minute
        word_count = len(self.content.split())
        minutes = math.ceil(word_count / 200)
        return f"{minutes} min read"

    def image_url(self):
        if self.image and hasattr(self.image, 'url'):
            return self.image.url
        return ''

    def __str__(self):
        return f"{self.title} ({self.status})"


class Article(models.Model):
    title = models.CharField(max_length=100)
    content = models.TextField()
    page = models.CharField(max_length=50)
    date_posted = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return f"{self.title} on {self.page}"

class Testimony(models.Model):
    name = models.CharField(max_length=255, default='Peter Wisdom')
    image = models.ImageField(upload_to='testimonies/', default='blog_images/prophet_namara_logo.png')
    quote = models.TextField()
    role = models.CharField(max_length=255, default='CEO')

    def __str__(self):
        return self.name
