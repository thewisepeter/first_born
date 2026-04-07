"""
URL configuration for first_ones_api project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from core.views import (
    csrf, 
    current_user, 
    login_view,  
    get_csrf_token,
    session_logout
)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('core.urls')), 
    path('api/csrf/', csrf, name='csrf_token'),
    path('api/auth/me/', current_user, name='current-user'),
    path('api/auth/login/', login_view, name='login'),  
    path('api/auth/logout/', session_logout, name='logout'),  
    path('api/auth/csrf-token/', get_csrf_token, name='get-csrf-token'), 
    path('api/blog/', include('blog.urls')),
    path('api/mediafiles/', include('mediafiles.urls')),
    path('api/partners/', include('partners.urls')),
    path('api/contactmessages/', include('contactmessages.urls')),
    path('api/drives/', include('drives.urls')),
    path('api/opportunities/', include('opportunities.urls')),
    path('api/giving/', include('giving.urls')),
    path('api/marketplace/', include('marketplace.urls')),
    path('api/weekly-budget/', include('weekly_budget.urls')),
]


if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)