from django.urls import path
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)
from .Views.user_views import registerUser, MyTokenObtainPairView, test
from .Views.generate_views import generate_recommendation, generate_ingredients


urlpatterns = [
    path('token/', MyTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('register/', registerUser, name='register_user'),
    path('test/', test, name='test'),
    path('generate/', generate_recommendation),
    path('generate/ingredients/', generate_ingredients)
    
    
]