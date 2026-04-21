import traceback
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
from django.utils.decorators import method_decorator

from rest_framework import viewsets, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination
from .models import Activity
from .serializers import ActivitySerializer

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

    # Base user data
    user_data = {
        'id': user.id,
        'email': user.email,
        'first_name': user.first_name,
        'last_name': user.last_name,
        'is_staff': user.is_staff,
        'is_superuser': user.is_superuser,
        'date_joined': user.date_joined,
        'is_partner': False,  # Default to False
    }
    # Check if user has a partner profile
    try:
        if hasattr(user, 'partner_profile') and user.partner_profile:
            partner = user.partner_profile
            user_data.update({
                'is_partner': True,
                'phone': partner.phone,
                'partner_profile': {
                    'id': partner.id,
                    'partner_type': partner.partner_type,
                    'community': partner.community,
                    'bio': partner.bio,
                    'location': partner.location,
                    'organization': partner.organization,
                    'total_given': str(partner.total_given),
                    'months_active': partner.months_active,
                    'joined_at': partner.joined_at,
                    'member_since': partner.member_since,
                    'last_active': partner.last_active,
                    'is_active': partner.is_active,
                }
            })
    except Exception as e:
        # User doesn't have a partner profile or error accessing it
        print(f"Error fetching partner profile: {e}")
        pass
    
    return Response(user_data)


@csrf_exempt
@api_view(['POST'])
@permission_classes([AllowAny])
@ensure_csrf_cookie
def login_view(request):
    """
    Django session-based login endpoint
    """
    print("=" * 50)
    print("LOGIN VIEW CALLED")
    print(f"Request method: {request.method}")
    print(f"Request body: {request.body}")
    
    try:
        data = json.loads(request.body)
        email = data.get('email')
        password = data.get('password')
        
        print(f"Email: {email}")
        print(f"Password provided: {'Yes' if password else 'No'}")
        
        if not email or not password:
            print("Missing email or password")
            return Response(
                {"detail": "Please provide both email and password"},
                status=400
            )
        
        # Django's authenticate expects username, but we use email as username
        print(f"Attempting to authenticate user: {email}")
        user = authenticate(request, username=email, password=password)
        
        if user is not None:
            print(f"Authentication successful for user: {user.email}")
            auth_login(request, user)
            print(f"User logged in, session created: {request.session.session_key}")
            
            # Base user response
            user_response = {
                "id": user.id,
                "email": user.email,
                "first_name": user.first_name,
                "last_name": user.last_name,
                "is_staff": user.is_staff,
                "is_superuser": user.is_superuser,
                "is_partner": False,
            }
            
            # Add partner data if it exists
            try:
                if hasattr(user, 'partner_profile') and user.partner_profile:
                    partner = user.partner_profile
                    user_response.update({
                        "is_partner": True,
                        "phone": partner.phone,
                        "partner_profile": {
                            "id": partner.id,
                            "partner_type": partner.partner_type,
                            "community": partner.community,
                            "bio": partner.bio,
                            "location": partner.location,
                            "organization": partner.organization,
                            "total_given": str(partner.total_given),
                            "months_active": partner.months_active,
                        }
                    })
                    print(f"Partner data added for user: {user.email}")
            except Exception as e:
                print(f"Error adding partner data: {e}")
            
            return Response({
                "user": user_response
            })
        else:
            print(f"Authentication failed for email: {email}")
            return Response(
                {"detail": "Invalid email or password"},
                status=401
            )
    except json.JSONDecodeError as e:
        print(f"JSON decode error: {e}")
        return Response(
            {"detail": "Invalid JSON"},
            status=400
        )
    except Exception as e:
        print(f"Unexpected error in login_view: {str(e)}")
        print(traceback.format_exc())
        return Response(
            {"detail": f"Login failed: {str(e)}"},
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


class ActivityPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 50

class ActivityViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for viewing activities"""
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = ActivitySerializer
    pagination_class = ActivityPagination
    
    def get_queryset(self):
        """Get activities based on user type"""
        user = self.request.user
        
        # Show public activities for dashboard
        if self.action == 'recent_updates':
            return Activity.objects.filter(
                is_public=True
            ).select_related('actor', 'recipient')[:10]
        
        # Show user's notifications
        return Activity.objects.filter(
            recipient=user
        ).select_related('actor', 'recipient').order_by('-created_at')
    
    @action(detail=False, methods=['get'])
    def recent_updates(self, request):
        """Get recent public updates for dashboard"""
        updates = Activity.objects.filter(
            is_public=True
        ).select_related('actor', 'recipient')[:10]
        
        serializer = self.get_serializer(updates, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def mark_read(self, request, pk=None):
        """Mark a notification as read"""
        activity = self.get_object()
        activity.is_read = True
        activity.save(update_fields=['is_read'])
        return Response({'status': 'marked as read'})
    
    @action(detail=False, methods=['post'])
    def mark_all_read(self, request):
        """Mark all notifications as read"""
        Activity.objects.filter(
            recipient=request.user,
            is_read=False
        ).update(is_read=True)
        return Response({'status': 'all notifications marked as read'})