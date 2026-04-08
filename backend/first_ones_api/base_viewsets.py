# first_ones_api/base_viewsets.py

from rest_framework import viewsets
from .permissions import IsAdminOrReadOnly

class AdminReadOnlyModelViewSet(viewsets.ModelViewSet):
    """
    A base viewset where only admins can write; others can read.
    """
    permission_classes = [IsAdminOrReadOnly]
