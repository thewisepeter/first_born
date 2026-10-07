from rest_framework import viewsets
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination
from .models import Audio, Video, Livestream
from .serializer import AudioSerializer, VideoSerializer, LivestreamSerializer
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


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def livestream_status(request):
    config = Livestream.objects.first()
    if config is None:
        return Response({
            'title': 'Live', 'is_live': False, 'embed_url': None,
            'next_broadcast_at': None, 'offline_message': '',
        })
    return Response(LivestreamSerializer(config).data)
