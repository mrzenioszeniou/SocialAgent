from django.conf import settings
from django.conf.urls import url, include
from django.conf.urls.static import static
from api import views
from rest_framework.routers import DefaultRouter
from rest_framework.authtoken import views as auth_views

router = DefaultRouter()
router.register(r'activities', views.ActivityViewSet)
router.register(r'users', views.UserViewSet)
router.register(r'activityfollows', views.ActivityFollowViewSet)
router.register(r'follows', views.FollowViewSet)
router.register(r'feed', views.FeedViewSet)

urlpatterns = [
    url(r'^', include(router.urls)),
    url(r'^me/', views.CurrentUserView.as_view({'get':'get','patch':'patch','post':'create'})),
    url(r'^token/', auth_views.obtain_auth_token),
]

urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
urlpatterns +=  static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)

