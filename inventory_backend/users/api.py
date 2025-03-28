from rest_framework import viewsets,permissions,status
from rest_framework.response import Response
from django.contrib.auth.models import User
from .serializers import *
from django.contrib.auth.models import Group
from rest_framework.decorators import action
from .models import *
import re
from collections import defaultdict
from django.db.models import F
from django.db.models import Q
from django.shortcuts import get_object_or_404

# User = get_user_model()  # Get the user model

class UserViewSet(viewsets.ModelViewSet):
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    # def get_queryset(self):
    #     """
    #     Override to exclude users marked as 'is_deleted'.
    #     """
    #     # user_sector_id = self.request.user.sector_id
    #     # user_monitoring_id = self.request.user.monitoring_id
    #     # user_division_id = self.request.user.division_id
    #     # print("User sector ID:", user_sector_id)  # Updated print statement for clarity
    #     # if self.request.user.id:
    #     #     return User.objects.filter(id=self.request.user.id)
    #     # if user_sector_id:
    #     #     return User.objects.filter(is_deleted=False, sector_id=user_sector_id)
    #     # elif user_monitoring_id:
    #     #     return User.objects.filter(is_deleted=False, monitoring_id=user_monitoring_id)
    #     # elif user_division_id:   
    #         return User.objects.filter(is_deleted=False, division_id=user_division_id)
    #     if self.request.user.is_superuser:
    #         return User.objects.filter(is_deleted=False)
    #     else:
    #         return User.objects.none()
        
    @action(detail=False, methods=['get'], permission_classes=[permissions.IsAuthenticated])
    def my_profile(self, request):
 
        try:
            user = request.user.id
            user_data = User.objects.get(id=user)
            user_permissions_instances = UserPermission.objects.filter(user_id=user)
            permissions_dict = []
            for user_permission in user_permissions_instances:
                for permission in user_permission.permission_id.all():
                    #permissions_dict[permission.name] = user_permission.value  # Assuming Permission model has 'value' attribute
                    permissions_dict.append(permission.name)

            user_role_instances = UserRole.objects.get(user_id=user)
            #userRoles = [role_instance.role_id.name for role_instance in user_role_instances]
            userRoles = user_role_instances.role_id.name 
            
            # Serialize user profile data
            profile_data = self.get_serializer(user_data).data
            
            # Add user permissions to the profile data
            profile_data['userRole'] = userRoles
            profile_data['userPermissions'] = permissions_dict
            
            return Response(profile_data)
        except User.DoesNotExist:
            return Response({"error": "User does not exist."}, status=status.HTTP_404_NOT_FOUND)
        
    def perform_create(self, serializer):

        
        user = serializer.save(added_by=self.request.user)
        role_permissions = user.role.permission_id.all()
        user_roles = UserRole.objects.create(user_id=user, role_id=user.role)

        # user_permission = UserPermission.objects.create(user_id=user, added_by=self.request.user, permission_id.set(role_permissions))
        user_permission = UserPermission.objects.create(user_id=user, added_by=self.request.user)
        user_permission.permission_id.set(role_permissions)
            
        return Response(serializer.data, status=status.HTTP_201_CREATED)
        

    def perform_update(self, serializer):
        serializer.save(updated_by=self.request.user, status_changed_by=self.request.user)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        instance.delete()
        # instance.deleted_by = request.user
        # instance.is_deleted = True  # Mark as deleted rather than removing
        # instance.save()

        # Optionally, you could also return a custom message or data
        return Response({"message": "User marked as deleted successfully."}, status=status.HTTP_204_NO_CONTENT)

'''
class ReminderViewSet(viewsets.ModelViewSet):
    queryset = Reminder.objects.all()
    serializer_class = ReminderSerializer
    permission_classes = [permissions.IsAuthenticated]

    @action(detail=False, methods=['get', 'delete'])
    def latest(self, request):
        try:
            latest_reminder = Reminder.objects.latest('id')
            
        except Reminder.DoesNotExist:
            return Response(status=404)

        if request.method == 'GET':
                serializer = self.get_serializer(latest_reminder)
                print(serializer.data, 'lllllllllll')
                return Response(serializer.data)
            
        elif request.method == 'DELETE':
            latest_reminder.delete()
            return Response(status=204)
        
    def create(self, request, *args, **kwargs):
            
        # Delete all existing reminders
        Reminder.objects.filter(added_by=self.request.user).delete()
        # Create a new reminder
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(added_by=request.user)
        
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=201, headers=headers)
'''
