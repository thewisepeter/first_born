from django.db import transaction
from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from django.contrib.contenttypes.models import ContentType
from .models import MarketplaceListing, MarketplaceListingImage
from core.models import Activity

@receiver(post_save, sender=MarketplaceListing)
def create_listing_activity(sender, instance, created, **kwargs):
    """Create activity when a new marketplace listing is added"""
    if created and instance.is_active and instance.status == 'available':
        Activity.objects.create(
            content_type=ContentType.objects.get_for_model(instance),
            object_id=instance.id,
            action_type='marketplace_listing',
            title=f"New Listing: {instance.title}",
            description=f"By {instance.partner.user.get_full_name()} • {instance.location}",
            actor=instance.partner.user,
            is_public=True,
        )



@receiver(post_delete, sender=MarketplaceListingImage)
def delete_gallery_file(sender, instance, **kwargs):
    storage, name = instance.image.storage, instance.image.name
    if name:
        transaction.on_commit(lambda: storage.delete(name), robust=True)
