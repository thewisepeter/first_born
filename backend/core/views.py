from django.http import JsonResponse
from django.views.decorators.csrf import ensure_csrf_cookie

@ensure_csrf_cookie
def csrf(request):
    """
    The view sets a CSRF cookie and returns a JSON response indicating success.
    """
    return JsonResponse({"detail": "CSRF cookie set"})
