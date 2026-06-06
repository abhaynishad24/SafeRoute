from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView
from .views import LogoutPairView, incident_list, delete_incident, register as signup
from .views import register as signup

urlpatterns = [
    path('incidents/', incident_list),
    path('incidents/<int:pk>/', delete_incident),
    path('signup/', signup),
    path('login/', TokenObtainPairView.as_view(),name='login'),
    path('logout/', LogoutPairView.as_view(), name='logout'),
]