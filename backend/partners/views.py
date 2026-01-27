from django.contrib.auth import get_user_model
from django.utils import timezone

from rest_framework import status, permissions, viewsets
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Partner, PartnerRequest, PartnerInvite
from .serializer import PartnerRequestSerializer, PartnerSignupSerializer, PartnerSerializer

User = get_user_model()


class PartnerViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Partner.objects.select_related("user")
    serializer_class = PartnerSerializer 
    permission_classes = [permissions.IsAdminUser]


class PartnerRequestCreateView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = PartnerRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()

        return Response(
            {"message": "Partner request submitted successfully."},
            status=status.HTTP_201_CREATED
        )


class PartnerSignupWithInviteView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request, token):
        try:
            invite = PartnerInvite.objects.select_related("partner_request").get(token=token)
        except PartnerInvite.DoesNotExist:
            return Response(
                {"detail": "Invalid invite token."},
                status=status.HTTP_400_BAD_REQUEST
            )

        if not invite.is_valid():
            return Response(
                {"detail": "Invite token expired or already used."},
                status=status.HTTP_400_BAD_REQUEST
            )

        serializer = PartnerSignupSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = User.objects.create_user(
            username=invite.email,
            email=invite.email,
            password=serializer.validated_data["password"],
            first_name=serializer.validated_data["first_name"],
            last_name=serializer.validated_data["last_name"],
        )

        Partner.objects.create(
            user=user,
            phone=serializer.validated_data["phone"]
        )

        invite.is_used = True
        invite.save(update_fields=["is_used"])

        return Response(
            {"message": "Partner account created successfully."},
            status=status.HTTP_201_CREATED
        )

class PartnerInviteValidateView(APIView):
    permission_classes = [permissions.AllowAny]
    
    def get(self, request, token):
        try:
            invite = PartnerInvite.objects.select_related("partner_request").get(token=token)
        except PartnerInvite.DoesNotExist:
            return Response(
                {"detail": "Invalid invite token."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if not invite.is_valid():
            return Response(
                {"detail": "Invite token expired or already used."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Return invite details
        return Response({
            "email": invite.email,
            "expires_at": invite.expires_at,
            "first_name": invite.partner_request.first_name if invite.partner_request else "",
            "last_name": invite.partner_request.last_name if invite.partner_request else "",
            "phone": invite.partner_request.phone if invite.partner_request else "",
        })