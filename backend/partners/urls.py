from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import (
    PartnerInviteValidateView,
    PartnerViewSet,
    PartnerRequestCreateView,
    PartnerSignupWithInviteView,
)

router = DefaultRouter()
router.register(r"partners", PartnerViewSet, basename="partners")

urlpatterns = [
    path("requests/", PartnerRequestCreateView.as_view(), name="partner-request"),
    path("signup/<uuid:token>/", PartnerSignupWithInviteView.as_view(), name="partner-signup"),
    path("validate-token/<uuid:token>/", PartnerInviteValidateView.as_view(), name="validate-token"),
    path("", include(router.urls)),
]
