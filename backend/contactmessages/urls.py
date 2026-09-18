from django.urls import path
from .views import ContactMessageCreateView, TestimonyMessageCreateView, ProphetMessageCreateView

urlpatterns = [
    path('prophet/', ProphetMessageCreateView.as_view(), name='prophet-message-create'),
    path('contact/', ContactMessageCreateView.as_view(), name='contact-message-create'),
    path('testimony/', TestimonyMessageCreateView.as_view(), name='testimony-message-create'),
]
