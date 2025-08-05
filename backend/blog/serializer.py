from rest_framework import serializers
from .models import BlogPost, Article, Testimony


class BlogPostSerializer(serializers.ModelSerializer):
    class Meta:
        model = BlogPost
        fields = '__all__'


class ArticleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Article
        fields = '__all__'

class TestimonySerializer(serializers.ModelSerializer):
    class Meta:
        model = Testimony
        fields = '__all__'
