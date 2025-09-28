from contextlib import asynccontextmanager
import contextlib
import asyncio
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.exception_handlers import (
    authentication_error_handler,
    general_error_handler,
)
from app.core.exceptions import AuthenticationError
from app.core.settings import get_settings
from app.core.logging import setup_logging
from app.core.middleware import CorrelationIDMiddleware, RequestLoggingMiddleware
from app.core.trailing_slash_middleware import TrailingSlashMiddleware
from app.core.rate_limiting import setup_rate_limiting
from app.db import engine
from app.router.api_router import api_router
from app.router.v1.health_router import health_router
from app.db import AsyncSessionLocal
from app.services.subscription_service import subscription_service
from app.services.payment_service import payment_service


@asynccontextmanager
async def lifespan(app: FastAPI):
    setup_logging()
    # Import all models to ensure SQLAlchemy relationships are properly configured
    import app.models  # noqa

    # Start background task: scheduled cancellation processor
    stop_event = asyncio.Event()

    async def cancellation_worker():
        while not stop_event.is_set():
            try:
                async with AsyncSessionLocal() as db:
                    orgs = (
                        await subscription_service.list_organizations_due_cancellation(
                            db
                        )
                    )
                    for org in orgs:
                        try:
                            # Perform actual cancellation in Dodo if subscription exists
                            if org.dodo_subscription_id:
                                await payment_service.cancel_subscription(db, org.id)
                            else:
                                await subscription_service.cancel_subscription(
                                    db, org.id
                                )
                        except Exception:
                            # Log inside payment_service; continue processing others
                            pass
            except Exception:
                # Swallow to avoid killing loop
                pass
            # Sleep a minute between scans
            await asyncio.sleep(60)

    task = asyncio.create_task(cancellation_worker())

    try:
        yield
    finally:
        stop_event.set()
        task.cancel()
        with contextlib.suppress(Exception):
            await task
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
        redirect_slashes=False,
    )

    # Add middleware in correct order (bottom to top execution)
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins_list,
        allow_credentials=True,
        allow_methods=['*'],
        allow_headers=settings.cors_headers_list,
    )
    app.add_middleware(TrailingSlashMiddleware, remove_slash=True)
    app.add_middleware(RequestLoggingMiddleware)
    app.add_middleware(CorrelationIDMiddleware)

    # Setup rate limiting (must be after other middleware)
    setup_rate_limiting(app)

    app.add_exception_handler(AuthenticationError, authentication_error_handler)
    app.add_exception_handler(Exception, general_error_handler)

    app.include_router(api_router)
    app.include_router(health_router)

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
