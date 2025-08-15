from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import ContactMessage, TestimonyMessage
from .serializer import ContactMessageSerializer, TestimonyMessageSerializer


class ContactMessageCreateView(APIView):
    def post(self, request):
        serializer = ContactMessageSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({"message": "Contact message submitted successfully"}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class TestimonyMessageCreateView(APIView):
    def post(self, request):
        serializer = TestimonyMessageSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({"message": "Testimony message submitted successfully"}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
