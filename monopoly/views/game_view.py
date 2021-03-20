from django.shortcuts import render
from django.views import View

from monopoly.models.profile import Profile


class GameView(View):
    template_name = 'game_view.html'

    def get(self, request, *args, **kwargs):
        profile, created = Profile.objects.get_or_create(user=request.user)
        profile.hostname = kwargs.get("host_name")
        return render(request, self.template_name, {
            "username": request.user.username,
            "hostname": profile.hostname
        })
