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

## Marketplace listing galleries

Listings can have zero to three gallery photos. Signed-in partners create listings at
`POST /api/marketplace/listings/`; owners and staff edit at
`PATCH /api/marketplace/listings/{id}/`. Send session cookies and the CSRF header.
Multipart writes use **one `images` part per new file**, **one `remove_image_ids`
part per saved image to remove**, ordinary scalar fields, and a JSON array string for
`tags`. Let the browser set the multipart boundary. Example: two `images` files and
`remove_image_ids=42` retain all other existing images and append the two new ones.
Omitting both fields preserves the gallery. Existing JSON writes still work.

List, detail and write responses include ordered `images`, e.g.
`[{"id":17,"url":"https://prophetnamara.org/media/marketplace/gallery/example.jpg","position":0}]`.
The first photo is the cover. Legacy uploaded images and external URLs remain
available as fallbacks. Legacy files are not imported, changed, or deleted by gallery edits.

Only JPEG and PNG photos are accepted (5 MiB and 20 million decoded pixels per
input). Django uses the existing Pillow dependency to decode, orient, and re-encode
them with UUID filenames and no source metadata. Files use Django's default
filesystem storage under `MEDIA_ROOT/marketplace/gallery/` (`backend/media/` locally).

### Deployment

Back up both the database and persistent media before deployment. Install the
existing pinned backend requirements and run `python manage.py migrate marketplace`
before starting the new backend workers. Rebuild/restart Next.js and restart the
Django application service. Keep media on persistent shared storage across
releases/replicas, writable by Django and readable/traversable by Nginx.

No production Nginx site config is tracked here. Verify the actual site's
`/media/` alias points to that same media directory (public, static files only).
Preserve the external HTTPS host/scheme when forwarding API requests so absolute
image URLs are reachable. Allow multipart POST/PATCH bodies at every proxy; for
example, set `client_max_body_size 16m;` on the listing API path to accommodate
three 5 MiB inputs plus form overhead. Test Nginx configuration before reload.
Verify a legacy cover and a new gallery after restarting, and include both
database and media files in ongoing backups.
