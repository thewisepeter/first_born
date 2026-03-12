# blog/serializer.py

from rest_framework import serializers
from .models import BlogPost, Article, Testimony, HeroSlide
import re

class BlogPostSerializer(serializers.ModelSerializer):
    excerpt = serializers.SerializerMethodField()
    content = serializers.SerializerMethodField()  # Changed to method field
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
    
    def get_content(self, obj):
        """Format content with proper paragraph structure"""
        content = obj.content
        
        # If content is empty, return empty array
        if not content:
            return []
        
        # Option 1: Return as array of paragraphs (easier for React to map)
        paragraphs = self._split_into_paragraphs(content)
        return paragraphs
        
        # Option 2: Return as HTML with paragraph tags (if you want HTML)
        # return self._format_as_html(content)
    
    def _split_into_paragraphs(self, text):
        """Split text into an array of paragraphs"""
        # Split by double newlines (with optional whitespace)
        paragraphs = re.split(r'\n\s*\n', text)
        
        # If no double newlines found, try single newlines
        if len(paragraphs) == 1 and '\n' in text:
            paragraphs = text.split('\n')
        
        # Clean up: remove empty strings and trim whitespace
        paragraphs = [p.strip() for p in paragraphs if p.strip()]
        
        return paragraphs
    
    def _format_as_html(self, text):
        """Convert text to HTML with paragraph tags"""
        paragraphs = self._split_into_paragraphs(text)
        
        # Join paragraphs with <p> tags
        html_content = ''.join([f'<p>{p}</p>' for p in paragraphs])
        
        return html_content


class ArticleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Article
        fields = '__all__'

class TestimonySerializer(serializers.ModelSerializer):
    image = serializers.SerializerMethodField()

    class Meta:
        model = Testimony
        fields = ['id', 'name', 'image', 'quote', 'role']

    def get_image(self, obj):
        request = self.context.get('request')
        if obj.image and hasattr(obj.image, 'url'):
            return request.build_absolute_uri(obj.image.url) if request else obj.image.url
        return ''


class HeroSlideSerializer(serializers.ModelSerializer):
    image = serializers.SerializerMethodField()

    class Meta:
        model = HeroSlide
        fields = ['id', 'title', 'subtitle', 'image', 'description']

    def get_image(self, obj):
        request = self.context.get('request')
        if obj.image and hasattr(obj.image, 'url'):
            return request.build_absolute_uri(obj.image.url) if request else obj.image.url
        return ''