from contextlib import asynccontextmanager
from app.core.config import get_settings
from app.core.logging import setup_logging
from app.routes.router import api_router
from app.routes.auth_router import router as auth_router
from app.routes.parties_router import router as party_router
from app.routes.template_router import router as template_router
from app.routes.action_item_router import router as action_item_router
from app.routes.form_router import router as form_router
from app.routes.notification_router import router as notification_router
from app.routes.dev_utils_router import router as dev_utils_router
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.scripts.seed import create_default_templates
from app.core.exceptions import (
    DatabaseError,
    LLMGenerationError,
    NotFoundError,
    BadRequestError,
)
from app.core.exception_handlers import (
    database_error_handler,
    llm_generation_error_handler,
    not_found_error_handler,
    general_error_handler,
    bad_request_error_handler,
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    print('🚀 Starting up application...')
    create_default_templates()
    yield

    print('🔄 Shutting down application...')


def create_application() -> FastAPI:
    settings = get_settings()

    setup_logging()

    app = FastAPI(
        title=settings.APP_NAME,
        version=settings.APP_VERSION,
        debug=settings.DEBUG,
        openapi_url=f'{settings.API_PREFIX}/openapi.json',
        docs_url=f'{settings.API_PREFIX}/docs',
        redoc_url=f'{settings.API_PREFIX}/redoc',
        lifespan=lifespan,
    )

    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.CORS_ORIGINS,
        allow_credentials=True,
        allow_methods=['*'],
        allow_headers=settings.CORS_HEADERS,
    )

    app.add_exception_handler(NotFoundError, not_found_error_handler)
    app.add_exception_handler(DatabaseError, database_error_handler)
    app.add_exception_handler(LLMGenerationError, llm_generation_error_handler)
    app.add_exception_handler(BadRequestError, bad_request_error_handler)
    app.add_exception_handler(Exception, general_error_handler)

    app.include_router(api_router, prefix=settings.API_PREFIX)
    app.include_router(auth_router, prefix=f'{settings.API_PREFIX}/auth')
    app.include_router(template_router, prefix=f'{settings.API_PREFIX}/templates')
    app.include_router(form_router, prefix=f'{settings.API_PREFIX}/forms')
    app.include_router(party_router, prefix=f'{settings.API_PREFIX}/party')
    app.include_router(action_item_router, prefix=f'{settings.API_PREFIX}/action-items')
    app.include_router(notification_router, prefix=f'{settings.API_PREFIX}')
    app.include_router(dev_utils_router, prefix=f'{settings.API_PREFIX}/dev')
    return app


app = create_application()
