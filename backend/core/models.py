from django.db import models
from django.conf import settings
from django.contrib.contenttypes.fields import GenericForeignKey
from django.contrib.contenttypes.models import ContentType
from django.utils import timezone

class Activity(models.Model):
    """
    Universal activity feed for all actions across the platform
    """
    ACTION_TYPES = [
        ('drive_created', 'New Drive Created'),
        ('drive_updated', 'Drive Updated'),
        ('opportunity_created', 'New Opportunity Added'),
        ('opportunity_updated', 'Opportunity Updated'),
        ('budget_created', 'New Weekly Budget'),
        ('budget_updated', 'Budget Updated'),
        ('marketplace_listing', 'New Marketplace Listing'),
        ('marketplace_inquiry', 'New Marketplace Inquiry'),
        ('giving_received', 'New Giving Received'),
        ('schedule_created', 'New Schedule Created'),
        ('partner_joined', 'New Partner Joined'),
    ]
    
    # Target object (using GenericForeignKey for flexibility)
    # Make these nullable since not all activities need to link to an object
    content_type = models.ForeignKey(ContentType, on_delete=models.CASCADE, null=True, blank=True)
    object_id = models.PositiveIntegerField(null=True, blank=True)
    content_object = GenericForeignKey('content_type', 'object_id')
    
    # Action details
    action_type = models.CharField(max_length=50, choices=ACTION_TYPES)
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    
    # Who performed the action (optional)
    actor = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='performed_activities'
    )
    
    # Who this notification is for (if specific)
    recipient = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='notifications'
    )
    
    # Metadata
    is_read = models.BooleanField(default=False)
    is_public = models.BooleanField(default=True)  # Show on recent updates
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['recipient', '-created_at']),
            models.Index(fields=['is_public', '-created_at']),
        ]
        verbose_name = 'Activity'
        verbose_name_plural = 'Activities'
    
    def __str__(self):
        return f"{self.get_action_type_display()}: {self.title}"