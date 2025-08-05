import logging
from fastapi import Request
from fastapi.responses import JSONResponse
from app.core.exceptions import (
    AuthorizationError,
    DatabaseError,
    LLMGenerationError,
    NotFoundError,
    BadRequestError,
)

logger = logging.getLogger(__name__)


async def not_found_error_handler(request: Request, exc: NotFoundError):
    logger.error(
        f'Not Found error occurred for request: {request.method} {request.url}',
        exc_info=exc,
    )
    return JSONResponse(
        status_code=404,
        content={'detail': str(exc)},
    )


async def authorization_error(request: Request, exc: AuthorizationError):
    logger.error(
        f'Authorization error occurred for request: {request.method} {request.url}',
        exc_info=exc,
    )
    return JSONResponse(
        status_code=404,
        content={'detail': str(exc)},
    )


async def database_error_handler(request: Request, exc: DatabaseError):
    logger.error(
        f'Database error occurred for request: {request.method} {request.url}',
        exc_info=exc,
    )
    return JSONResponse(
        status_code=500,
        content={'detail': 'A database error occurred.'},
    )


async def llm_generation_error_handler(request: Request, exc: LLMGenerationError):
    logger.error(
        f'LLM Generation error occurred for request: {request.method} {request.url}',
        exc_info=exc,
    )
    return JSONResponse(
        status_code=502,
        content={'detail': f'An error occurred with the AI: {exc}'},
    )


async def bad_request_error_handler(request: Request, exc: BadRequestError):
    logger.error(
        f'Bad Request error occurred for request: {request.method} {request.url}',
        exc_info=exc,
    )
    return JSONResponse(
        status_code=400,
        content={'detail': str(exc)},
    )


async def general_error_handler(request: Request, exc: Exception):
    logger.error(
        f'Error occurred for request: {request.method} {request.url}',
        exc_info=exc,
    )
    logger.error(f'Unhandled exception: {exc}', exc_info=True)
    return JSONResponse(status_code=500, content={'error': 'Internal server error'})
