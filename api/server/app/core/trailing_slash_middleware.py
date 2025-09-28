from fastapi import Request, Response
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.types import ASGIApp


class TrailingSlashMiddleware(BaseHTTPMiddleware):
    def __init__(self, app: ASGIApp, remove_slash: bool = True):
        super().__init__(app)
        self.remove_slash = remove_slash

    async def dispatch(self, request: Request, call_next):
        path = request.url.path
        
        if path.startswith('/docs') or path.startswith('/openapi.json') or path.startswith('/redoc'):
            return await call_next(request)
        
        if self.remove_slash and path != '/' and path.endswith('/'):
            new_path = path.rstrip('/')
            new_url = request.url.replace(path=new_path)
            request.scope['path'] = new_path
            request.scope['raw_path'] = new_path.encode()
        
        response = await call_next(request)
        return response
