from rest_framework import permissions

class IsAdminOrReadOnly(permissions.BasePermission):
    """
    Custom permission: Only admins can edit; others can only view (GET, HEAD, OPTIONS).
    """

    def has_permission(self, request, view):
        # Allow read-only access for all
        if request.method in permissions.SAFE_METHODS:
            return True
        # Write access only for admins
        return request.user and request.user.is_staff
