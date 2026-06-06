from django.contrib.auth.models import User
from django.shortcuts import get_object_or_404
from rest_framework.views import APIView
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated, IsAuthenticatedOrReadOnly
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework import status
from .models import Incident
from .serializers import IncidentSerializer


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticatedOrReadOnly]) # GET koi bhi dekh sake, POST ke liye Login zaroori hai
def incident_list(request):
    category = request.query_params.get('category')
    if category:
        incidents = Incident.objects.filter(category=category)
    else:
        incidents = Incident.objects.all().order_by('-id') # Naye incidents upar dikhenge

    # 1. GET Method - Incidents fetched for map display
    if request.method == 'GET':
        serializer = IncidentSerializer(incidents, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    # 2. POST Method - Save new incident (Only authenticated users)
    if request.method == 'POST':
        serializer = IncidentSerializer(data=request.data)
        
        if serializer.is_valid():
            try:
                # 💡 FIX: Agar aapke model mein 'user' field hai, toh request.user ko pass karna zaroori hai
                # Yeh line Staff aur Regular user dono ke liye automatic user map kar degi
                if hasattr(Incident, 'user'):
                    serializer.save(user=request.user)
                else:
                    serializer.save()
                    
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            except Exception as e:
                # Agar database level par koi aur field miss ho rahi hogi toh terminal par print hoga
                print("Database Save Error:", str(e))
                return Response({"error": "Database saving failed.", "details": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        
        # Agar data invalid hai toh rules validation errors return karega taaki frontend blank na ho
        print("Validation Errors:", serializer.errors)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated]) # Incident delete sirf logged in user hi kar sakega
def delete_incident(request, pk):
    incident = get_object_or_404(Incident, pk=pk)
    incident.delete()
    return Response({"message": "Deleted Successfully"}, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([AllowAny]) # Signup koi bhi bina login ke kar sakta hai
def register(request):
    username = request.data.get('username')
    password = request.data.get('password')

    if not username or not password:
        return Response({"error": "Username and password are required."}, status=status.HTTP_400_BAD_REQUEST)

    if User.objects.filter(username=username).exists():
        return Response({"error": "Username already exists."}, status=status.HTTP_400_BAD_REQUEST)

    User.objects.create_user(username=username, password=password)
    return Response({"message": "User registered successfully."}, status=status.HTTP_201_CREATED)


class LogoutPairView(APIView):
    permission_classes = (IsAuthenticated,) # Logout ke liye token chahiye

    def post(self, request):
        refresh_token = request.data.get("refresh")
        try:
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response({"message": "Successfully logged out."}, status=status.HTTP_205_RESET_CONTENT)
        except Exception:
            return Response({"error": "Invalid refresh token."}, status=status.HTTP_400_BAD_REQUEST)