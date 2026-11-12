"""Validation and storage lifecycle for partner-uploaded gallery photos."""
from io import BytesIO
from pathlib import Path
from uuid import uuid4
from struct import error as InvalidStructure

from django.core.files.base import ContentFile
from django.db import transaction
from PIL import Image, ImageOps, UnidentifiedImageError
from rest_framework import serializers

from .models import MarketplaceListing, MarketplaceListingImage

MAX_IMAGES = 3
MAX_BYTES = 5 * 1024 * 1024
MAX_PIXELS = 20_000_000
FORMATS = {'.jpg': 'JPEG', '.jpeg': 'JPEG', '.png': 'PNG'}


def normalize_photo(upload):
    fmt = FORMATS.get(Path(upload.name).suffix.lower())
    if not fmt or upload.content_type != {'JPEG': 'image/jpeg', 'PNG': 'image/png'}[fmt]:
        raise serializers.ValidationError('Select a JPEG or PNG with a matching extension and MIME type.')
    if upload.size > MAX_BYTES:
        raise serializers.ValidationError('Each image must be 5 MiB or smaller.')
    try:
        with Image.open(upload, formats=['JPEG', 'PNG']) as original:
            if original.format != fmt or original.width * original.height > MAX_PIXELS:
                raise serializers.ValidationError('Format must match the file and dimensions must not exceed 20 megapixels.')
            if getattr(original, 'n_frames', 1) != 1:
                raise serializers.ValidationError('Select a single-frame photo.')
            original.verify()
        upload.seek(0)
        with Image.open(upload) as original:
            oriented = ImageOps.exif_transpose(original)
            mode = 'RGBA' if fmt == 'PNG' and ('A' in oriented.getbands() or 'transparency' in oriented.info) else 'RGB'
            clean = oriented.convert(mode)
            clean.info.clear()
            output = BytesIO()
            clean.save(output, format=fmt)
            if output.tell() > MAX_BYTES:
                raise serializers.ValidationError('The normalized photo exceeds 5 MiB; use a smaller image.')
    except (UnidentifiedImageError, Image.DecompressionBombError, OSError, ValueError, SyntaxError, InvalidStructure) as exc:
        raise serializers.ValidationError('The image could not be decoded as a valid JPEG or PNG.') from exc
    suffix = 'jpg' if fmt == 'JPEG' else 'png'
    return ContentFile(output.getvalue(), name=f'{uuid4().hex}.{suffix}')


def save_with_gallery(save_listing, instance, uploads, remove_ids):
    written = []
    try:
        with transaction.atomic():
            if instance is not None:
                instance = MarketplaceListing.objects.select_for_update().get(pk=instance.pk)
            existing = list(instance.images.all()) if instance else []
            if set(remove_ids) - {photo.id for photo in existing}:
                raise serializers.ValidationError({'remove_image_ids': 'Unknown image for this listing.'})
            kept = [photo for photo in existing if photo.id not in remove_ids]
            if len(kept) + len(uploads) > MAX_IMAGES:
                raise serializers.ValidationError({'images': 'A listing can have at most three images.'})
            listing = save_listing(instance)
            if remove_ids:
                listing.images.filter(pk__in=remove_ids).delete()
                for index, photo in enumerate(kept):
                    if photo.position != index:
                        photo.position = index
                        photo.save(update_fields=['position'])
            for index, upload in enumerate(uploads, start=len(kept)):
                photo = MarketplaceListingImage(listing=listing, position=index)
                photo.image.save(upload.name, upload, save=False)
                written.append((photo.image.storage, photo.image.name))
                photo.save()
            return listing
    except Exception:
        for storage, name in written:
            storage.delete(name)
        raise
