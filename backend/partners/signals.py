from django.db.models.signals import post_save
from django.dispatch import receiver
from django.contrib.contenttypes.models import ContentType
from .models import Partner
from core.models import Activity

@receiver(post_save, sender=Partner)
def create_partner_activity(sender, instance, created, **kwargs):
    """Create activity when a new partner joins"""
    if created:
        Activity.objects.create(
            content_type=ContentType.objects.get_for_model(instance),
            object_id=instance.id,
            action_type='partner_joined',
            title=f"New Partner Joined!",
            description=f"Welcome {instance.user.get_full_name()} to the partner community!",
            actor=instance.user,
            is_public=True,
        )