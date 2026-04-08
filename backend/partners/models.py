from django.conf import settings
from django.db import models
from django.utils import timezone
import uuid
from datetime import date
from dateutil.relativedelta import relativedelta


class Partner(models.Model):
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="partner_profile",
        null=True, blank=True
    )

    phone = models.CharField(max_length=30)
    commitment_note = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)

    # Extended Profile Fields
    partner_type = models.CharField(
        max_length=50,
        choices=[
            ('individual', 'Individual Partner'),
            ('company', 'Business Partner'),
        ],
        default='individual'
    )

    community = models.CharField(
        max_length=50,
        choices=[
            ('working', 'Working Class Community'),
            ('business', 'Business Community Partner'),
        ],
        default='working'
    )

    # Personal Information
    bio = models.TextField(blank=True, null=True)
    location = models.CharField(max_length=255, blank=True, null=True)
    organization = models.CharField(max_length=255, blank=True, null=True)
    total_given = models.DecimalField(max_digits=12, decimal_places=2, default=0)

    # Dates
    joined_at = models.DateTimeField(auto_now_add=True)
    member_since = models.DateField(auto_now_add=True)
    last_active = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-joined_at"]
        constraints = [
            models.UniqueConstraint(
                fields=["user"],
                name="unique_partner_per_user"
            )
        ]


    def __str__(self):
        if self.user:
            return self.user.get_full_name() or self.user.email
        return f"Partner #{self.pk}"

    
    @property
    def months_active(self):
        """Calculate months since joining"""
        if not self.member_since:
            return 0
        
        today = date.today()
        delta = relativedelta(date.today(), self.member_since)
        return delta.years * 12 + delta.months



class PartnerGoal(models.Model):
    """Partner's personal goals"""
    GOAL_CATEGORIES = [
        ('financial', 'Financial'),
        ('spiritual', 'Spiritual'),
        ('service', 'Service'),
        ('community', 'Community'),
    ]
    
    partner = models.ForeignKey(Partner, on_delete=models.CASCADE, related_name='goals')
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    category = models.CharField(max_length=50, choices=GOAL_CATEGORIES, default='financial')
    target_value = models.DecimalField(max_digits=10, decimal_places=2)
    current_value = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    deadline = models.DateField()
    is_active = models.BooleanField(default=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-is_active', 'deadline']
    
    def __str__(self):
        if self.partner and self.partner.user:
            return self.partner.user.get_full_name() or self.partner.user.email
        return f"Partner Goal #{self.pk}"

    
    @property
    def progress_percentage(self):
        if self.target_value <= 0:
            return 0
        return round((self.current_value / self.target_value) * 100, 2)

class PartnerRequest(models.Model):
    class Status(models.TextChoices):
        PENDING = "pending", "Pending"
        APPROVED = "approved", "Approved"
        REJECTED = "rejected", "Rejected"

    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=30)

    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.PENDING,
        db_index=True
    )

    reviewed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="reviewed_partner_requests"
    )

    created_at = models.DateTimeField(auto_now_add=True)
    reviewed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ["-created_at"]
        verbose_name = "Partner Request"
        verbose_name_plural = "Partner Requests"

    def __str__(self):
        return f"{self.email} ({self.status})"


class PartnerInvite(models.Model):
    email = models.EmailField(db_index=True)
    token = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)

    is_used = models.BooleanField(default=False)
    used_at = models.DateTimeField(null=True, blank=True)
    expires_at = models.DateTimeField()
    created_at = models.DateTimeField(auto_now_add=True)

    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        null=True,
        on_delete=models.SET_NULL,
        related_name="created_partner_invites"
    )

    partner_request = models.OneToOneField(
        PartnerRequest,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="invite"
    )

    class Meta:
        ordering = ["-created_at"]

    def is_valid(self):
        return (
            not self.is_used
            and self.expires_at
            and timezone.now() < self.expires_at
        )

    def __str__(self):
        return f"{self.email} | Used: {self.is_used}"


