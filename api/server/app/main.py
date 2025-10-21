import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.exception_handlers import (
    authentication_error_handler,
    general_error_handler,
)
from app.core.exceptions import AuthenticationError
from app.core.settings import get_settings
from app.core.middleware import CorrelationIDMiddleware, RequestLoggingMiddleware
from app.core.rate_limiting import setup_rate_limiting
from app.core.logging import setup_logging
from app.core.lifespan import lifespan
from app.router.api_router import api_router
from app.router.v1.health_router import health_router

setup_logging()

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
        redirect_slashes=False,
    )
    # Add middleware in correct order (bottom to top execution)
    app.add_middleware(
        CORSMiddleware,
        allow_origins=['https://ui-dev.reflectfeedback.com', 'https://reflectfeedback.com'],
        allow_credentials=True,
        allow_methods=['*'],
        allow_headers=['*'],
        expose_headers=['X-Correlation-ID', 'X-Process-Time'],
        max_age=3600,
    )

    app.add_middleware(RequestLoggingMiddleware)
    app.add_middleware(CorrelationIDMiddleware)

    # Setup rate limiting (done after middleware)
    setup_rate_limiting(app)

    app.add_exception_handler(AuthenticationError, authentication_error_handler)
    app.add_exception_handler(Exception, general_error_handler)

    app.include_router(api_router)
    app.include_router(health_router)

    @app.get('/debug/cors')
    async def debug_cors():
        settings = get_settings()
        return {
            'CORS_ORIGINS_RAW': settings.CORS_ORIGINS,
            'cors_origins_list': settings.cors_origins_list,
            'cors_headers_list': settings.cors_headers_list,
            'ENV': settings.ENV,
        }

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
