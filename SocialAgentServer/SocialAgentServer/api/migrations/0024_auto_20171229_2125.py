# -*- coding: utf-8 -*-
# Generated by Django 1.11.3 on 2017-12-29 21:25
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0023_auto_20171229_2124'),
    ]

    operations = [
        migrations.AlterField(
            model_name='user',
            name='avatar',
            field=models.ImageField(default=b'media/users/default_avatar.png', upload_to=b'users/'),
        ),
    ]
