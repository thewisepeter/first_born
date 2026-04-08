# opportunities/models.py
from django.db import models
from django.conf import settings
from django.core.validators import MinValueValidator
from decimal import Decimal

class Opportunity(models.Model):
    """
    Partner Opportunities: Job openings, tenders, contracts
    """
    
    TYPE_CHOICES = [
        ('job', 'Job Opening'),
        ('tender', 'Tender/Bid'),
        ('contract', 'Contract'),
        ('volunteer', 'Volunteer Position'),
        ('internship', 'Internship'),
        ('other', 'Other'),
    ]
    
    COMMUNITY_CHOICES = [
        ('business', 'Business Class Community'),
        ('working', 'Working Class Community'),
    ]
    
    STATUS_CHOICES = [
        ('active', 'Active'),
        ('expired', 'Expired'),
    ]
    
    # Basic Information
    title = models.CharField(max_length=200)
    description = models.TextField()
    company = models.CharField(max_length=200)
    
    # Classification
    opportunity_type = models.CharField(max_length=50, choices=TYPE_CHOICES, default='job')
    community = models.CharField(max_length=50, choices=COMMUNITY_CHOICES, default='general')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active')
    
    # Location & Logistics
    location = models.CharField(max_length=255)
    is_remote = models.BooleanField(default=False)
    is_hybrid = models.BooleanField(default=False)
    
    # Dates
    posted_date = models.DateField(auto_now_add=True)
    deadline = models.DateField()
    
    # Contact & Application
    application_link = models.URLField(max_length=500, blank=True)
    
    # Requirements (stored as JSON or separate model)
    requirements = models.JSONField(default=list, blank=True)
    
    # Flags
    is_featured = models.BooleanField(default=False)
    is_urgent = models.BooleanField(default=False)
    is_verified = models.BooleanField(default=True)
    
    # Metadata
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='created_opportunities'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-is_featured', '-posted_date']
        verbose_name_plural = 'Opportunities'
        indexes = [
            models.Index(fields=['status', 'deadline']),
            models.Index(fields=['community', 'opportunity_type']),
        ]
    
    def __str__(self):
        return self.title
    
    @property
    def days_remaining(self):
        """Calculate days remaining until deadline"""
        from datetime import date
        today = date.today()
        remaining = (self.deadline - today).days
        return max(0, remaining) if remaining else 0
    
    @property
    def is_active(self):
        """Check if opportunity is still active"""
        if self.status != 'active':
            return False
        return self.days_remaining > 0
    