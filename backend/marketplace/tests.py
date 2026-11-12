from io import BytesIO
from pathlib import Path
from tempfile import TemporaryDirectory
from unittest.mock import patch

from django.contrib.auth import get_user_model
from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import override_settings
from PIL import Image
from rest_framework.test import APITestCase

from partners.models import Partner
from .models import MarketplaceListing, MarketplaceListingImage


def photo(name='camera.jpg', fmt='JPEG', mime='image/jpeg', size=(4, 2)):
    buffer = BytesIO()
    with Image.new('RGB', size) as im:
        exif = Image.Exif()
        exif[274] = 6
        exif[270] = 'private metadata'
        im.save(buffer, format=fmt, exif=exif)
    return SimpleUploadedFile(name, buffer.getvalue(), content_type=mime)


class GalleryTests(APITestCase):
    url = '/api/marketplace/listings/'

    def setUp(self):
        tmp = TemporaryDirectory()
        self.addCleanup(tmp.cleanup)
        self.root = Path(tmp.name)
        self.enterContext(override_settings(MEDIA_ROOT=tmp.name))
        self.owner = get_user_model().objects.create_user(username='owner')
        Partner.objects.create(user=self.owner)
        self.client.force_authenticate(self.owner)
        self.data = dict(title='Market produce', description='Fresh fruit', listing_type='product',
                         location='Kampala', price='35.00', contact_method='message')

    def create(self, images=(), **extra):
        return self.client.post(self.url, {**self.data, 'tags': '["fruit","fresh"]',
                                **({'images': images} if images else {}), **extra}, format='multipart')

    def test_counts_formats_positions_metadata_and_urls(self):
        for count in range(4):
            files = [photo(), photo('camera.jpeg'), photo('camera.png', 'PNG', 'image/png')][:count]
            res = self.create(files)
            self.assertEqual(res.status_code, 201, res.data)
            listing = MarketplaceListing.objects.latest('pk')
            self.assertEqual(listing.tags, ['fruit', 'fresh'])
            self.assertEqual([im['position'] for im in res.data['images']], list(range(count)))
            self.assertEqual(self.client.get(f'{self.url}{listing.pk}/').data['images'], res.data['images'])
            for obj in listing.images.all():
                self.assertRegex(obj.image.name, r'^marketplace/gallery/[0-9a-f]{32}\.(png|jpg)$')
                with Image.open(obj.image.path) as im:
                    self.assertEqual(im.size, (2, 4))
                    self.assertFalse(im.getexif())
            card = self.client.get(self.url).data['results'][0]
            self.assertEqual(card['images'], res.data['images'])

    def test_invalid_uploads_leave_no_files_or_rows(self):
        for files in ([photo() for _ in range(4)], [photo('x.gif')], [photo(mime='image/png')],
                      [photo('x.png', 'JPEG', 'image/png')], [SimpleUploadedFile('x.jpg', b'broken', 'image/jpeg')],
                      [SimpleUploadedFile('large.jpg', b'x' * (5 * 1024**2 + 1), 'image/jpeg')],
                      [photo(size=(5000, 4001))]):
            res = self.create(files)
            self.assertEqual(res.status_code, 400, res.data)
            self.assertIn('images', res.data)
        self.assertFalse(MarketplaceListing.objects.exists())
        self.assertFalse(any(self.root.rglob('*')))

    def test_edit_remove_replace_and_preserve(self):
        images = self.create([photo(), photo(), photo()]).data['images']
        listing = MarketplaceListing.objects.get()
        url = f'{self.url}{listing.pk}/'
        self.assertEqual(self.client.patch(url, {'title': 'Changed'}, format='json').data['images'], images)
        self.assertEqual(self.client.patch(url, {'images': [photo()]}, format='multipart').status_code, 400)
        self.assertEqual(self.client.patch(url, {'remove_image_ids': [999]}, format='json').status_code, 400)
        old_path = Path(listing.images.first().image.path)
        with self.captureOnCommitCallbacks(execute=True):
            res = self.client.patch(url, {'remove_image_ids': [images[0]['id']], 'images': [photo()]}, format='multipart')
        self.assertEqual(res.status_code, 200, res.data)
        new = res.data['images']
        self.assertEqual([i['id'] for i in new[:2]], [i['id'] for i in images[1:]])
        self.assertEqual([i['position'] for i in new], [0, 1, 2])
        self.assertFalse(old_path.exists())

    def test_rollback_preserves_original_files(self):
        images = self.create([photo()]).data['images']
        listing = MarketplaceListing.objects.get()
        before = set(self.root.rglob('*'))
        with patch.object(MarketplaceListingImage, 'save', side_effect=RuntimeError('database write failed')):
            with self.assertRaises(RuntimeError):
                self.client.patch(f'{self.url}{listing.pk}/', {'remove_image_ids': [images[0]['id']],
                                  'images': [photo()]}, format='multipart')
        self.assertEqual(set(self.root.rglob('*')), before)
        self.assertEqual(listing.images.get().pk, images[0]['id'])

    def test_permissions_staff_and_legacy_json(self):
        external = 'https://example.com/legacy.jpg'
        res = self.client.post(self.url, {**self.data, 'image_url': external}, format='json')
        self.assertEqual(res.status_code, 201, res.data)
        listing = MarketplaceListing.objects.get()
        listing.image.save('legacy.jpg', photo())
        url = f'{self.url}{listing.pk}/'
        data = self.client.get(url).data
        self.assertEqual(data['images'], [])
        self.assertTrue(data['image'].endswith('/legacy.jpg'))
        self.assertEqual(data['image_url'], external)
        other = get_user_model().objects.create_user(username='other')
        self.client.force_authenticate(other)
        self.assertEqual(self.create().status_code, 400)
        Partner.objects.create(user=other)
        self.assertEqual(self.client.patch(url, {'images': [photo()]}, format='multipart').status_code, 403)
        other.is_staff = True
        other.save()
        self.assertEqual(self.client.patch(url, {'images': [photo()]}, format='multipart').status_code, 200)
        self.client.force_authenticate(None)
        self.assertIn(self.create().status_code, [401, 403])
