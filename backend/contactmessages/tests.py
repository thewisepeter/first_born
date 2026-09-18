from smtplib import SMTPException
from types import SimpleNamespace
from unittest.mock import patch

from django.core import mail
from django.test import SimpleTestCase, override_settings
from rest_framework.test import APIRequestFactory, force_authenticate

from .views import ProphetMessageCreateView


@override_settings(
    EMAIL_BACKEND='django.core.mail.backends.locmem.EmailBackend',
    DEFAULT_FROM_EMAIL='info@prophetnamara.org',
)
class ProphetMessageTests(SimpleTestCase):
    def setUp(self):
        self.factory = APIRequestFactory()
        self.payload = {
            'fullName': 'Test Partner',
            'email': 'partner@example.com',
            'phone': '+256 700 000 000',
            'message': 'A personal message for the Prophet.',
        }
        self.partner = SimpleNamespace(
            is_authenticated=True,
            partner_profile=SimpleNamespace(is_active=True),
        )

    def submit(self, user=None, payload=None):
        request = self.factory.post('/api/contactmessages/prophet/', payload or self.payload, format='json')
        if user is not None:
            force_authenticate(request, user=user)
        return ProphetMessageCreateView.as_view()(request)

    def test_sends_to_prophet_with_configured_sender_and_partner_reply_to(self):
        response = self.submit(self.partner)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(mail.outbox), 1)
        message = mail.outbox[0]
        self.assertEqual(message.to, ['prophet@prophetnamara.com'])
        self.assertEqual(message.from_email, 'info@prophetnamara.org')
        self.assertEqual(message.reply_to, ['partner@example.com'])
        self.assertIn(self.payload['message'], message.body)

    @patch('contactmessages.views.send_prophet_email')
    def test_rejects_anonymous_non_partner_and_inactive_partner(self, send):
        for user in [None, SimpleNamespace(is_authenticated=True), SimpleNamespace(
            is_authenticated=True, partner_profile=SimpleNamespace(is_active=False)
        )]:
            with self.subTest(user=user):
                self.assertEqual(self.submit(user).status_code, 403)
        send.assert_not_called()

    @patch('contactmessages.views.send_prophet_email')
    def test_rejects_invalid_fields_without_sending(self, send):
        for field, value in [('email', 'invalid'), ('message', 'short'), ('fullName', ' '), ('phone', 'abc')]:
            with self.subTest(field=field):
                response = self.submit(self.partner, {**self.payload, field: value})
                self.assertEqual(response.status_code, 400)
                self.assertIn(field, response.data)
        send.assert_not_called()

    @patch('contactmessages.views.send_prophet_email', side_effect=SMTPException('private SMTP details'))
    def test_mail_failure_returns_retryable_error(self, send):
        response = self.submit(self.partner)
        self.assertEqual(response.status_code, 503)
        self.assertNotIn('private SMTP details', str(response.data))

    @patch('contactmessages.views.send_prophet_email', return_value=0)
    def test_zero_messages_sent_is_not_reported_as_success(self, send):
        self.assertEqual(self.submit(self.partner).status_code, 503)

    def test_client_cannot_override_recipient(self):
        self.submit(self.partner, {**self.payload, 'to': 'other@example.com'})
        self.assertEqual(mail.outbox[0].to, ['prophet@prophetnamara.com'])
