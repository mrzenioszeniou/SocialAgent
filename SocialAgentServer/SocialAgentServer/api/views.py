from api.models import *
from api.serializers import *
from rest_framework import viewsets, status, mixins, generics
from rest_framework.response import Response
from custom import getDistanceFromLatLonInKm

class ActivityViewSet(viewsets.ModelViewSet):
    queryset = Activity.objects.all()
    serializer_class = ActivitySerializer

    def list(self, request, *args, **kwargs):
        if request.auth:
            user = request.user
            queryset = Activity.objects.exclude(followed=user)
        else:
            queryset = Activity.objects.all()
        serializer = ActivitySerializer(queryset,context={'request':request},many=True)
        return Response(serializer.data)


class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.exclude(username='admin')
    serializer_class = UserSerializer

    def list(self, request, *args, **kwargs):
        if request.auth:
            user = request.user
            if user.discoverable:
                queryset = [ u for u in User.objects.exclude(username__in=['admin',user.username]).exclude(followers=user)
                                 if getDistanceFromLatLonInKm(user.latitude,user.longitude,u.latitude,u.longitude)
                                 <= user.discover_distance and u.discoverable]
            else:
                queryset = []
        else:
            queryset = User.objects.exclude(username='admin')
        serializer = UserSerializer(queryset,context={'request': request}, many=True)
        return Response(serializer.data)

    def perform_create(self, serializer):
        instance = serializer.save()
        instance.set_password(instance.password)
        instance.save()


class ReactionViewSet(viewsets.ModelViewSet):
    queryset = Reaction.objects.all()
    serializer_class = ReactionSerializer


class ActivityFollowViewSet(viewsets.ModelViewSet):
    queryset = ActivityFollow.objects.all()
    serializer_class = ActivityFollowSerializer


class FollowViewSet(viewsets.ModelViewSet):
    queryset = Follow.objects.all()
    serializer_class = FollowSerializer

    def list(self, request, *args, **kwargs):
        if request.auth:
            user = request.user
            queryset = Follow.objects.filter(follower=user) | Follow.objects.filter(followee=user)
        else:
            queryset = Follow.objects.all()
        serializer = FollowSerializer(queryset,context={'request': request}, many=True)
        return Response(serializer.data)


class FeedViewSet(viewsets.ModelViewSet):
    queryset = Feed.objects.all()
    serializer_class = FeedSerializer

    def list(self, request, *args, **kwargs):
        if request.auth:
            user = request.user
            if user.online:
                queryset = [f for f in Feed.objects.all() if ((f.user in user.following.all() and f.user in user.followers.all() and f.user.online) or f.user == user)]
            else:
                queryset = [f for f in Feed.objects.all() if f.user == user]
        else:
            queryset = Feed.objects.all()
        serializer = FeedSerializer(queryset, context={'request': request}, many=True)
        return Response(serializer.data)


class CurrentUserView(mixins.CreateModelMixin, generics.GenericAPIView,viewsets.ViewSet):
    queryset = User.objects.all()
    serializer_class = CurrentUserSerializer

    def get(self, request):
        if request.auth:
            user = request.user
            serializer = CurrentUserSerializer(user, context={'request': request})
            return Response(serializer.data, status=status.HTTP_200_OK,)
        else:
            body = {
                "detail" : "Authentication credentials were not provided.",
                "help" : "Provide 'Authorization: Token 9944b09199c62bcf9418ad846dd0e4bbdfc6ee4b' header."
            }
            return Response(body, status=status.HTTP_401_UNAUTHORIZED)

    def patch(self, request):
        if request.auth:
            user = request.user
            for attr,value in request.data.iteritems():
                setattr(user,attr,value)
            user.save()
            serializer = CurrentUserSerializer(user, context={'request': request})
            return Response(serializer.data, status=status.HTTP_200_OK,)
        else:
            body = {
                "detail" : "Authentication credentials were not provided.",
                "help" : "Provide 'Authorization: Token 9944b09199c62bcf9418ad846dd0e4bbdfc6ee4b' header."
            }
            return Response(body, status=status.HTTP_401_UNAUTHORIZED)

    def perform_create(self, serializer):
        instance = serializer.save()
        instance.set_password(instance.password)
        instance.save()

