from django.db.models.signals import post_save
from django.dispatch import receiver
from django.contrib.contenttypes.models import ContentType
from .models import Opportunity
from core.models import Activity

@receiver(post_save, sender=Opportunity)
def create_opportunity_activity(sender, instance, created, **kwargs):
    """Create activity when a new opportunity is added"""
    if created and instance.status == 'active' and instance.is_active:
        Activity.objects.create(
            content_type=ContentType.objects.get_for_model(instance),
            object_id=instance.id,
            action_type='opportunity_created',
            title=f"New Opportunity: {instance.title}",
            description=f"{instance.company} - {instance.location}",
            is_public=True,
        )