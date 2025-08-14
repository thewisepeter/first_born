from rest_framework import viewsets
from rest_framework.permissions import IsAdminUser, AllowAny
from .models import Partner
from .serializer import PartnerSerializer

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