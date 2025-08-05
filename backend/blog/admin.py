from django.contrib import admin
from .models import BlogPost, Article, Testimony

admin.site.register(BlogPost)
admin.site.register(Article)
admin.site.register(Testimony)
