from rest_framework import viewsets, status
from rest_framework.permissions import IsAdminUser, AllowAny
from rest_framework.response import Response

from .models import Partner
from .serializer import PartnerSerializer
from .utils import send_partner_email, send_partner_acknowledgement


class PartnerViewSet(viewsets.ModelViewSet):
    queryset = Partner.objects.all()
    serializer_class = PartnerSerializer

    def get_permissions(self):
        if self.action == 'create':
            # Allow anyone to create (POST)
            permission_classes = [AllowAny]
        else:
            # Only allow admins for other operations
            permission_classes = [IsAdminUser]
        return [permission() for permission in permission_classes]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        partner = serializer.save()

        # Send admin notification
        send_partner_email(
            partner.firstName,
            partner.lastName,
            partner.email,
            partner.phone,
            partner.message
        )

        # Send thank-you acknowledgement to partner
        send_partner_acknowledgement(partner.email, first_name=partner.firstName)

        headers = self.get_success_headers(serializer.data)
        return Response(
            {"message": "Partner signup successful"},
            status=status.HTTP_201_CREATED,
            headers=headers
        )
