from django.shortcuts import render
from django.views import View

from monopoly.models import Profile


class JoinView(View):
    template_name = 'join_view.html'

    def get(self, request, *args, **kwargs):
        print((request.path))
        user = request.user
        print(kwargs)
        host_name = kwargs.get('host_name', user.username)
        try:
            profile = Profile.objects.get(user=user)
            # Check if user was connected to a game which he didn't quit
            if profile.hostname:
                return render(request, 'game_view.html', {
                    "username": user.username,
                    "hostname": profile.hostname
                })
        except Exception:
            profile = None

        return render(request, self.template_name, {
            "user": {
                "name": user.username,
                "avatar": ""
            },
            "host_name": host_name if len(host_name) else user.username
        })
