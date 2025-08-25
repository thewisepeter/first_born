from django.core.mail import send_mail
from django.conf import settings

FROM_EMAIL = settings.DEFAULT_FROM_EMAIL
ADMIN_EMAIL = "rempeterwisdom@gmail.com"  # replace with your admin email


def send_partner_email(firstName, lastName, email, phone, message):
    """
    Sends a notification email to the admin when a new partner signs up.
    """
    subject = f"📩 New Partner Signup"
    body = f"""
    {firstName} {lastName} has signed up as a new partner with this commitment:

    "{message}"

    Contact details:
    Email: {email}
    Phone: {phone}
    """

    send_mail(
        subject,
        body,
        FROM_EMAIL,
        [ADMIN_EMAIL],
        fail_silently=False,
    )


def send_partner_acknowledgement(to_email, first_name="Friend"):
    """
    Sends a thank-you email to the partner after signing up.
    """
    subject = "Thank you for partnering with Prophet Namara Ernest 🙏"
    body = f"""
    Hi {first_name},

    Thank you for choosing to partner with Prophet Namara Ernest as He continues to establish and advance the Kingdom of God upon the earth.

    Someone from our team will get back to you within 24 hours.

    Blessings,
    Prophet Namara Ernest Ministries
    """
    send_mail(subject, body, FROM_EMAIL, [to_email], fail_silently=False)
