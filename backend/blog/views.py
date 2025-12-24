from rest_framework import viewsets
from rest_framework.viewsets import ModelViewSet
from .models import BlogPost, Article, Testimony, HeroSlide
from .serializer import BlogPostSerializer, ArticleSerializer, TestimonySerializer, HeroSlideSerializer
from first_ones_api.base_viewsets import AdminReadOnlyModelViewSet
from rest_framework.permissions import AllowAny


class BlogPostViewSet(AdminReadOnlyModelViewSet):
    queryset = BlogPost.objects.all().order_by('-date_posted')
    serializer_class = BlogPostSerializer

class ArticleViewSet(AdminReadOnlyModelViewSet):
    queryset = Article.objects.all().order_by('-date_posted')
    serializer_class = ArticleSerializer

class TestimonyViewSet(ModelViewSet):
    queryset = Testimony.objects.all()
    serializer_class = TestimonySerializer
    permission_classes = [AllowAny]

class HeroSlideViewSet(viewsets.ModelViewSet):
    queryset = HeroSlide.objects.all().order_by("-created_at")
    serializer_class = HeroSlideSerializer
