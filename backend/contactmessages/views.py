from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny

from .models import ContactMessage, TestimonyMessage
from .serializer import ContactMessageSerializer, TestimonyMessageSerializer
from .utils import send_contact_email, send_testimony_email, send_thank_you_email


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
