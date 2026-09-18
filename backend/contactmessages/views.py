from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny, IsAuthenticated
from smtplib import SMTPException

from .models import ContactMessage, TestimonyMessage
from .serializer import ContactMessageSerializer, TestimonyMessageSerializer, ProphetMessageSerializer
from .utils import send_contact_email, send_testimony_email, send_thank_you_email, send_prophet_email


class ProphetMessageCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        partner = getattr(request.user, "partner_profile", None)
        if not partner or not partner.is_active:
            return Response({"detail": "Partner access required."}, status=status.HTTP_403_FORBIDDEN)

        serializer = ProphetMessageSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        try:
            sent = send_prophet_email(**serializer.validated_data)
        except (SMTPException, OSError):
            sent = 0
        if not sent:
            return Response(
                {"detail": "Your message could not be sent. Please try again."},
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )
        return Response({"message": "Your message has been sent to the Prophet."}, status=status.HTTP_200_OK)


class ContactMessageCreateView(APIView):
    authentication_classes = []      # 🔑 disable auth
    permission_classes = [AllowAny]  # 🔓 public

    def post(self, request):
        serializer = ContactMessageSerializer(data=request.data)
        if serializer.is_valid():
            contact = serializer.save()

            send_contact_email(
                contact.fullName,
                contact.email,
                contact.phone,
                contact.message,
            )

            send_thank_you_email(contact.email, first_name=contact.fullName)

            return Response(
                {"message": "Contact message submitted successfully"},
                status=status.HTTP_201_CREATED,
            )

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class TestimonyMessageCreateView(APIView):
    authentication_classes = []      # 🔑 disable auth
    permission_classes = [AllowAny]  # 🔓 public

    def post(self, request):
        serializer = TestimonyMessageSerializer(data=request.data)
        if serializer.is_valid():
            testimony = serializer.save()

            send_testimony_email(
                testimony.firstName,
                testimony.lastName,
                testimony.email,
                testimony.phone,
                testimony.message,
            )

            send_thank_you_email(testimony.email, first_name=testimony.firstName)

            return Response(
                {"message": "Testimony message submitted successfully"},
                status=status.HTTP_201_CREATED,
            )

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
