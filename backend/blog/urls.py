from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import BlogPostViewSet, ArticleViewSet

router = DefaultRouter()
router.register(r'blogposts', BlogPostViewSet)
router.register(r'articles', ArticleViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
