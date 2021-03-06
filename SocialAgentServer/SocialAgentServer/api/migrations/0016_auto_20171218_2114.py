# -*- coding: utf-8 -*-
# Generated by Django 1.11.3 on 2017-12-18 21:14
from __future__ import unicode_literals

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0015_auto_20171218_2050'),
    ]

    operations = [
        migrations.CreateModel(
            name='UserSettings',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('discover_distance', models.DecimalField(decimal_places=3, default=9999.999, max_digits=7)),
                ('discover_age_max', models.IntegerField(default=100)),
                ('discover_age_min', models.IntegerField(default=18)),
                ('discover_common_activities', models.ManyToManyField(to='api.Activity')),
            ],
        ),
        migrations.RemoveField(
            model_name='user',
            name='discover_distance',
        ),
        migrations.AddField(
            model_name='usersettings',
            name='user',
            field=models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, related_name='settings', to=settings.AUTH_USER_MODEL),
        ),
    ]
