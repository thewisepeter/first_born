from rest_framework import viewsets
from .models import BlogPost, Article
from .serializer import BlogPostSerializer, ArticleSerializer
from first_ones_api.base_viewsets import AdminReadOnlyModelViewSet


class BlogPostViewSet(AdminReadOnlyModelViewSet):
    queryset = BlogPost.objects.all().order_by('-date_posted')
    serializer_class = BlogPostSerializer


class ArticleViewSet(AdminReadOnlyModelViewSet):
    queryset = Article.objects.all().order_by('-date_posted')
    serializer_class = ArticleSerializer
