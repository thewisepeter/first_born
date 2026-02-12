from django.contrib.auth import get_user_model
from django.utils import timezone
from django.db import transaction
from django.core.exceptions import ObjectDoesNotExist

from rest_framework import status, permissions, viewsets
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.exceptions import ValidationError
from rest_framework.pagination import PageNumberPagination

from .models import Partner, PartnerGoal, PartnerRequest, PartnerInvite
from .serializer import (
    PartnerGoalSerializer,
    PartnerProfileUpdateSerializer,
    PartnerRequestSerializer,
    PartnerSignupSerializer,
    PartnerSerializer,
)

User = get_user_model()

class AdminPartnerPagination(PageNumberPagination):
    page_size = 20
    page_size_query_param = "page_size"
    max_page_size = 100

class PartnerViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Partner.objects.select_related("user").order_by("-id")
    serializer_class = PartnerSerializer
    permission_classes = [permissions.IsAdminUser]
    pagination_class = AdminPartnerPagination

class PartnerRequestCreateView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = PartnerRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()

        return Response(
            {"message": "Partner request submitted successfully."},
            status=status.HTTP_201_CREATED,
        )

class PartnerSignupWithInviteView(APIView):
    permission_classes = [permissions.AllowAny]

    @transaction.atomic
    def post(self, request, token):
        try:
            invite = PartnerInvite.objects.select_related(
                "partner_request"
            ).get(token=token)
        except PartnerInvite.DoesNotExist:
            return Response(
                {"detail": "Invalid invite token."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not invite.is_valid():
            return Response(
                {"detail": "Invite token expired or already used."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # 🚫 HARD BLOCK: user already exists
        if User.objects.filter(email=invite.email).exists():
            return Response(
                {"detail": "An account with this email already exists."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        serializer = PartnerSignupSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        # ✅ Email comes ONLY from invite
        user = User.objects.create_user(
            username=invite.email,
            email=invite.email,
            password=serializer.validated_data["password"],
            first_name=serializer.validated_data["first_name"],
            last_name=serializer.validated_data["last_name"],
        )

        Partner.objects.create(
            user=user,
            phone=serializer.validated_data["phone"],
            location=serializer.validated_data.get("location", ""),
            organization=serializer.validated_data.get("organization", ""),
            partner_type=serializer.validated_data.get("partner_type", "individual"),
            bio=serializer.validated_data.get("bio", ""),
        )

        invite.is_used = True
        invite.used_at = timezone.now()
        invite.save(update_fields=["is_used", "used_at"])

        return Response(
            {"message": "Partner account created successfully."},
            status=status.HTTP_201_CREATED,
        )

class PartnerInviteValidateView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request, token):
        try:
            invite = PartnerInvite.objects.select_related(
                "partner_request"
            ).get(token=token)
        except PartnerInvite.DoesNotExist:
            return Response(
                {"detail": "Invalid invite token."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not invite.is_valid():
            return Response(
                {"detail": "Invite token expired or already used."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        return Response(
            {
                "email": invite.email,
                "expires_at": invite.expires_at,
                "first_name": invite.partner_request.first_name
                if invite.partner_request
                else "",
                "last_name": invite.partner_request.last_name
                if invite.partner_request
                else "",
                "phone": invite.partner_request.phone
                if invite.partner_request
                else "",
            }
        )

class PartnerProfileView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        try:
            partner = request.user.partner_profile
        except ObjectDoesNotExist:
            return Response(
                {"error": "Partner profile not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        serializer = PartnerSerializer(partner)
        return Response(serializer.data)

    def patch(self, request):
        try:
            partner = request.user.partner_profile
        except ObjectDoesNotExist:
            return Response(
                {"error": "Partner profile not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        serializer = PartnerProfileUpdateSerializer(
            partner, data=request.data, partial=True
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()

        return Response(
            {
                "message": "Profile updated successfully.",
                "profile": PartnerSerializer(partner).data,
            }
        )

class PartnerGoalViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = PartnerGoalSerializer

    def get_queryset(self):
        try:
            partner = self.request.user.partner_profile
            return PartnerGoal.objects.filter(partner=partner)
        except ObjectDoesNotExist:
            return PartnerGoal.objects.none()

    def perform_create(self, serializer):
        try:
            partner = self.request.user.partner_profile
        except ObjectDoesNotExist:
            raise ValidationError(
                {"error": "Partner profile not found."}
            )

        serializer.save(partner=partner)

