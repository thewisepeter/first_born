# drives/models.py
from django.db import models
from django.conf import settings
from django.core.validators import MinValueValidator
from decimal import Decimal

from django.forms import ValidationError

class Drive(models.Model):
    """Ministry project/campaign that partners can financially support"""
    
    STATUS_CHOICES = [
        ('planning', 'Planning'),
        ('active', 'Active'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    ]
    
    CATEGORY_CHOICES = [
        ('saturday_fellowship', 'Saturday Fellowship'),
        ('spirit_world', 'Spirit World'),
        ('office_rent', 'Office Rent'),
        ('other', 'Other'),
    ]
    
    # Basic Information
    title = models.CharField(max_length=200)
    description = models.TextField()
    
    # Status & Category
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active')
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES)
    
    # Financial Goals
    goal_amount = models.DecimalField(
        max_digits=12, 
        decimal_places=2,
        validators=[MinValueValidator(Decimal('0.01'))]
    )
    current_amount = models.DecimalField(
        max_digits=12, 
        decimal_places=2, 
        default=0
    )
    
    # Dates
    start_date = models.DateField()
    end_date = models.DateField(null=True, blank=True)
    
    # Visuals
    color_scheme = models.CharField(
        max_length=50, 
        default='purple',
        choices=[
            ('purple', 'Purple'),
            ('blue', 'Blue'),
            ('green', 'Green'),
            ('orange', 'Orange'),
            ('red', 'Red'),
        ]
    )
    
    # Flags
    is_featured = models.BooleanField(default=False)
    is_urgent = models.BooleanField(default=False)
    is_published = models.BooleanField(default=True)
    
    # Tracking
    views_count = models.PositiveIntegerField(default=0)
    contributions_count = models.PositiveIntegerField(default=0)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    # Admin creator
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='created_drives'
    )
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['status', 'is_published']),
            models.Index(fields=['category', 'is_featured']),
        ]
    
    def __str__(self):
        return self.title
    
    @property
    def progress_percentage(self):
        """Calculate fundraising progress percentage safely"""
        if not self.goal_amount or self.goal_amount == 0:
            return 0

        percentage = (self.current_amount / self.goal_amount) * 100
        return min(percentage, 100)

    
    @property
    def days_remaining(self):
        """Calculate days remaining until end date"""
        if not self.end_date:
            return None
        from django.utils import timezone
        from datetime import date
        
        today = date.today()
        remaining = (self.end_date - today).days
        return max(0, remaining) if remaining else 0
    
    @property
    def is_active(self):
        """Check if drive is currently active"""
        if self.status != 'active':
            return False
        if not self.is_published:
            return False
        if self.end_date:
            from datetime import date
            return date.today() <= self.end_date
        return True
    
    def record_view(self):
        """Increment view count"""
        self.views_count += 1
        self.save(update_fields=['views_count'])


class DriveContribution(models.Model):
    """Financial contributions to drives (cash only per requirement)"""
    
    drive = models.ForeignKey(
        Drive, 
        on_delete=models.CASCADE, 
        related_name='contributions'
    )
    
    partner = models.ForeignKey(
        'partners.Partner',
        on_delete=models.CASCADE,
        related_name='drive_contributions'
    )
    
    # Financial contribution details
    amount = models.DecimalField(
        max_digits=10, 
        decimal_places=2,
        validators=[MinValueValidator(Decimal('0.01'))]
    )
    
    # Contribution details
    is_anonymous = models.BooleanField(default=False)
    
    
    # Status tracking
    is_verified = models.BooleanField(default=True)  # Auto-verify for now
    verified_at = models.DateTimeField(null=True, blank=True)
    
    # Metadata
    contribution_number = models.CharField(max_length=50, unique=True, editable=False)
    contributed_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-contributed_at']
        indexes = [
            models.Index(fields=['drive', 'contributed_at']),
            models.Index(fields=['partner', 'contributed_at']),
        ]
    
    def __str__(self):
        return f"Contribution #{self.contribution_number}"
    
    def save(self, *args, **kwargs):
        if not self.contribution_number:
            # Generate unique contribution number
            import uuid
            self.contribution_number = f"CONT-{uuid.uuid4().hex[:8].upper()}"
        
        super().save(*args, **kwargs)


class DriveUpdate(models.Model):
    """Updates/news about drives (posted by admin ONLY)"""
    
    UPDATE_TYPE_CHOICES = [
        ('progress', 'Progress Update'),
        ('milestone', 'Milestone Reached'),
        ('story', 'Impact Story'),
        ('need', 'Urgent Need'),
        ('general', 'General Update'),
    ]
    
    drive = models.ForeignKey(
        Drive, 
        on_delete=models.CASCADE, 
        related_name='updates'
    )
    
    author = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='drive_updates'
    )
    
    title = models.CharField(max_length=200)
    content = models.TextField()
    update_type = models.CharField(
        max_length=20, 
        choices=UPDATE_TYPE_CHOICES, 
        default='progress'
    )
    
    
    is_pinned = models.BooleanField(default=False)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-is_pinned', '-created_at']
    
    def __str__(self):
        return f"{self.drive.title} - {self.title}"
    
    def clean(self):
        """Validate that author is an admin"""
        super().clean()
        
        # Check if author exists and is admin/staff
        if self.author and not (self.author.is_staff or self.author.is_superuser):
            raise ValidationError(
                {'author': 'Drive updates can only be created by administrators.'}
            )
    
    def save(self, *args, **kwargs):
        # Run full validation including clean() method
        self.full_clean()
        super().save(*args, **kwargs)