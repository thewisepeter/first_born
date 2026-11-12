"""Loopback-only receiving fixture: exercise Django's WSGI reader and real DRF parsers."""
import json
from wsgiref.simple_server import make_server

from django.conf import settings
settings.configure(DEFAULT_CHARSET="utf-8", REST_FRAMEWORK={})
from django.core.handlers.wsgi import WSGIRequest
from rest_framework.parsers import JSONParser, MultiPartParser
from rest_framework.request import Request


def observe(environ, start_response):
    request = Request(WSGIRequest(environ), parsers=[JSONParser(), MultiPartParser()])
    parts = request.data
    errors = {} if parts.get("title") else {"title": ["This field is required."]}
    payload = {
        "fields": {k: v for k, v in parts.items() if k != "images"},
        "images": [[f.name, f.read().hex()] for f in request.FILES.getlist("images")],
        "method": request.method, "path": request.path, "length": environ.get("CONTENT_LENGTH"),
        "headers": {k: request.headers.get(k) for k in ("Content-Type", "Cookie", "X-CSRFToken", "Origin", "Referer")},
    }
    start_response("400 Bad Request" if errors else "200 OK", [("Content-Type", "application/json")])
    return [json.dumps(errors or payload).encode()]


with make_server("127.0.0.1", 0, observe) as server:
    print(server.server_port, flush=True)
    server.serve_forever()
