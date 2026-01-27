from django.http import JsonResponse
from django.views.decorators.csrf import ensure_csrf_cookie
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from django.contrib.auth import authenticate, login as auth_login, logout as auth_logout
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth.decorators import login_required
from django.middleware.csrf import get_token
import json

@ensure_csrf_cookie
def csrf(request):
    """
    The view sets a CSRF cookie and returns a JSON response indicating success.
    """
    return JsonResponse({"detail": "CSRF cookie set"})


User = get_user_model()

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def current_user(request):
    user = request.user
    return Response({
        'id': user.id,
        'email': user.email,
        'first_name': user.first_name,
        'last_name': user.last_name,
        'is_staff': user.is_staff,
        'is_superuser': user.is_superuser,
        'date_joined': user.date_joined,
    })

@api_view(['POST'])
@permission_classes([AllowAny])
@ensure_csrf_cookie
def login_view(request):
    """
    Django session-based login endpoint
    """
    try:
        data = json.loads(request.body)
        email = data.get('email')
        password = data.get('password')
        
        if not email or not password:
            return Response(
                {"detail": "Please provide both email and password"},
                status=400
            )
        
        # Django's authenticate expects username, but we use email as username
        user = authenticate(request, username=email, password=password)
        
        if user is not None:
            auth_login(request, user)
            return Response({
                "user": {
                    "id": user.id,
                    "email": user.email,
                    "first_name": user.first_name,
                    "last_name": user.last_name,
                    "is_staff": user.is_staff,
                    "is_superuser": user.is_superuser,
                }
            })
        else:
            return Response(
                {"detail": "Invalid email or password"},
                status=401
            )
    except json.JSONDecodeError:
        return Response(
            {"detail": "Invalid JSON"},
            status=400
        )
    except Exception as e:
        return Response(
            {"detail": "Login failed"},
            status=500
        )


@csrf_exempt
def session_logout(request):
    """
    Custom logout that clears session without CSRF requirement
    """
    if request.method == 'POST':
        try:
            # Clear the session
            request.session.flush()
            
            # Also clear auth session
            if hasattr(request, 'user'):
                from django.contrib.auth import logout
                logout(request)
            
            response = JsonResponse({
                "detail": "Successfully logged out",
                "success": True
            })
            
            # Clear session cookie
            response.delete_cookie('sessionid')
            response.delete_cookie('csrftoken')
            
            return response
        except Exception as e:
            return JsonResponse({
                "detail": f"Logout failed: {str(e)}",
                "success": False
            }, status=500)
    
    return JsonResponse({
        "error": "Method not allowed",
        "success": False
    }, status=405)

@api_view(['GET'])
@permission_classes([AllowAny])
def get_csrf_token(request):
    """
    Get CSRF token for forms
    """
    return Response({"csrfToken": get_token(request)})