import logging
from fastapi import FastAPI, Request
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

logger = logging.getLogger("cors_debug")
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

    logger.info(f"CORS_ORIGINS: {settings.cors_origins_list}")
    logger.info(f"CORS_HEADERS: {settings.cors_headers_list}")

    # Add middleware in correct order (bottom to top execution)
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins_list,
        allow_credentials=True,
        allow_methods=['*'],
        allow_headers=settings.cors_headers_list,
        expose_headers=['X-Correlation-ID', 'X-Process-Time'],
    )
    logger.info("CORSMiddleware added.")

    app.add_middleware(RequestLoggingMiddleware)
    app.add_middleware(CorrelationIDMiddleware)

    # Setup rate limiting (must be after other middleware)
    setup_rate_limiting(app)

    app.add_exception_handler(AuthenticationError, authentication_error_handler)
    app.add_exception_handler(Exception, general_error_handler)

    app.include_router(api_router)
    app.include_router(health_router)

    @app.api_route("/{full_path:path}", methods=["OPTIONS", "GET", "POST", "PUT", "DELETE", "PATCH"])
    async def catch_all(request: Request, full_path: str):
        logger.info(f"Request caught: method={request.method}, path={full_path}, origin={request.headers.get('origin')}")
        return {
            "method": request.method,
            "path": full_path,
            "origin": request.headers.get("origin"),
        }

    @app.get('/')
    async def root():
        logger.info("Root endpoint called.")
        return {
            'name': settings.APP_NAME,
            'version': settings.APP_VERSION,
            'docs': f'{settings.API_PREFIX}/docs',
            'health': f'{settings.API_PREFIX}/health',
        }

    return app


app = create_application()
