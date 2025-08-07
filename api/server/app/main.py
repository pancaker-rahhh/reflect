from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.exception_handlers import authentication_error_handler, general_error_handler
from app.core.exceptions import AuthenticationError
from api.server.app.core.settings import get_settings
from app.core.logging import setup_logging
from app.core.middleware import CorrelationIDMiddleware, RequestLoggingMiddleware
from app.db import engine
from app.router.api_router import api_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    setup_logging()
    yield
    await engine.dispose()


def create_application() -> FastAPI:
    settings = get_settings()

    app = FastAPI(
        title=settings.APP_NAME,
        version=settings.APP_VERSION,
        debug=settings.DEBUG,
        openapi_url=f'{settings.API_PREFIX}/openapi.json',
        docs_url=f'{settings.API_PREFIX}/docs',
        redoc_url=f'{settings.API_PREFIX}/redoc',
        lifespan=lifespan,
    )

    # Add middleware in correct order (bottom to top execution)
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins_list,
        allow_credentials=True,
        allow_methods=['*'],
        allow_headers=settings.cors_headers_list,
    )
    app.add_middleware(RequestLoggingMiddleware)
    app.add_middleware(CorrelationIDMiddleware)

    app.add_exception_handler(AuthenticationError, authentication_error_handler)
    app.add_exception_handler(Exception, general_error_handler)

    app.include_router(api_router)

    @app.get('/')
    async def root():
        return {
            'name': settings.APP_NAME,
            'version': settings.APP_VERSION,
            'docs': f'{settings.API_PREFIX}/docs',
            'health': f'{settings.API_PREFIX}/health',
        }

    return app


app = create_application()
