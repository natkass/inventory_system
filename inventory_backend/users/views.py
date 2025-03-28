from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from .serializers import UserSerializer

# User Login View
@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def user_login(request):
    """
    Handle user login and return access and refresh tokens.
    """
    username = request.data.get('username')
    password = request.data.get('password')

    if not username or not password:
        return Response({"detail": "Username and password are required."}, status=status.HTTP_400_BAD_REQUEST)

    # Authenticate user
    user = authenticate(request, username=username, password=password)
    if user is not None and user.is_active:
        refresh = RefreshToken.for_user(user)
        return Response({
            "message": "Login successful",
            "access": str(refresh.access_token),
            "refresh": str(refresh),
        }, status=status.HTTP_200_OK)

    return Response({"detail": "Invalid credentials."}, status=status.HTTP_401_UNAUTHORIZED)

# User Logout View (Optional in JWT, client just deletes token)
@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def user_logout(request):
    """
    Handle user logout. In token-based auth, client just removes the token.
    """
    return Response({'message': 'Logged out successfully.'}, status=status.HTTP_200_OK)

# Profile View
@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def user_profile(request):
    """
    Get the logged-in user's profile details.
    """
    user = request.user
    serializer = UserSerializer(user)
    return Response(serializer.data, status=status.HTTP_200_OK)

# Profile Edit View
@api_view(['PUT'])
@permission_classes([permissions.IsAuthenticated])
def user_profile_edit(request):
    """
    Edit the logged-in user's profile details.
    """
    user = request.user
    serializer = UserSerializer(user, data=request.data, partial=True)  # Partial to allow updates of specific fields only
    
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
