from django.db.models.signals import post_save
from django.dispatch import receiver
from django.contrib.contenttypes.models import ContentType
from .models import Drive
from core.models import Activity

@receiver(post_save, sender=Drive)
def create_drive_activity(sender, instance, created, **kwargs):
    """Create activity when a new drive is created"""
    if created and instance.is_published and instance.status == 'active':
        Activity.objects.create(
            content_type=ContentType.objects.get_for_model(instance),
            object_id=instance.id,
            action_type='drive_created',
            title=f"New Drive: {instance.title}",
            description=instance.description[:200] if instance.description else "",
            is_public=True,
        )