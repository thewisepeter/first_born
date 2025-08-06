from rest_framework import viewsets
from .models import Partner
from .serializer import PartnerSerializer
from .permissions import IsAdminOrReadOnly

class PartnerViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAdminOrReadOnly]
    queryset = Partner.objects.all()
    serializer_class = PartnerSerializer
