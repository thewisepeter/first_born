from django.urls import path
from .views import ContactMessageCreateView, TestimonyMessageCreateView

urlpatterns = [
    path('contact/', ContactMessageCreateView.as_view(), name='contact-message-create'),
    path('testimony/', TestimonyMessageCreateView.as_view(), name='testimony-message-create'),
]
