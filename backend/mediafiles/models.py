from django.db import models

class Audio(models.Model):
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    drive_url = models.URLField()
    date_posted = models.DateTimeField(auto_now_add=True)
    is_active = models.BooleanField(default=False)

    def __str__(self):
        return self.title

class Video(models.Model):
    CATEGORY_CHOICES = (
        ('Prophecy', 'Prophecy'),
        ('Testimony', 'Testimony'),
    )
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    drive_url = models.URLField()
    date_posted = models.DateTimeField(auto_now_add=True)
    category = models.CharField(max_length=10, choices=CATEGORY_CHOICES, default='Prophecy')

    def __str__(self):
        return self.title
