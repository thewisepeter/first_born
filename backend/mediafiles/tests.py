from django.test import TestCase
from django.core.exceptions import ValidationError
from django.urls import reverse
from django.contrib.auth import get_user_model
from .models import Livestream, livestream_embed_url


class LivestreamTests(TestCase):
    def setUp(self):
        self.user = get_user_model().objects.create_user(
            username='partner@example.com', email='partner@example.com', password='test-password'
        )
        self.client.force_login(self.user)

    def test_status_requires_login(self):
        self.client.logout()
        self.assertEqual(self.client.get(reverse('livestream-status')).status_code, 403)

    def test_public_status_defaults_to_offline(self):
        response = self.client.get(reverse('livestream-status'))
        self.assertEqual(response.status_code, 200)
        self.assertFalse(response.json()['is_live'])
        self.assertIsNone(response.json()['embed_url'])

    def test_public_status_exposes_safe_embed_without_source_url(self):
        Livestream.objects.create(
            title='Sunday service', is_live=True,
            video_url='https://www.youtube.com/live/abcdefghijk?feature=share',
        )
        response = self.client.get(reverse('livestream-status'))
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()['embed_url'], 'https://www.youtube-nocookie.com/embed/abcdefghijk')
        self.assertNotIn('video_url', response.json())

    def test_supported_video_urls(self):
        for url in (
            'https://youtu.be/abcdefghijk',
            'https://youtube.com/watch?v=abcdefghijk',
            'https://www.youtube.com/live/abcdefghijk',
            'https://m.youtube.com/embed/abcdefghijk',
            'https://youtube.com/shorts/abcdefghijk',
        ):
            with self.subTest(url=url):
                self.assertEqual(livestream_embed_url(url), 'https://www.youtube-nocookie.com/embed/abcdefghijk')

    def test_rejects_unsafe_or_unsupported_urls(self):
        for url in (
            'https://youtube.com.evil.example/watch?v=abcdefghijk',
            'javascript:alert(1)',
            'https://youtube.com/watch?v=bad',
            'https://youtube.com@evil.example/watch?v=abcdefghijk',
            'https://youtube.com:1234/watch?v=abcdefghijk',
        ):
            with self.subTest(url=url), self.assertRaises(ValidationError):
                Livestream(title='Test', is_live=True, video_url=url).full_clean()

    def test_live_requires_video_url(self):
        with self.assertRaises(ValidationError):
            Livestream(title='Test', is_live=True).full_clean()
