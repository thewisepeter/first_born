# weekly_budget/models.py
from django.db import models
from django.conf import settings
from django.core.validators import MinValueValidator
from decimal import Decimal
from django.utils import timezone
from datetime import timedelta
import uuid

def generate_weekly_budget_id():
    return f"WB-{uuid.uuid4().hex[:8].upper()}"


class WeeklyBudget(models.Model):
    """
    Weekly budget tracking for ministry operations
    """
    STATUS_CHOICES = [
        ('active', 'Active'),
        ('completed', 'Completed'),
    ]
    
    # Identification
    budget_id = models.CharField(
        max_length=100, 
        unique=True, 
        editable=False,
        default=generate_weekly_budget_id
    )
    title = models.CharField(max_length=200, default="Ministry Weekly Budget")
    
    # Week Information
    start_date = models.DateField()
    end_date = models.DateField()
    
    # Financial Targets
    target_amount = models.DecimalField(
        max_digits=12, 
        decimal_places=2,
        validators=[MinValueValidator(Decimal('0.01'))]
    )
    current_amount = models.DecimalField(
        max_digits=12, 
        decimal_places=2, 
        default=0
    )
    
    # Status & Tracking
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active')
    is_published = models.BooleanField(default=True)
    
    # Created by admin
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='created_weekly_budgets'
    )
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-start_date']
        verbose_name = 'Weekly Budget'
        verbose_name_plural = 'Weekly Budgets'
    
    def __str__(self):
        return f"{self.title} - {self.start_date} to {self.end_date}"
    
    def save(self, *args, **kwargs):
        """Auto-calculate end_date from start_date if not provided"""
        # If end_date is not set, set it to 7 days after start_date
        if not self.end_date and self.start_date:
            from datetime import timedelta
            self.end_date = self.start_date + timedelta(days=6)  # Monday to Sunday (6 days later)
        
        # Also ensure end_date is 6 days after start_date if it's manually set incorrectly
        if self.start_date and self.end_date:
            from datetime import timedelta
            expected_end = self.start_date + timedelta(days=6)
            if self.end_date != expected_end:
                self.end_date = expected_end
        
        super().save(*args, **kwargs)
    
    @property
    def balance(self):
        """Calculate remaining balance"""
        target = self.target_amount or Decimal('0.00')
        current = self.current_amount or Decimal('0.00')
        return max(target - current, Decimal('0.00'))
    
    @property
    def progress_percentage(self):
        """Calculate progress percentage"""
        target = self.target_amount or Decimal('0.00')
        if target == 0:
            return 0
        percentage = (self.current_amount / target) * 100
        return min(percentage, 100)  # Cap at 100%
    
    @property
    def is_current_week(self):
        """Check if this is the current week's budget"""
        today = timezone.now().date()
        return self.start_date <= today <= self.end_date
    
    @property
    def days_remaining(self):
        """Days until budget week ends"""
        if self.end_date < timezone.now().date():
            return 0
        return (self.end_date - timezone.now().date()).days
    
    def add_contribution(self, amount, category=None, description=""):
        """Add contribution to this budget"""
        from decimal import Decimal
        
        if amount <= 0:
            raise ValueError("Amount must be greater than 0")
        
        self.current_amount += Decimal(str(amount))
        self.save(update_fields=['current_amount', 'updated_at'])
        
        # Create budget breakdown entry if category provided
        if category:
            BudgetBreakdown.objects.create(
                weekly_budget=self,
                category=category,
                amount=amount,
                description=description
            )
        
        # Update status if target reached
        if self.current_amount >= self.target_amount and self.status == 'active':
            self.status = 'completed'
            self.save(update_fields=['status', 'updated_at'])
        
        return self.current_amount


class BudgetCategory(models.Model):
    """
    Pre-defined budget categories
    """
    CATEGORY_TYPES = [
        ('ministry', 'Ministry Operations'),
        ('outreach', 'Outreach & Evangelism'),
        ('media', 'Media & Production'),
        ('facilities', 'Facilities & Maintenance'),
        ('staff', 'Staff Support'),
        ('missions', 'Missions & Travel'),
        ('resources', 'Resources & Materials'),
        ('other', 'Other Expenses'),
    ]
    
    name = models.CharField(max_length=100)
    category_type = models.CharField(max_length=50, choices=CATEGORY_TYPES)
    description = models.TextField(blank=True)
    
    # Budget allocation defaults
    default_percentage = models.DecimalField(
        max_digits=5, 
        decimal_places=2, 
        default=0,
        help_text="Default percentage allocation"
    )
    
    # Display order
    display_order = models.IntegerField(default=0)
    is_active = models.BooleanField(default=True)
    
    class Meta:
        ordering = ['display_order', 'name']
        verbose_name_plural = 'Budget Categories'
    
    def __str__(self):
        return self.name


class BudgetBreakdown(models.Model):
    """
    Detailed breakdown of budget allocations and contributions
    """
    weekly_budget = models.ForeignKey(
        WeeklyBudget,
        on_delete=models.CASCADE,
        related_name='breakdown_items'
    )
    
    category = models.ForeignKey(
        BudgetCategory,
        on_delete=models.SET_NULL,
        null=True,
        related_name='budget_breakdowns'
    )
    
    allocated_amount = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        validators=[MinValueValidator(Decimal('0.00'))]
    )
    
    current_amount = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=0
    )
    
    description = models.TextField(blank=True)
    
    # Percentage of total budget
    percentage = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=0,
        help_text="Percentage of total budget allocated to this category"
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-percentage']
        unique_together = ['weekly_budget', 'category']
    
    def __str__(self):
        return f"{self.category.name if self.category else 'Uncategorized'}: {self.allocated_amount}"
    
    @property
    def progress_percentage(self):
        """Progress for this category"""
        if self.allocated_amount == 0:
            return 0
        return (self.current_amount / self.allocated_amount) * 100
    
    @property
    def balance(self):
        """Remaining for this category"""
        return max(self.allocated_amount - self.current_amount, Decimal('0.00'))


class BudgetContribution(models.Model):
    """
    Individual contributions to weekly budgets
    """
    weekly_budget = models.ForeignKey(
        WeeklyBudget,
        on_delete=models.CASCADE,
        related_name='contributions'
    )
    
    partner = models.ForeignKey(
        'partners.Partner',
        on_delete=models.CASCADE,
        related_name='budget_contributions'
    )
    
    amount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(Decimal('0.01'))]
    )
    
    category = models.ForeignKey(
        BudgetCategory,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='contributions'
    )
    
    description = models.TextField(blank=True)
    is_anonymous = models.BooleanField(default=False)
    
    # Contribution details
    contribution_number = models.CharField(max_length=50, unique=True, editable=False)
    contributed_at = models.DateTimeField(auto_now_add=True)
    is_verified = models.BooleanField(default=True)
    
    # Payment method
    payment_method = models.CharField(
        max_length=50,
        choices=[
            ('mobile-money', 'Mobile Money'),
            ('bank-transfer', 'Bank Transfer'),
            ('cash', 'Cash'),
            ('other', 'Other'),
        ],
        default='mobile-money'
    )
    
    class Meta:
        ordering = ['-contributed_at']
    
    def __str__(self):
        return f"Contribution: {self.amount} to Week {self.weekly_budget.week_number}"
    
    def save(self, *args, **kwargs):
        if not self.contribution_number:
            self.contribution_number = f"BC-{uuid.uuid4().hex[:8].upper()}"
        
        super().save(*args, **kwargs)
        
        # Update budget totals
        self.weekly_budget.add_contribution(
            amount=self.amount,
            category=self.category,
            description=self.description
        )
        
        # Update breakdown if category specified
        if self.category:
            breakdown, created = BudgetBreakdown.objects.get_or_create(
                weekly_budget=self.weekly_budget,
                category=self.category,
                defaults={
                    'allocated_amount': 0,
                    'current_amount': self.amount
                }
            )
            if not created:
                breakdown.current_amount += self.amount
                breakdown.save()


class WeeklyBudgetStats(models.Model):
    """
    Store aggregated statistics for quick access
    """
    year = models.IntegerField()
    week_number = models.IntegerField()
    
    # Totals
    total_target = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    total_raised = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    total_contributions = models.IntegerField(default=0)
    total_partners = models.IntegerField(default=0)
    
    # By category
    category_breakdown = models.JSONField(default=dict, blank=True)
    
    # Previous week comparison
    previous_week_total = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    week_over_week_change = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    
    # Generated at
    generated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ['year', 'week_number']
        ordering = ['-year', '-week_number']
    
    def __str__(self):
        return f"Week {self.week_number}, {self.year} Stats"