from rest_framework import viewsets
from rest_framework.pagination import PageNumberPagination
from .models import Audio, Video
from .serializer import AudioSerializer, VideoSerializer
from first_ones_api.base_viewsets import AdminReadOnlyModelViewSet
from django_filters.rest_framework import DjangoFilterBackend

class StandardResultsSetPagination(PageNumberPagination):
    page_size = 20
    page_size_query_param = 'page_size'
    max_page_size = 100
    page_query_param = 'page'

class AudioViewSet(AdminReadOnlyModelViewSet):
    queryset = Audio.objects.all().order_by('-date')
    serializer_class = AudioSerializer
    pagination_class = StandardResultsSetPagination  # Add pagination

    # Adding filtering capability
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['category']

class VideoViewSet(AdminReadOnlyModelViewSet):
    queryset = Video.objects.all().order_by('-date_posted')
    serializer_class = VideoSerializer
    pagination_class = StandardResultsSetPagination  # Add pagination

    # Adding filtering capability
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['category']