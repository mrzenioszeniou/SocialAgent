from rest_framework import serializers
from rest_framework.request import Request
from api.models import *


class ActivitySerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = Activity
        fields = ('url', 'id', 'charUnicode', 'color', 'name', 'description','followed')


class ActivityFollowSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = ActivityFollow
        fields = ('url', 'user', 'activity')


class FollowSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = Follow
        fields = ('url','follower','followee','date')


class ReactionSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = Reaction
        fields = ('url', 'user', 'feed', 'datetime', 'content', 'type')


class FeedSerializer(serializers.HyperlinkedModelSerializer):
    reactions = ReactionSerializer(many=True, read_only=True)

    class Meta:
        model = Feed
        fields = ('url','id','source','user','activity','datetime','latitude','longitude','text','picture','source','reactions')


class UserSerializer(serializers.HyperlinkedModelSerializer):
    activities = ActivityFollowSerializer(source='activityfollow_set', many=True,read_only=True)
    following = FollowSerializer(source='follows',many=True,read_only=True)
    followers = FollowSerializer(source='followed_by',many=True,read_only=True)

    class Meta:
        model = User
        # fields = ('url', 'username', 'first_name', 'last_name', 'avatar', 'dateOfBirth','following','followers',
        #           'activities')
        fields = ('url', 'id', 'username', 'first_name', 'last_name', 'email', 'avatar', 'dateOfBirth',
                  'latitude', 'longitude', 'following', 'followers', 'activities')


class CurrentUserSerializer(serializers.HyperlinkedModelSerializer):
    activities = ActivityFollowSerializer(source='activityfollow_set', many=True, read_only=True)
    following = FollowSerializer(source='follows',many=True, read_only=True)
    followers = FollowSerializer(source='followed_by',many=True, read_only=True)
    reactions = ReactionSerializer(many=True, read_only=True)
    class Meta:
        model = User
        fields = ('url', 'id', 'username', 'password', 'first_name', 'last_name', 'email', 'avatar', 'dateOfBirth',
                  'latitude', 'longitude', 'following', 'followers', 'activities', 'discover_distance',
                  'discover_age_max', 'discover_age_min', 'feed', 'discoverable', 'online', 'reactions')

