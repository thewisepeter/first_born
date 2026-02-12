# marketplace/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    MarketplaceCategoryViewSet, MarketplaceListingViewSet,
    MarketplaceLikeViewSet, MarketplaceSaveViewSet,
    MarketplaceInquiryViewSet, MyListingsView, RecentListingsView
)

router = DefaultRouter()
router.register(r'categories', MarketplaceCategoryViewSet, basename='category')
router.register(r'listings', MarketplaceListingViewSet, basename='listing')
router.register(r'likes', MarketplaceLikeViewSet, basename='like')
router.register(r'saves', MarketplaceSaveViewSet, basename='save')
router.register(r'inquiries', MarketplaceInquiryViewSet, basename='inquiry')

urlpatterns = [
    path('', include(router.urls)),
    
    # Dashboard endpoints
    path('listings/stats/', MarketplaceListingViewSet.as_view({'get': 'stats'}), name='marketplace-stats'),
    path('listings/mine/', MyListingsView.as_view(), name='my-listings'),
    path('listings/recent/', RecentListingsView.as_view(), name='recent-listings'),
    
    # Listing actions (also available through viewset but added for clarity)
    path('listings/<int:pk>/like/', MarketplaceListingViewSet.as_view({'post': 'like'}), name='listing-like'),
    path('listings/<int:pk>/save/', MarketplaceListingViewSet.as_view({'post': 'save'}), name='listing-save'),
    path('listings/<int:pk>/report/', MarketplaceListingViewSet.as_view({'post': 'report'}), name='listing-report'),
    
    # Inquiry response
    path('inquiries/<int:pk>/respond/', MarketplaceInquiryViewSet.as_view({'post': 'respond'}), name='inquiry-respond'),
]