from django.core.mail import send_mail
from django.conf import settings

FROM_EMAIL = settings.DEFAULT_FROM_EMAIL
ADMIN_EMAIL = "rempeterwisdom@gmail.com"


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


def send_partner_invite_email(email, token):
    """
    Sends an invite email when a partner request is approved.
    """
    invite_url = f"{settings.FRONTEND_URL}/partnership/signup/{token}"

    subject = "You're invited to become a Partner"
    message = f"""
Hello,

Your request to become a partner has been approved.

Please use the link below to complete your signup:
{invite_url}

⚠️ This link will expire in 3 days and can only be used once.

If you did not request this, you can safely ignore this email.
"""

    send_mail(
        subject=subject,
        message=message,
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[email],
        fail_silently=False,
    )


def send_partner_rejection_email(email, first_name, last_name):
    """
    Sends a rejection email when a partner request is declined.
    """
    subject = "Update on Your Partner Request"
    
    # Professional and compassionate rejection email
    message = f"""
Dear {first_name} {last_name},

Thank you for your interest in partnering with Prophet Namara Ernest Ministries.

After careful consideration, we regret to inform you that we are unable to approve your partner request at this time. 

We sincerely appreciate your interest and encourage you to continue following the ministry through our other channels.

We pray God's continued blessings upon your life.

In His Service,
Prophet Namara Ernest Ministries Team
"""
    
    html_message = f"""
<!DOCTYPE html>
<html>
<head>
    <style>
        body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
        .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
        .header {{ text-align: center; margin-bottom: 30px; }}
        .content {{ margin-bottom: 30px; }}
        .footer {{ margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; 
                  font-size: 14px; color: #666; text-align: center; }}
        .signature {{ margin-top: 20px; font-style: italic; }}
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h2>Update on Your Partner Request</h2>
        </div>
        
        <div class="content">
            <p>Dear {first_name} {last_name},</p>
            
            <p>Thank you for your interest in partnering with Prophet Namara Ernest Ministries.</p>
            
            <p>After careful consideration, we regret to inform you that we are unable to approve your partner request at this time.</p>
            
            <p>We sincerely appreciate your interest and encourage you to continue following the ministry through our other channels.</p>
            
            <p>We pray God's continued blessings upon your life.</p>
        </div>
        
        <div class="footer">
            <div class="signature">
                In His Service,<br>
                <strong>Prophet Namara Ernest Ministries Team</strong>
            </div>
        </div>
    </div>
</body>
</html>
"""
    
    send_mail(
        subject=subject,
        message=message,
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[email],
        html_message=html_message,
        fail_silently=False,
    )