from django.contrib import admin
from django.utils import timezone
from datetime import timedelta
from .models import PartnerRequest, PartnerInvite, Partner
from .utils import send_partner_invite_email, send_partner_rejection_email


@admin.register(PartnerRequest)
class PartnerRequestAdmin(admin.ModelAdmin):
    list_display = ['email', 'first_name', 'last_name', 'status', 'created_at']
    list_filter = ['status', 'created_at']
    search_fields = ['email', 'first_name', 'last_name', 'phone']
    readonly_fields = ['created_at', 'reviewed_at']
    actions = ['approve_and_send_invite', 'reject_and_notify']
    
    def approve_and_send_invite(self, request, queryset):
        """
        Approve selected partner requests and send invitation emails.
        """
        approved_count = 0
        skipped_count = 0
        
        for partner_request in queryset.filter(status="pending"):
            # Check if user already has an active invite
            has_active_invite = PartnerInvite.objects.filter(
                email=partner_request.email,
                is_used=False,
                expires_at__gt=timezone.now()
            ).exists()

            if has_active_invite:
                skipped_count += 1
                continue

            # Create the invite
            invite = PartnerInvite.objects.create(
                email=partner_request.email,
                expires_at=timezone.now() + timedelta(days=3),
                created_by=request.user,
                partner_request=partner_request
            )

            # Send invite email
            try:
                send_partner_invite_email(
                    email=invite.email,
                    token=str(invite.token)
                )
            except Exception as e:
                self.message_user(
                    request, 
                    f"Failed to send email to {invite.email}: {str(e)}", 
                    level='error'
                )
                continue

            # Update request status
            partner_request.status = PartnerRequest.Status.APPROVED
            partner_request.reviewed_by = request.user
            partner_request.reviewed_at = timezone.now()
            partner_request.save()
            
            approved_count += 1

        # Show summary message
        messages = []
        if approved_count > 0:
            messages.append(f"{approved_count} request(s) approved and invitation emails sent.")
        if skipped_count > 0:
            messages.append(f"{skipped_count} request(s) skipped (already have active invites).")
        
        self.message_user(request, " ".join(messages))
    
    approve_and_send_invite.short_description = "✅ Approve & Send Invite Email"
    
    def reject_and_notify(self, request, queryset):
        """
        Reject selected partner requests and send notification emails.
        """
        rejected_count = 0
        failed_emails = []
        
        for partner_request in queryset.filter(status="pending"):
            # Send rejection email first
            try:
                send_partner_rejection_email(
                    email=partner_request.email,
                    first_name=partner_request.first_name,
                    last_name=partner_request.last_name
                )
            except Exception as e:
                failed_emails.append(f"{partner_request.email}: {str(e)}")
                continue  # Don't reject if email fails
            
            # Update request status
            partner_request.status = PartnerRequest.Status.REJECTED
            partner_request.reviewed_by = request.user
            partner_request.reviewed_at = timezone.now()
            partner_request.save()
            
            rejected_count += 1

        # Show summary message
        if rejected_count > 0:
            self.message_user(
                request, 
                f"{rejected_count} request(s) rejected and notification emails sent.",
                level='success'
            )
        
        if failed_emails:
            self.message_user(
                request, 
                f"Failed to send emails for {len(failed_emails)} request(s): {', '.join(failed_emails)}",
                level='error'
            )
    
    reject_and_notify.short_description = "❌ Reject & Send Notification Email"


@admin.register(PartnerInvite)
class PartnerInviteAdmin(admin.ModelAdmin):
    list_display = ['email', 'partner_request', 'is_used', 'expires_at', 'created_at']
    list_filter = ['is_used', 'created_at']
    search_fields = ['email', 'token']
    readonly_fields = ['token', 'created_at', 'expires_at']
    
    def has_add_permission(self, request):
        """Prevent manual creation of invites (should be done via approval)"""
        return False


@admin.register(Partner)
class PartnerAdmin(admin.ModelAdmin):
    list_display = ['user_email', 'phone', 'is_active', 'joined_at']
    list_filter = ['is_active', 'joined_at']
    search_fields = ['user__email', 'user__first_name', 'user__last_name', 'phone']
    
    def user_email(self, obj):
        return obj.user.email if obj.user else "No user"
    user_email.short_description = 'Email'
    
    def user_first_name(self, obj):
        return obj.user.first_name if obj.user else ""
    user_first_name.short_description = 'First Name'