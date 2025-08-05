from django.db import models
from django.utils import timezone


class BlogPost(models.Model):
    STATUS_CHOICES = (
        ('Draft', 'Draft'),
        ('Published', 'Published'),
    )

    title = models.CharField(max_length=100)
    content = models.TextField()
    date_posted = models.DateTimeField(default=timezone.now)
    author = models.CharField(max_length=100, default="Prophet Namara Ernest")
    picture = models.ImageField(upload_to='blog_images/', default='blog_images/prophet_namara_logo.png')
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='Draft')

    def snippet(self, length=100):
        return self.content[:length] + '...' if len(self.content) > length else self.content

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
    title = models.CharField(max_length=150)
    snippet = models.TextField()
    author = models.CharField(max_length=100, blank=True, null=True)
    date_posted = models.DateTimeField(auto_now_add=True)
    picture = models.ImageField(upload_to='blog_images/', default='blog_images/prophet_namara_logo.png')
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return self.title

