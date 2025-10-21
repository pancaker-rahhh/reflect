import uuid
import time
from typing import Callable
from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware

from app.core.logging import get_logger, correlation_id_context

logger = get_logger(__name__)


class CorrelationIDMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        correlation_id = request.headers.get('X-Correlation-ID', str(uuid.uuid4()))
        request.state.correlation_id = correlation_id

        async with correlation_id_context(correlation_id):
            start_time = time.time()

            logger.debug(
                'request.started',
                method=request.method,
                url=str(request.url),
                correlation_id=correlation_id,
            )

            response = await call_next(request)

            process_time = time.time() - start_time
            response.headers['X-Correlation-ID'] = correlation_id
            response.headers['X-Process-Time'] = str(process_time)

            logger.debug(
                'request.completed',
                method=request.method,
                url=str(request.url),
                status_code=response.status_code,
                process_time=process_time,
                correlation_id=correlation_id,
            )

            return response


class RequestLoggingMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        request_info = {
            'method': request.method,
            'url': str(request.url),
            'headers': dict(request.headers),
            'client_ip': request.client.host if request.client else None,
            'user_agent': request.headers.get('user-agent'),
            'correlation_id': getattr(request.state, 'correlation_id', None),
        }

        logger.debug('request.details', **request_info)

        response = await call_next(request)

        response_info = {
            'status_code': response.status_code,
            'response_headers': dict(response.headers),
            'correlation_id': getattr(request.state, 'correlation_id', None),
        }

        logger.debug('response.details', **response_info)

        return response


class CORSOptionsMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request, call_next):
        if request.method == 'OPTIONS':
            response = Response(status_code=200)
            response.headers['Access-Control-Allow-Origin'] = request.headers.get(
                'origin', '*'
            )
            response.headers['Access-Control-Allow-Methods'] = '*'
            response.headers['Access-Control-Allow-Headers'] = '*'
            response.headers['Access-Control-Allow-Credentials'] = 'true'
            response.headers['Access-Control-Max-Age'] = '3600'
            return response

        response = await call_next(request)
        return response
