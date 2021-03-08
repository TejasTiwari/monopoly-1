# -*- coding: utf-8 -*-


from django.db import models
from django.contrib.auth.models import User


# We will use the default User model and this Profile model for user info
class Profile(models.Model):
    user = models.OneToOneField(User)
    bio = models.CharField(max_length=140, blank=True)
    avatar = models.FileField(blank=False)

    def __str__(self):
        return str(self.user) + str(self.bio) + str(self.avatar)
