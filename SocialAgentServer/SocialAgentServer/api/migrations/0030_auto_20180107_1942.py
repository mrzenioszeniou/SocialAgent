# -*- coding: utf-8 -*-
# Generated by Django 1.11.3 on 2018-01-07 19:42
from __future__ import unicode_literals

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0029_auto_20180107_1941'),
    ]

    operations = [
        migrations.AlterField(
            model_name='feed',
            name='activity',
            field=models.ForeignKey(default=1, on_delete=django.db.models.deletion.CASCADE, to='api.Activity'),
        ),
        migrations.AlterField(
            model_name='feed',
            name='user',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='feed', to=settings.AUTH_USER_MODEL),
        ),
    ]
