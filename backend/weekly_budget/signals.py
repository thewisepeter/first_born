from django.db.models.signals import post_save
from django.dispatch import receiver
from django.contrib.contenttypes.models import ContentType
from .models import WeeklyBudget
from core.models import Activity

@receiver(post_save, sender=WeeklyBudget)
def create_budget_activity(sender, instance, created, **kwargs):
    """Create activity when a new weekly budget is created"""
    if created and instance.is_published:
        Activity.objects.create(
            content_type=ContentType.objects.get_for_model(instance),
            object_id=instance.id,
            action_type='budget_created',
            title=f"Weekly Budget: {instance.title}",
            description=f"Target: UGX {instance.target_amount:,.2f} for week of {instance.start_date}",
            is_public=True,
        )