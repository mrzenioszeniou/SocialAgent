# -*- coding: utf-8 -*-
# Generated by Django 1.11.3 on 2017-09-24 15:42
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0011_auto_20170924_1413'),
    ]

    operations = [
        migrations.AlterField(
            model_name='feed',
            name='text',
            field=models.TextField(blank=True, max_length=256, null=True),
        ),
    ]
