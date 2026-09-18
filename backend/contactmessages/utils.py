from django.core.mail import EmailMessage, send_mail
from django.conf import settings

ADMIN_EMAIL = "info@prophetnamara.org"  # replace with your email
CONTACT_EMAIL = "info@prophetnamara.org"
FROM_EMAIL = settings.DEFAULT_FROM_EMAIL


def send_prophet_email(fullName, email, phone, message):
    return EmailMessage(
        subject=f"Message to the Prophet from {fullName}",
        body=f"From: {fullName}\nEmail: {email}\nPhone: {phone}\n\nMessage:\n{message}",
        from_email=settings.DEFAULT_FROM_EMAIL,
        to=["prophet@prophetnamara.com"],
        reply_to=[email],
    ).send(fail_silently=False)


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
    send_mail(subject, body, FROM_EMAIL, [CONTACT_EMAIL], fail_silently=False)


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
