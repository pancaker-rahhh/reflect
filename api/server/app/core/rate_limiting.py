import time
import asyncio
from typing import Dict, Optional
from functools import wraps
from fastapi import HTTPException, Request
from app.core.logging import get_logger

logger = get_logger(__name__)


class RateLimiter:
    def __init__(self):
        self._requests: Dict[str, list] = {}
        self._cleanup_task: Optional[asyncio.Task] = None

    def _get_client_key(self, request: Request) -> str:
        client_ip = request.headers.get('X-Forwarded-For', request.client.host)
        return f'{client_ip}'

    def _cleanup_old_requests(self) -> None:
        current_time = time.time()
        for client_key in list(self._requests.keys()):
            self._requests[client_key] = [
                req_time
                for req_time in self._requests[client_key]
                if current_time - req_time < 3600  # Keep last hour
            ]
            if not self._requests[client_key]:
                del self._requests[client_key]

    def is_rate_limited(
        self, client_key: str, max_requests: int, window_seconds: int
    ) -> bool:
        current_time = time.time()

        if client_key not in self._requests:
            self._requests[client_key] = []

        self._requests[client_key] = [
            req_time
            for req_time in self._requests[client_key]
            if current_time - req_time < window_seconds
        ]

        if len(self._requests[client_key]) >= max_requests:
            return True

        self._requests[client_key].append(current_time)
        return False

    def get_remaining_requests(
        self, client_key: str, max_requests: int, window_seconds: int
    ) -> int:
        current_time = time.time()

        if client_key not in self._requests:
            return max_requests

        self._requests[client_key] = [
            req_time
            for req_time in self._requests[client_key]
            if current_time - req_time < window_seconds
        ]

        return max(0, max_requests - len(self._requests[client_key]))

    def get_reset_time(self, client_key: str, window_seconds: int) -> float:
        if client_key not in self._requests or not self._requests[client_key]:
            return time.time()

        oldest_request = min(self._requests[client_key])
        return oldest_request + window_seconds


rate_limiter = RateLimiter()


def rate_limit(max_requests: int = 100, window_seconds: int = 3600):
    def decorator(func):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            from fastapi import Request
            from starlette.requests import Request as StarletteRequest

            request = None

            if 'request' in kwargs:
                request = kwargs['request']
            else:
                for arg in args:
                    if isinstance(arg, (Request, StarletteRequest)):
                        request = arg
                        break

                if not request:
                    for arg in args:
                        if hasattr(arg, 'client') and hasattr(arg, 'headers'):
                            request = arg
                            break

            if not request:
                logger.warning(
                    f'Rate limiting skipped for {func.__name__}: no request object found'
                )
                return await func(*args, **kwargs)

            client_key = rate_limiter._get_client_key(request)

            if rate_limiter.is_rate_limited(client_key, max_requests, window_seconds):
                remaining_time = (
                    rate_limiter.get_reset_time(client_key, window_seconds)
                    - time.time()
                )

                logger.warning(
                    f'Rate limit exceeded for {client_key} on {func.__name__}'
                )

                raise HTTPException(
                    status_code=429,
                    detail={
                        'error': 'Rate limit exceeded',
                        'message': f'Too many requests. Try again in {int(remaining_time)} seconds.',
                        'retry_after': int(remaining_time),
                        'limit': max_requests,
                        'window': window_seconds,
                    },
                )

            remaining_requests = rate_limiter.get_remaining_requests(
                client_key, max_requests, window_seconds
            )
            reset_time = rate_limiter.get_reset_time(client_key, window_seconds)

            request.state.rate_limit_headers = {
                'X-RateLimit-Limit': str(max_requests),
                'X-RateLimit-Remaining': str(remaining_requests),
                'X-RateLimit-Reset': str(int(reset_time)),
            }

            return await func(*args, **kwargs)

        return wrapper

    return decorator


def add_rate_limit_headers(response, request):
    if hasattr(request.state, 'rate_limit_headers'):
        for header, value in request.state.rate_limit_headers.items():
            response.headers[header] = value


class JiraRateLimiter:
    def __init__(self):
        self._jira_requests: Dict[str, list] = {}
        self._default_limit = 100  # Default JIRA API limit per hour
        self._default_window = 3600  # 1 hour

    def check_jira_rate_limit(
        self, integration_id: str, max_requests: Optional[int] = None
    ) -> bool:
        if max_requests is None:
            max_requests = self._default_limit

        current_time = time.time()

        if integration_id not in self._jira_requests:
            self._jira_requests[integration_id] = []

        self._jira_requests[integration_id] = [
            req_time
            for req_time in self._jira_requests[integration_id]
            if current_time - req_time < self._default_window
        ]

        if len(self._jira_requests[integration_id]) >= max_requests:
            return True

        self._jira_requests[integration_id].append(current_time)
        return False

    def get_jira_remaining_requests(
        self, integration_id: str, max_requests: Optional[int] = None
    ) -> int:
        if max_requests is None:
            max_requests = self._default_limit

        current_time = time.time()

        if integration_id not in self._jira_requests:
            return max_requests

        self._jira_requests[integration_id] = [
            req_time
            for req_time in self._jira_requests[integration_id]
            if current_time - req_time < self._default_window
        ]

        return max(0, max_requests - len(self._jira_requests[integration_id]))


jira_rate_limiter = JiraRateLimiter()
