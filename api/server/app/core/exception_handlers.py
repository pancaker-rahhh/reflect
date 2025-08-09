import logging
from fastapi import Request
from fastapi.responses import JSONResponse
from app.core.exceptions import (
    AuthenticationError,
)

logger = logging.getLogger(__name__)


async def authentication_error_handler(request: Request, exc: Exception):
    if isinstance(exc, AuthenticationError):
        logger.error(
            f'Authentication error for request: {request.method} {request.url}',
            exc_info=exc,
        )

        return JSONResponse(
            status_code=exc.status_code,
            content={'detail': exc.detail},
        )
    return JSONResponse(
        status_code=500, content={'detail': 'An internal error occurred.'}
    )


async def general_error_handler(request: Request, exc: Exception):
    logger.error(
        f'Error occurred for request: {request.method} {request.url}',
        exc_info=exc,
    )
    logger.error(f'Unhandled exception: {exc}', exc_info=True)
    return JSONResponse(status_code=500, content={'error': 'Internal server error'})