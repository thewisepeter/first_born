# drives/permissions.py
from rest_framework import permissions

class IsAdminUser(permissions.BasePermission):
    """Allows access only to admin users."""
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_staff)


class IsAdminOrReadOnly(permissions.BasePermission):
    """Admin can do everything, others can only read."""
    def has_permission(self, request, view):
        # Allow all users to read
        if request.method in permissions.SAFE_METHODS:
            return True
        
        # Only allow admin users to write
        return bool(request.user and request.user.is_staff)