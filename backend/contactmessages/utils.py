from django.core.mail import send_mail
from django.conf import settings

ADMIN_EMAIL = "rempeterwisdom@gmail.com"  # replace with your email
FROM_EMAIL = settings.DEFAULT_FROM_EMAIL


# -------------------------------
# Admin Notifications
# -------------------------------
def send_contact_email(fullName, email, phone, message):
    subject = f"📩 New Inquiry Message from {fullName}"
    body = f"""
    You have received a new inquiry message:

    From: {fullName}
    Email: {email}
    Phone: {phone}

    Message:
    {message}
    """
    send_mail(subject, body, FROM_EMAIL, [ADMIN_EMAIL], fail_silently=False)


def send_testimony_email(firstName, lastName, email, phone, message):
    subject = f"🙏 New Testimony Shared by {firstName} {lastName}"
    body = f"""
    A new testimony has been shared:

    From: {firstName} {lastName}
    Email: {email}
    Phone: {phone}

    Testimony:
    {message}
    """
    send_mail(subject, body, FROM_EMAIL, [ADMIN_EMAIL], fail_silently=False)


# -------------------------------
# Auto-reply to user
# -------------------------------
def send_thank_you_email(to_email, first_name="Friend"):
    subject = "Thank you for reaching out to Prophet Namara Ministries."
    body = f"""
    Hi {first_name},

    Thank you for contacting Prophet Namara Ministries. 
    We have received your message and someone from our team will get back to you within 24 hours.

    Blessings,
    Prophet Namara Ernest Ministries
    """
    send_mail(subject, body, FROM_EMAIL, [to_email], fail_silently=False)
