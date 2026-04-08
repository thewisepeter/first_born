from rest_framework import viewsets
from rest_framework.pagination import PageNumberPagination
from .models import BlogPost, Article, Testimony, HeroSlide
from .serializer import BlogPostSerializer, ArticleSerializer, TestimonySerializer, HeroSlideSerializer
from first_ones_api.base_viewsets import AdminReadOnlyModelViewSet
from rest_framework.permissions import AllowAny
from django_filters.rest_framework import DjangoFilterBackend

class StandardResultsSetPagination(PageNumberPagination):
    page_size = 20
    page_size_query_param = 'page_size'
    max_page_size = 100
    page_query_param = 'page'

class BlogPostViewSet(AdminReadOnlyModelViewSet):
    queryset = BlogPost.objects.all().order_by('-date_posted')
    serializer_class = BlogPostSerializer
    pagination_class = StandardResultsSetPagination  # Add pagination

    # Adding filtering capability
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['category']

class ArticleViewSet(AdminReadOnlyModelViewSet):
    queryset = Article.objects.all().order_by('-date_posted')
    serializer_class = ArticleSerializer
    pagination_class = StandardResultsSetPagination  # Add pagination

class TestimonyViewSet(AdminReadOnlyModelViewSet):
    queryset = Testimony.objects.all()
    serializer_class = TestimonySerializer
    pagination_class = StandardResultsSetPagination  # Add pagination

class HeroSlideViewSet(viewsets.ModelViewSet):
    queryset = HeroSlide.objects.all().order_by("-created_at")
    serializer_class = HeroSlideSerializer
    pagination_class = StandardResultsSetPagination  # Add pagination