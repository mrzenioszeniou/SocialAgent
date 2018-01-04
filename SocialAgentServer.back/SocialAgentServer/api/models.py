from django.db import models
from django.contrib.auth.models import AbstractUser
from django.conf import settings


class Activity(models.Model):
    charUnicode = models.CharField(max_length=6)
    color = models.CharField(max_length=7)
    name = models.CharField(max_length=25)
    description = models.CharField(max_length=100)

    class Meta:
        ordering = ('id',)


class User(AbstractUser):
    dateOfBirth = models.DateField(null=True, blank=True)
    longitude = models.DecimalField(max_digits=9, decimal_places=6,
                null=True, blank=True)
    latitude = models.DecimalField(max_digits=9, decimal_places=6,
                null=True, blank=True)
    following = models.ManyToManyField(settings.AUTH_USER_MODEL, related_name= 'followed',
                through='Follow', through_fields=('follower', 'followee'))
    activities = models.ManyToManyField('Activity', related_name= 'followed',
                through='ActivityFollow', through_fields=('user','activity'))

    class Meta:
        ordering = ('id',)


class Follow(models.Model):
    follower = models.ForeignKey(settings.AUTH_USER_MODEL, related_name='follows')
    followee = models.ForeignKey(settings.AUTH_USER_MODEL, related_name='followed_by')
    date = models.DateField(auto_now_add=True)

    class Meta:
        ordering = ('id',)


class ActivityFollow(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL)
    activity = models.ForeignKey('Activity')

    class Meta:
        ordering = ('id',)