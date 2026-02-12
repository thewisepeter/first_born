from rest_framework import viewsets
from .models import Audio, Video
from .serializer import AudioSerializer, VideoSerializer
from first_ones_api.base_viewsets import AdminReadOnlyModelViewSet
from django_filters.rest_framework import DjangoFilterBackend

class AudioViewSet(AdminReadOnlyModelViewSet):
    queryset = Audio.objects.all().order_by('-date')
    serializer_class = AudioSerializer

    # Adding filtering capability
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['category']

class VideoViewSet(AdminReadOnlyModelViewSet):
    queryset = Video.objects.all().order_by('-date_posted')
    serializer_class = VideoSerializer

    # Adding filtering capability
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['category']
    
