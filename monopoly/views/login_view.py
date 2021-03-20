import pickle

from django.shortcuts import render, redirect
from django.views import View
from django.contrib.auth import login, authenticate, logout
from django.http import HttpResponseRedirect

from monopoly.models.profile import Profile
from ..consumers import games, rooms

class LoginView(View):
    initial = {'active_page': 'register'}
    template_name = 'login_view.html'

    def get(self, request, *args, **kwargs):
        try:
            logout(request)
        except Exception:
            pass
        return render(request, self.template_name, {
            "active_page": "login",
            "error": None
        })

    def post(self, request, *args, **kwargs):
        try:
            logout(request)
        except Exception:
            pass
        username = request.POST['username']
        password = request.POST['password']
        user = authenticate(username=username, password=password)

        if user is not None:
            if user.is_active:
                login(request, user)
                redirect_to = request.POST.get('next', request.GET.get('next', ''))
                # Check this to avoid looping over the same url
                if redirect_to and redirect_to != request.path:
                    return HttpResponseRedirect(redirect_to)
                return redirect("/monopoly/join")

            else:
                res = {'active_page': 'login',
                       "error": "Inactive user."}
                return render(request, self.template_name, res)
        else:
            res = {'active_page': 'login',
                   "error": "Invalid username or password."}
            return render(request, self.template_name, res)

def logout_view(request):
    if not request.user.is_anonymous:
        profile, created = Profile.objects.get_or_create(user=request.user)
        try:
            del games[profile.hostname]
            with open('monopoly/games.pkl', 'wb') as f:
                pickle.dump(games, f)
        except KeyError:
            pass
        try:
            del rooms[str(request.user)]
            print(rooms)
            with open('monopoly/rooms.pkl', 'wb') as f:
                pickle.dump(rooms, f)
        except KeyError:
            pass
        profile.hostname = None
        profile.save()
        logout(request)
    # Redirect to a success page.
    res = {'active_page': 'login',
           "error": "By logging out you have quit the game you were participating in if any."}
    # return render(request, 'login_view.html', res)
    return HttpResponseRedirect('monopoly/login', res)
