from rest_framework import serializers
from .models import BlogPost, Article, Testimony

class BlogPostSerializer(serializers.ModelSerializer):
    excerpt = serializers.SerializerMethodField()
    content = serializers.CharField(source='full_content')
    date = serializers.SerializerMethodField()
    readTime = serializers.SerializerMethodField()
    image = serializers.SerializerMethodField()

    class Meta:
        model = BlogPost
        fields = [
            'id', 'title', 'excerpt', 'content', 'author', 'date', 'status',
            'category', 'readTime', 'likes', 'comments', 'image', 'tags'
        ]

    def get_excerpt(self, obj):
        return obj.excerpt()

    def get_date(self, obj):
        return obj.date_posted.strftime("%B %-d, %Y")  # e.g., February 5, 2024

    def get_readTime(self, obj):
        return obj.get_read_time()

    def get_image(self, obj):
        request = self.context.get('request')
        image_url = obj.image_url()
        return request.build_absolute_uri(image_url) if request else image_url



class ArticleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Article
        fields = '__all__'

class TestimonySerializer(serializers.ModelSerializer):
    class Meta:
        model = Testimony
        fields = '__all__'
