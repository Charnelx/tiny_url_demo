from django.http import HttpResponseRedirect
import re


class RemoteInfoMiddleware(object):
    def __init__(self, get_response):
        self.get_response = get_response
        self.ie_pattern = re.compile('(.*Trident.*)')

    def __call__(self, request):
        ip = request.META.get('HTTP_CF_CONNECTING_IP')
        if ip is None:
            ip = request.META.get('REMOTE_ADDR')

        user_agent = request.META.get('HTTP_USER_AGENT', None)

        agent = re.findall(self.ie_pattern, str(user_agent))
        if (agent) or (not user_agent):
            return HttpResponseRedirect('https://www.lifewire.com/how-to-update-internet-explorer-2617983')

        request.META['CLIENT_IP'] = ip

        response = self.get_response(request)
        return response