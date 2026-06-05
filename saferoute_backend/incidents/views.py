from django.contrib.auth.models import User
from django.shortcuts import get_object_or_404
from rest_framework.views import APIView
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from .models import Incident
from .serializers import IncidentSerializer


@api_view(['GET', 'POST'])
def incident_list(request):
    category = request.query_params.get('category')
    if category:
        incidents = Incident.objects.filter(category=category)
    else:
        incidents = Incident.objects.all()

    if request.method == 'GET':
        serializer = IncidentSerializer(incidents, many=True)
        return Response(serializer.data)

    serializer = IncidentSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)

    return Response(serializer.errors, status=400)


@api_view(['DELETE'])
def delete_incident(request, pk):
    incident = get_object_or_404(Incident, pk=pk)
    incident.delete()
    return Response({"message": "Deleted Successfully"})


@api_view(['POST'])
def register(request):
    username = request.data.get('username')
    password = request.data.get('password')

    if not username or not password:
        return Response({"error": "Username and password are required."}, status=400)

    if User.objects.filter(username=username).exists():
        return Response({"error": "Username already exists."}, status=400)

    User.objects.create_user(username=username, password=password)
    return Response({"message": "User registered successfully."})


class LogoutPairView(APIView):
    permission_classes = (IsAuthenticated,)

    def post(self, request):
        refresh_token = request.data.get("refresh")
        try:
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response({"message": "Successfully logged out."}, status=205)
        except Exception:
            return Response({"error": "Invalid refresh token."}, status=400)
    