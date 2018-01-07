from django.db import models
from django.contrib.auth.models import AbstractUser
from django.conf import settings
from django.db.models.signals import post_save
from django.dispatch import receiver
from rest_framework.authtoken.models import Token




class Activity(models.Model):
    charUnicode = models.CharField(max_length=6)
    color = models.CharField(max_length=7)
    name = models.CharField(max_length=25)
    description = models.CharField(max_length=100)

    class Meta:
        ordering = ('id',)

    def __unicode__(self):
        return self.name


class User(AbstractUser):
    avatar = models.ImageField(upload_to='users/', default='users/default_avatar.png')
    dateOfBirth = models.DateField(null=True, blank=True)
    longitude = models.DecimalField(max_digits=9, decimal_places=6,null=True, blank=True)
    latitude = models.DecimalField(max_digits=9, decimal_places=6,null=True, blank=True)
    following = models.ManyToManyField(settings.AUTH_USER_MODEL, related_name= 'followers',
                through='Follow', through_fields=('follower', 'followee'))
    activities = models.ManyToManyField('Activity', related_name= 'followed',
                through='ActivityFollow', through_fields=('user','activity'))
    discover_distance = models.DecimalField(max_digits=7, decimal_places=3, default=9999.999)  # In KM
    discover_age_max = models.IntegerField(default=61)
    discover_age_min = models.IntegerField(default=18)
    discoverable = models.BooleanField(default=True)
    online = models.BooleanField(default=True)
    class Meta:
        ordering = ('id',)


class Follow(models.Model):
    follower = models.ForeignKey(settings.AUTH_USER_MODEL, related_name='follows')
    followee = models.ForeignKey(settings.AUTH_USER_MODEL, related_name='followed_by')
    date = models.DateField(auto_now_add=True)

    class Meta:
        ordering = ('id',)
        unique_together = (("follower", "followee"),)


class Feed(models.Model):
    SOURCE_CHOICES = (
        ("Native", "Native"),
        ("Facebook", "Facebook")
    )
    id = models.AutoField(primary_key=True)
    source = models.CharField(max_length=8,choices=SOURCE_CHOICES, default="Native")
    user = models.ForeignKey(settings.AUTH_USER_MODEL, related_name='feed')
    activity = models.ForeignKey('Activity', default=1)
    longitude = models.DecimalField(max_digits=9, decimal_places=6,
                null=True, blank=True)
    latitude = models.DecimalField(max_digits=9, decimal_places=6,
                null=True, blank=True)
    text = models.TextField(max_length=256,null=True, blank=True)
    picture = models.ImageField(upload_to='feed/',null=True, blank=True)
    datetime = models.DateTimeField(auto_now_add=True)


class ActivityFollow(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL)
    activity = models.ForeignKey('Activity')

    class Meta:
        ordering = ('id',)


@receiver(post_save, sender=settings.AUTH_USER_MODEL)
def create_auth_token(sender, instance=None, created=False, **kwargs):
    if created:
        Token.objects.create(user=instance)
