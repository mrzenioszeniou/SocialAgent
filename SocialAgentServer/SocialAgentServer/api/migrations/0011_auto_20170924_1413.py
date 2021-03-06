# -*- coding: utf-8 -*-
# Generated by Django 1.11.3 on 2017-09-24 14:13
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0010_auto_20170924_1411'),
    ]

    operations = [
        migrations.AlterField(
            model_name='feed',
            name='picture',
            field=models.ImageField(blank=True, null=True, upload_to=b'feed/'),
        ),
        migrations.AlterField(
            model_name='user',
            name='avatar',
            field=models.ImageField(blank=True, height_field=40, null=True, upload_to=b'user/', width_field=40),
        ),
    ]
