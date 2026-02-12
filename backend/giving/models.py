# giving/models.py
from django.db import models
from django.conf import settings
from django.core.validators import MinValueValidator
from decimal import Decimal
import uuid


def generate_giving_transaction_id():
    return f"GIV-{uuid.uuid4().hex[:8].upper()}"


class Giving(models.Model):
    """
    Individual giving transactions for partners
    """
    
    TYPE_CHOICES = [
        ('weekly-partnership', 'Weekly Partnership'),
        ('radio-broadcast', 'Radio Broadcast Support'),
        ('youth-camp', 'Youth Camp Support'),
        ('bible-distribution', 'Bible Distribution'),
        ('fellowship', 'Fellowship Support'),
        ('ministry-support', 'General Ministry Support'),
        ('drive-contribution', 'Drive Contribution'),
        ('other', 'Other'),
    ]
    
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('processing', 'Processing'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
        ('cancelled', 'Cancelled'),
    ]
    
    PAYMENT_METHOD_CHOICES = [
        ('mobile-money', 'Mobile Money'),
        ('bank-transfer', 'Bank Transfer'),
        ('credit-card', 'Credit Card'),
        ('cash', 'Cash'),
        ('cheque', 'Cheque'),
    ]
    
    FREQUENCY_CHOICES = [
        ('one-time', 'One Time'),
        ('weekly', 'Weekly'),
        ('bi-weekly', 'Bi-Weekly'),
        ('monthly', 'Monthly'),
        ('quarterly', 'Quarterly'),
        ('annual', 'Annual'),
    ]
    
    # Basic Information
    partner = models.ForeignKey(
        'partners.Partner',
        on_delete=models.CASCADE,
        related_name='givings'
    )
    
    transaction_id = models.CharField(
        max_length=100, 
        unique=True, 
        editable=False,
        default=generate_giving_transaction_id
    )
    
    # Giving Details
    amount = models.DecimalField(
        max_digits=10, 
        decimal_places=2,
        validators=[MinValueValidator(Decimal('0.01'))]
    )
    
    giving_type = models.CharField(
        max_length=50, 
        choices=TYPE_CHOICES, 
        default='ministry-support'
    )
    
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    notes = models.TextField(blank=True)
    
    # Status & Dates
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='completed')
    date = models.DateField()  # Actual giving date
    recorded_at = models.DateTimeField(auto_now_add=True)
    processed_at = models.DateTimeField(null=True, blank=True)
    
    # Payment Method
    payment_method = models.CharField(
        max_length=50, 
        choices=PAYMENT_METHOD_CHOICES, 
        default='mobile-money'
    )
    
    # For scheduled/recurring giving
    is_scheduled = models.BooleanField(default=False)
    frequency = models.CharField(
        max_length=50, 
        choices=FREQUENCY_CHOICES, 
        default='one-time'
    )
    next_payment_date = models.DateField(null=True, blank=True)
    schedule_end_date = models.DateField(null=True, blank=True)
    
    # Linked to other entities (optional)
    drive = models.ForeignKey(
        'drives.Drive',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='giving_transactions'
    )
    
    # Verification
    is_verified = models.BooleanField(default=True)
    verified_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='verified_givings'
    )
    verified_at = models.DateTimeField(null=True, blank=True)
    
    # Receipt/Statement tracking
    receipt_sent = models.BooleanField(default=False)
    receipt_sent_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        ordering = ['-date', '-recorded_at']
        indexes = [
            models.Index(fields=['partner', 'date']),
            models.Index(fields=['status', 'date']),
        ]
    
    def __str__(self):
        return f"{self.partner} - {self.amount} - {self.date}"
    
    def save(self, *args, **kwargs):
        # Auto-verify if admin creates
        if not self.pk and not self.is_verified:
            from django.contrib.auth import get_user_model
            User = get_user_model()
            # You might want to add logic here to auto-verify admin-created givings
            pass
        
        super().save(*args, **kwargs)


class GivingGoal(models.Model):
    """
    Partner's giving goals (monthly, annual, etc.)
    """
    PERIOD_CHOICES = [
        ('monthly', 'Monthly'),
        ('quarterly', 'Quarterly'),
        ('annual', 'Annual'),
    ]
    
    partner = models.ForeignKey(
        'partners.Partner',
        on_delete=models.CASCADE,
        related_name='giving_goals'
    )
    
    period = models.CharField(max_length=20, choices=PERIOD_CHOICES, default='monthly')
    target_amount = models.DecimalField(max_digits=10, decimal_places=2)
    start_date = models.DateField()
    end_date = models.DateField()
    is_active = models.BooleanField(default=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-start_date']
        unique_together = ['partner', 'period', 'start_date']
    
    def __str__(self):
        return f"{self.partner} - {self.period} goal"
    
    @property
    def current_amount(self):
        """Calculate current giving amount for this period"""
        from django.db.models import Sum
        total = self.partner.givings.filter(
            status='completed',
            date__gte=self.start_date,
            date__lte=self.end_date
        ).aggregate(Sum('amount'))['amount__sum'] or 0
        return total
    
    @property
    def progress_percentage(self):
        if self.target_amount == 0:
            return 0
        return (self.current_amount / self.target_amount) * 100


class GivingStatement(models.Model):
    """
    Generated giving statements for partners
    """
    STATEMENT_TYPE_CHOICES = [
        ('quarterly', 'Quarterly'),
        ('annual', 'Annual'),
        ('custom', 'Custom Range'),
    ]
    
    partner = models.ForeignKey(
        'partners.Partner',
        on_delete=models.CASCADE,
        related_name='giving_statements'
    )
    
    statement_type = models.CharField(max_length=20, choices=STATEMENT_TYPE_CHOICES)
    period_start = models.DateField()
    period_end = models.DateField()
    
    # Generated document
    file = models.FileField(upload_to='giving_statements/', null=True, blank=True)
    file_url = models.URLField(blank=True)
    
    # Summary data (stored for quick access)
    total_amount = models.DecimalField(max_digits=10, decimal_places=2)
    transaction_count = models.PositiveIntegerField()
    summary_data = models.JSONField(default=dict, blank=True)  # Store breakdown
    
    # Metadata
    generated_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='generated_statements'
    )
    generated_at = models.DateTimeField(auto_now_add=True)
    downloaded_count = models.PositiveIntegerField(default=0)
    last_downloaded_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        ordering = ['-period_end']
    
    def __str__(self):
        return f"{self.partner} - {self.get_statement_type_display()} ({self.period_start} to {self.period_end})"
    
    def increment_download(self):
        """Record a download"""
        from django.utils import timezone
        self.downloaded_count += 1
        self.last_downloaded_at = timezone.now()
        self.save(update_fields=['downloaded_count', 'last_downloaded_at'])


class ScheduledGiving(models.Model):
    """
    Scheduled/recurring giving setup
    """
    STATUS_CHOICES = [
        ('active', 'Active'),
        ('paused', 'Paused'),
        ('cancelled', 'Cancelled'),
        ('completed', 'Completed'),
    ]
    
    partner = models.ForeignKey(
        'partners.Partner',
        on_delete=models.CASCADE,
        related_name='scheduled_givings'
    )
    
    # Giving details
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    giving_type = models.CharField(max_length=50, choices=Giving.TYPE_CHOICES)
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    notes = models.TextField(blank=True)
    
    # Schedule details
    frequency = models.CharField(max_length=50, choices=Giving.FREQUENCY_CHOICES)
    payment_method = models.CharField(max_length=50, choices=Giving.PAYMENT_METHOD_CHOICES)
    
    start_date = models.DateField()
    next_payment_date = models.DateField()
    end_date = models.DateField(null=True, blank=True)  # Optional end date
    
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active')
    
    # Linked entities
    drive = models.ForeignKey(
        'drives.Drive',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='scheduled_givings'
    )
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='created_scheduled_givings'
    )
    
    class Meta:
        ordering = ['next_payment_date']
    
    def __str__(self):
        return f"{self.partner} - {self.title} - {self.frequency}"
    
    def process_payment(self):
        """Process this scheduled payment (to be called by cron job)"""
        from django.utils import timezone
        
        # Create a new giving record
        giving = Giving.objects.create(
            partner=self.partner,
            amount=self.amount,
            giving_type=self.giving_type,
            title=f"Scheduled: {self.title}",
            description=self.description,
            notes=self.notes,
            payment_method=self.payment_method,
            is_scheduled=True,
            frequency=self.frequency,
            status='processing',
            date=timezone.now().date(),
            drive=self.drive
        )
        
        # Update next payment date based on frequency
        self.update_next_payment_date()
        
        return giving
    
    def update_next_payment_date(self):
        """Calculate next payment date based on frequency"""
        from datetime import timedelta
        from django.utils import timezone
        
        today = timezone.now().date()
        
        if self.frequency == 'weekly':
            next_date = today + timedelta(days=7)
        elif self.frequency == 'bi-weekly':
            next_date = today + timedelta(days=14)
        elif self.frequency == 'monthly':
            next_date = today + timedelta(days=30)
        elif self.frequency == 'quarterly':
            next_date = today + timedelta(days=90)
        elif self.frequency == 'annual':
            next_date = today + timedelta(days=365)
        else:  # one-time
            self.status = 'completed'
            self.save()
            return
        
        # Check if we've passed the end date
        if self.end_date and next_date > self.end_date:
            self.status = 'completed'
        else:
            self.next_payment_date = next_date
        
        self.save()