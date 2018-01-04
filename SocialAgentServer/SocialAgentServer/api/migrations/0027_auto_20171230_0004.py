# -*- coding: utf-8 -*-
# Generated by Django 1.11.3 on 2017-12-30 00:04
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0026_auto_20171229_2352'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='feed',
            name='fromFacebook',
        ),
        migrations.AlterField(
            model_name='feed',
            name='source',
            field=models.CharField(choices=[(b'Native', b'Native'), (b'Facebook', b'Facebook')], default=b'Native', max_length=8),
        ),
    ]
