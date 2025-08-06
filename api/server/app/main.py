from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import get_settings
from app.db import engine


@asynccontextmanager
async def lifespan(app: FastAPI):
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

    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.CORS_ORIGINS,
        allow_credentials=True,
        allow_methods=['*'],
        allow_headers=settings.CORS_HEADERS,
    )

    @app.get('/')
    async def root():
        return {'message': 'Hello World'}

    return app


app = create_application()