# -*- coding: utf-8 -*-
# Generated by Django 1.11.3 on 2017-10-30 23:44
from __future__ import unicode_literals

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0013_auto_20171030_0053'),
    ]

    operations = [
        migrations.AlterUniqueTogether(
            name='follow',
            unique_together=set([('follower', 'followee')]),
        ),
    ]
