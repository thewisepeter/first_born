from rest_framework import viewsets
from .models import Audio, Video
from .serializer import AudioSerializer, VideoSerializer
from first_ones_api.base_viewsets import AdminReadOnlyModelViewSet

class AudioViewSet(AdminReadOnlyModelViewSet):
    queryset = Audio.objects.all().order_by('-date')
    serializer_class = AudioSerializer

class VideoViewSet(AdminReadOnlyModelViewSet):
    queryset = Video.objects.all().order_by('-date_posted')
    serializer_class = VideoSerializer
    
