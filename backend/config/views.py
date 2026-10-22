from pathlib import Path

from django.conf import settings
from django.http import FileResponse, Http404


def frontend(request):
    index_file = Path(settings.BASE_DIR).parent / 'miniapp' / 'dist' / 'index.html'
    if not index_file.is_file():
        raise Http404('Frontend build is missing.')
    return FileResponse(index_file.open('rb'), content_type='text/html; charset=utf-8')
