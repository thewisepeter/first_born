# marketplace/models.py
from django.db import models
from django.conf import settings
from django.core.validators import MinValueValidator
from decimal import Decimal
import uuid

class MarketplaceCategory(models.Model):
    """
    Pre-defined marketplace categories
    """
    CATEGORY_TYPES = [
        ('product', 'Product'),
        ('service', 'Service'),
        ('need', 'Need'),
    ]
    
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    category_type = models.CharField(max_length=20, choices=CATEGORY_TYPES, default='product')
    icon_name = models.CharField(max_length=50, blank=True)  # For frontend icons
    
    # Display order
    display_order = models.IntegerField(default=0)
    is_active = models.BooleanField(default=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['display_order', 'name']
        verbose_name_plural = 'Marketplace Categories'
    
    def __str__(self):
        return self.name
    
    @property
    def listings_count(self):
        """Count of active listings in this category"""
        return self.listings.filter(status='available').count()


class MarketplaceListing(models.Model):
    """
    Marketplace listing posted by partners
    """
    LISTING_TYPES = [
        ('product', 'Product'),
        ('service', 'Service'),
        ('need', 'Need'),
    ]
    
    STATUS_CHOICES = [
        ('available', 'Available'),
        ('pending', 'Pending'),
        ('sold', 'Sold/Completed'),
        ('unavailable', 'Unavailable'),
        ('removed', 'Removed'),
    ]
    
    CONTACT_METHOD_CHOICES = [
        ('phone', 'Phone'),
        ('email', 'Email'),
        ('whatsapp', 'WhatsApp'),
        ('message', 'In-App Message'),
    ]
    
    CURRENCY_CHOICES = [
        ('UGX', 'Ugandan Shilling'),
        ('USD', 'US Dollar'),
        ('KES', 'Kenyan Shilling'),
        ('TZS', 'Tanzanian Shilling'),
    ]
    
    # Basic Information
    title = models.CharField(max_length=200)
    description = models.TextField()
    
    # Classification
    listing_type = models.CharField(max_length=20, choices=LISTING_TYPES)
    category = models.ForeignKey(
        MarketplaceCategory,
        on_delete=models.SET_NULL,
        null=True,
        related_name='listings'
    )
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='available')
    
    # Pricing
    price = models.DecimalField(
        max_digits=10, 
        decimal_places=2,
        null=True,
        blank=True,
        validators=[MinValueValidator(Decimal('0.00'))]
    )
    currency = models.CharField(max_length=10, choices=CURRENCY_CHOICES, default='UGX')
    is_price_negotiable = models.BooleanField(default=False)
    is_free = models.BooleanField(default=False)
    
    # Location
    location = models.CharField(max_length=255)
    is_location_flexible = models.BooleanField(default=False)
    
    # Images
    image = models.ImageField(upload_to='marketplace/listings/', null=True, blank=True)
    image_url = models.URLField(blank=True)  # For external image URLs
    
    # Contact Information
    contact_method = models.CharField(max_length=20, choices=CONTACT_METHOD_CHOICES)
    contact_info = models.CharField(max_length=255, blank=True)  # Phone/email for display
    contact_visible = models.BooleanField(default=True)
    
    # Partner Information
    partner = models.ForeignKey(
        'partners.Partner',
        on_delete=models.CASCADE,
        related_name='marketplace_listings'
    )
    
    # Tags for searchability
    tags = models.JSONField(default=list, blank=True)
    
    # Engagement Metrics
    views_count = models.PositiveIntegerField(default=0)
    likes_count = models.PositiveIntegerField(default=0)
    saves_count = models.PositiveIntegerField(default=0)
    inquiries_count = models.PositiveIntegerField(default=0)
    
    # Flags
    is_featured = models.BooleanField(default=False)
    is_urgent = models.BooleanField(default=False)
    is_verified = models.BooleanField(default=False)
    
    # Timestamps
    posted_date = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    expiry_date = models.DateField(null=True, blank=True)  # Auto-expire listings
    
    # Metadata
    slug = models.SlugField(max_length=300, unique=True, blank=True)
    
    class Meta:
        ordering = ['-is_featured', '-posted_date']
        indexes = [
            models.Index(fields=['listing_type', 'status']),
            models.Index(fields=['category', 'status']),
            models.Index(fields=['partner', 'status']),
        ]
    
    def __str__(self):
        return self.title
    
    def save(self, *args, **kwargs):
        # Generate slug if not exists
        if not self.slug:
            from django.utils.text import slugify
            base_slug = slugify(self.title)
            self.slug = base_slug
            counter = 1
            while MarketplaceListing.objects.filter(slug=self.slug).exists():
                self.slug = f"{base_slug}-{counter}"
                counter += 1
        
        # Set expiry date (default 30 days)
        if not self.expiry_date:
            from datetime import timedelta
            from django.utils import timezone
            self.expiry_date = timezone.now().date() + timedelta(days=30)
        
        super().save(*args, **kwargs)
    
    @property
    def is_active(self):
        """Check if listing is still active"""
        from django.utils import timezone
        if self.status not in ['available', 'pending']:
            return False
        if self.expiry_date and self.expiry_date < timezone.now().date():
            return False
        return True
    
    @property
    def days_remaining(self):
        """Days until expiry"""
        if not self.expiry_date:
            return None
        from django.utils import timezone
        today = timezone.now().date()
        remaining = (self.expiry_date - today).days
        return max(0, remaining) if remaining else 0
    
    def increment_views(self):
        """Increment view count"""
        self.views_count += 1
        self.save(update_fields=['views_count'])
    
    def increment_likes(self):
        """Increment like count"""
        self.likes_count += 1
        self.save(update_fields=['likes_count'])
    
    def increment_inquiries(self):
        """Increment inquiry count"""
        self.inquiries_count += 1
        self.save(update_fields=['inquiries_count'])


class MarketplaceLike(models.Model):
    """
    Track likes on marketplace listings
    """
    listing = models.ForeignKey(
        MarketplaceListing,
        on_delete=models.CASCADE,
        related_name='likes'
    )
    partner = models.ForeignKey(
        'partners.Partner',
        on_delete=models.CASCADE,
        related_name='marketplace_likes'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ['listing', 'partner']
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.partner} likes {self.listing}"


class MarketplaceSave(models.Model):
    """
    Track saved listings by partners
    """
    listing = models.ForeignKey(
        MarketplaceListing,
        on_delete=models.CASCADE,
        related_name='saves'
    )
    partner = models.ForeignKey(
        'partners.Partner',
        on_delete=models.CASCADE,
        related_name='marketplace_saves'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ['listing', 'partner']
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.partner} saved {self.listing}"


class MarketplaceInquiry(models.Model):
    """
    Inquiries about marketplace listings
    """
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('responded', 'Responded'),
        ('closed', 'Closed'),
    ]
    
    listing = models.ForeignKey(
        MarketplaceListing,
        on_delete=models.CASCADE,
        related_name='inquiries'
    )
    
    inquirer = models.ForeignKey(
        'partners.Partner',
        on_delete=models.CASCADE,
        related_name='marketplace_inquiries'
    )
    
    message = models.TextField()
    contact_method = models.CharField(max_length=20, choices=MarketplaceListing.CONTACT_METHOD_CHOICES)
    contact_info = models.CharField(max_length=255)
    
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    responded_at = models.DateTimeField(null=True, blank=True)
    response = models.TextField(blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
        verbose_name_plural = 'Marketplace Inquiries'
    
    def __str__(self):
        return f"Inquiry about {self.listing.title}"
    
    def mark_as_responded(self, response_text):
        """Mark inquiry as responded"""
        from django.utils import timezone
        self.status = 'responded'
        self.response = response_text
        self.responded_at = timezone.now()
        self.save()


class MarketplaceReport(models.Model):
    """
    Reports on marketplace listings
    """
    REPORT_REASONS = [
        ('spam', 'Spam or misleading'),
        ('fraud', 'Fraud or scam'),
        ('inappropriate', 'Inappropriate content'),
        ('prohibited', 'Prohibited item'),
        ('wrong_category', 'Wrong category'),
        ('other', 'Other'),
    ]
    
    listing = models.ForeignKey(
        MarketplaceListing,
        on_delete=models.CASCADE,
        related_name='reports'
    )
    
    reporter = models.ForeignKey(
        'partners.Partner',
        on_delete=models.CASCADE,
        related_name='marketplace_reports'
    )
    
    reason = models.CharField(max_length=50, choices=REPORT_REASONS)
    details = models.TextField()
    
    status = models.CharField(
        max_length=20,
        choices=[
            ('pending', 'Pending Review'),
            ('reviewed', 'Reviewed'),
            ('resolved', 'Resolved'),
            ('dismissed', 'Dismissed'),
        ],
        default='pending'
    )
    
    reviewed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='reviewed_marketplace_reports'
    )
    reviewed_at = models.DateTimeField(null=True, blank=True)
    review_notes = models.TextField(blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']
        unique_together = ['listing', 'reporter']
    
    def __str__(self):
        return f"Report on {self.listing.title}"