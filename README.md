# first_born
This is v2 of ministry prophetnamara.org with a nextjs front end and a django backend. 

## Sending email through Hostinger

Set these values in `backend/.env` locally and in the backend environment on the
deployed server. Replace existing email entries rather than adding duplicates:

```dotenv
EMAIL_HOST=smtp.hostinger.com
EMAIL_PORT=465
EMAIL_USE_SSL=True
EMAIL_USE_TLS=False
EMAIL_HOST_USER=info@prophetnamara.org
EMAIL_HOST_PASSWORD=<password for the info@prophetnamara.org mailbox>
DEFAULT_FROM_EMAIL=info@prophetnamara.org
```

Enter the mailbox password privately; do not commit it. Restart Django after
updating the environment. SSL on port 465 and STARTTLS are different modes;
do not enable both `EMAIL_USE_SSL` and `EMAIL_USE_TLS`.

These shared settings change the sender for inquiries, automatic replies,
testimonies, and partnership emails. Recipients remain unchanged. Inquiries
are delivered to `info@prophetnamara.org`, and automatic replies go to the visitor.
Existing Gmail settings remain the fallback until the environment is updated.

Hostinger configuration reference:
https://www.hostinger.com/support/1575756-how-to-get-email-account-configuration-details-for-hostinger-email/
