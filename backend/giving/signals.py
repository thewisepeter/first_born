from django.db.models.signals import post_save
from django.dispatch import receiver
from django.contrib.contenttypes.models import ContentType
from .models import Giving
from core.models import Activity

@receiver(post_save, sender=Giving)
def create_giving_activity(sender, instance, created, **kwargs):
    """Create activity when a giving is received"""
    if created and instance.status == 'completed':
        # Personal notification for the partner
        Activity.objects.create(
            content_type=ContentType.objects.get_for_model(instance),
            object_id=instance.id,
            action_type='giving_received',
            title=f"Thank you for your giving!",
            description=f"You gave UGX {instance.amount:,.2f} for {instance.get_giving_type_display()}",
            recipient=instance.partner.user,
            is_public=False,
        )
        
        # Public update for significant donations (optional threshold)
        if instance.amount >= 100000:  # UGX 100,000 threshold
            Activity.objects.create(
                content_type=ContentType.objects.get_for_model(instance),
                object_id=instance.id,
                action_type='giving_received',
                title=f"Thank you! Your giving has been received!",
                description=f"UGX {instance.amount:,.2f} contributed for {instance.get_giving_type_display()}",
                is_public=True,
            )