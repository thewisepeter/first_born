 
from rest_framework.permissions import BasePermission, SAFE_METHODS

class IsAdminOrReadOnly(BasePermission):
    """
    Custom permission to allow only admins to perform unsafe methods.
    Anyone can POST (create).
    """

    def has_permission(self, request, view):
        if request.method in SAFE_METHODS:  # GET, HEAD, OPTIONS
            return True
        if request.method == 'POST':  # Allow public to submit
            return True
        return request.user and request.user.is_staff
