from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import BlogPostViewSet, ArticleViewSet, TestimonyViewSet

router = DefaultRouter()
router.register(r'blogposts', BlogPostViewSet)
router.register(r'articles', ArticleViewSet)
router.register(r'testimonies', TestimonyViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
