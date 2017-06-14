from django.views.generic.base import TemplateView
from django.views import View
from django.http import HttpResponseBadRequest, HttpResponseRedirect, Http404, JsonResponse
from django.core.urlresolvers import reverse
from django.core.cache import cache
import pickle
import json
from urllib.parse import urlparse


def index_to_base(n,base):
    convert_string = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz"
    if n < base:
        return convert_string[n]
    else:
        return index_to_base(n // base, base) + convert_string[n % base]


def _error(text):
    return {'errors': text}


class ShortenedRedirectView(View):

    def get(self, request, *args, **kwargs):
        slink = kwargs.get('slink', None)
        if not slink:
            return HttpResponseRedirect(reverse('home'))
        url = cache.get(slink)
        if not url:
            return Http404

        p = urlparse(url, 'http')
        netloc = p.netloc or p.path
        path = p.path if p.netloc else ''
        if not netloc.startswith('www.'):
            netloc = 'www.' + netloc

        url = p.geturl()

        return HttpResponseRedirect(url)


class HomeView(TemplateView, View):

    template_name = "index.html"

    def _set_client_history(self, ip, data=None):
        if not data:
            data = list()
        cache.set('_{}'.format(ip), pickle.dumps(data), timeout=None)
        return data

    def _get_client_history(self, ip):
        raw_client_history = cache.get('_{}'.format(ip), default=None)
        if not raw_client_history:
            return None
        client_history = pickle.loads(raw_client_history)
        return client_history

    def post(self, request, *args, **kwargs):
        json_request = json.loads(request.body.decode('utf-8'))

        URL = json_request.get('url', None)
        WATCH_HISTORY = json_request.get('hist', None)

        # URL = request.POST.get('url', None)
        DOMAIN = request.META.get('HTTP_HOST', None)

        if (not URL) and (not WATCH_HISTORY):
            print(URL, WATCH_HISTORY, json_request)
            return JsonResponse(_error('Empty url. Nothing to shorten.'))

        if not DOMAIN:
            return HttpResponseBadRequest(_error('Is this a hots you looking for?'))

        # Handle client history
        CLIENT_IP = request.META.get('CLIENT_IP', None)
        client_history = self._get_client_history(CLIENT_IP)
        if not client_history:
            client_history = self._set_client_history(CLIENT_IP)

        if WATCH_HISTORY:
            return JsonResponse({'history': client_history})

        # Get current unique index
        url_index = cache.get('url_index', default=-1)
        if url_index == -1:
            # starts from 999 to make link's little bit serious
            url_index = 999
            cache.set('url_index', url_index, timeout=None)

        # Increment unique index
        url_index = cache.incr('url_index', delta=1)
        # Create short integer representation
        base_index = index_to_base(url_index, 62)

        # Add base index as key if does not exists yet
        if not cache.get(base_index):
            cache.add(base_index, URL, timeout=None)

        link = 'http://{0}/{1}'.format(DOMAIN, base_index)

        # Add link to client history
        client_history.insert(0, {'base': URL, 'link': link})
        self._set_client_history(CLIENT_IP, client_history)

        RESPONSE = {
            'url': URL,
            'short': link,
            'history': client_history
        }

        return JsonResponse(RESPONSE)