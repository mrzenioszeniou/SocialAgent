# -*- coding: utf-8 -*-
# Generated by Django 1.11.3 on 2017-12-29 21:13
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0020_auto_20171229_2110'),
    ]

    operations = [
        migrations.AlterField(
            model_name='user',
            name='avatar',
            field=models.ImageField(blank=True, default=b'default_avatar.png', null=True, upload_to=b'users/'),
        ),
    ]
