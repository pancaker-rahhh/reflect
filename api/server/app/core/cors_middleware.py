from typing import Sequence
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from starlette.requests import Request


class SelectiveCORSMiddleware(CORSMiddleware):
    def __init__(
        self,
        app,
        excluded_paths: Sequence[str] = None,
        allow_origins: Sequence[str] = (),
        allow_credentials: bool = False,
        allow_methods: Sequence[str] = ("GET",),
        allow_headers: Sequence[str] = (),
        expose_headers: Sequence[str] = (),
        max_age: int = 600,
    ):
        super().__init__(
            app,
            allow_origins=allow_origins,
            allow_credentials=allow_credentials,
            allow_methods=allow_methods,
            allow_headers=allow_headers,
            expose_headers=expose_headers,
            max_age=max_age,
        )
        self.excluded_paths = excluded_paths or []
    
    def _is_excluded_path(self, path: str) -> bool:
        return any(path.startswith(excluded) for excluded in self.excluded_paths)
    
    async def dispatch(self, request: Request, call_next):
        if self._is_excluded_path(request.url.path):
            return await call_next(request)
        return await super().dispatch(request, call_next)


def setup_selective_cors(
    app: FastAPI,
    excluded_paths: Sequence[str] = None,
    allow_origins: Sequence[str] = (),
    allow_credentials: bool = False,
    allow_methods: Sequence[str] = ("GET",),
    allow_headers: Sequence[str] = (),
    expose_headers: Sequence[str] = (),
    max_age: int = 600,
) -> None:
    app.add_middleware(
        SelectiveCORSMiddleware,
        excluded_paths=excluded_paths,
        allow_origins=allow_origins,
        allow_credentials=allow_credentials,
        allow_methods=allow_methods,
        allow_headers=allow_headers,
        expose_headers=expose_headers,
        max_age=max_age,
    )
