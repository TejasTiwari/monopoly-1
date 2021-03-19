from django.shortcuts import render, redirect
from django.views import View
from django.contrib.auth import login, authenticate, logout

from ..consumers import games, rooms

class LoginView(View):
    initial = {'active_page': 'register'}
    template_name = 'login_view.html'

    def get(self, request, *args, **kwargs):
        return render(request, self.template_name, {
            "active_page": "login",
            "error": None
        })

    def post(self, request, *args, **kwargs):
        username = request.POST['username']
        password = request.POST['password']
        user = authenticate(username=username, password=password)

        if user is not None:
            if user.is_active:
                login(request, user)
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
    logout(request)
    # Redirect to a success page.
    res = {'active_page': 'Logged out',
           "error": "By logging out you have quit the game you were participating in if any."}
    return render(request, 'login_view.html', res)
