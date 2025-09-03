from typing import Dict, Any, Callable
import time
import functools
from collections import defaultdict
from fastapi import Request
from slowapi import Limiter
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware
from app.core.settings import get_settings
from app.core.logging import get_logger
from app.core.exceptions import RateLimitExceededError

settings = get_settings()
logger = get_logger(__name__)

# Custom rate limiting storage
_rate_limit_storage = defaultdict(list)

limiter = Limiter(key_func=get_remote_address)

RATE_LIMITS = {
    'feedback_submission': {'calls': 5, 'period': 60},
    'widget_access': {'calls': 30, 'period': 60},
    'roadmap_access': {'calls': 50, 'period': 60},
    'voting': {'calls': 20, 'period': 60},
    'health_check': {'calls': 100, 'period': 60},
    'general_public': {'calls': 40, 'period': 60},
}

ANONYMOUS_IP_LIMITS = {
    'feedback_submission': {'calls': 3, 'period': 300},
    'voting': {'calls': 10, 'period': 300},
}


def get_rate_limit_config(endpoint_type: str) -> Dict[str, Any]:
    return RATE_LIMITS.get(endpoint_type, RATE_LIMITS['general_public'])


def get_anonymous_ip_limit_config(endpoint_type: str) -> Dict[str, Any]:
    return ANONYMOUS_IP_LIMITS.get(
        endpoint_type, ANONYMOUS_IP_LIMITS['feedback_submission']
    )


def check_rate_limit(
    client_ip: str, endpoint_type: str, is_anonymous: bool = False
) -> bool:
    """Custom rate limiting implementation"""
    current_time = time.time()

    if is_anonymous:
        config = get_anonymous_ip_limit_config(endpoint_type)
    else:
        config = get_rate_limit_config(endpoint_type)

    max_calls = config['calls']
    period = config['period']

    # Create a unique key for this IP + endpoint combination
    key = f'{client_ip}:{endpoint_type}:{"anon" if is_anonymous else "auth"}'

    # Clean old entries
    _rate_limit_storage[key] = [
        timestamp
        for timestamp in _rate_limit_storage[key]
        if current_time - timestamp < period
    ]

    # Check if limit exceeded
    if len(_rate_limit_storage[key]) >= max_calls:
        logger.warning(
            f'Rate limit exceeded for {client_ip} on {endpoint_type}: {len(_rate_limit_storage[key])}/{max_calls} calls in {period}s'
        )
        return False

    # Add current request
    _rate_limit_storage[key].append(current_time)
    logger.info(
        f'Rate limit check passed for {client_ip} on {endpoint_type}: {len(_rate_limit_storage[key])}/{max_calls} calls'
    )
    return True


def create_rate_limit_decorator(endpoint_type: str, is_anonymous: bool = False):
    def decorator(func: Callable):
        @functools.wraps(func)
        async def wrapper(request: Request, *args, **kwargs):
            client_ip = request.client.host

            if not check_rate_limit(client_ip, endpoint_type, is_anonymous):
                config = (
                    get_anonymous_ip_limit_config(endpoint_type)
                    if is_anonymous
                    else get_rate_limit_config(endpoint_type)
                )

                raise RateLimitExceededError(
                    detail={
                        'error': 'Rate limit exceeded',
                        'type': endpoint_type,
                        'message': f'Too many requests. Limited to {config["calls"]} calls per {config["period"]} seconds.',
                        'retry_after': config['period'],
                    },
                    retry_after=config['period'],
                )

            return await func(request, *args, **kwargs)

        return wrapper

    return decorator


async def rate_limit_exceeded_handler(request: Request, exc: RateLimitExceeded):
    retry_after = exc.retry_after
    limit_type = getattr(request.state, 'rate_limit_type', 'general')

    error_detail = {
        'error': 'Rate limit exceeded',
        'type': limit_type,
        'retry_after': retry_after,
        'message': 'Too many requests. Please try again later.',
    }

    logger.warning(f'Rate limit exceeded for {request.client.host}: {limit_type}')

    raise RateLimitExceededError(detail=error_detail, retry_after=retry_after)


def setup_rate_limiting(app):
    app.add_middleware(SlowAPIMiddleware)
    app.state.limiter = limiter
    app.add_exception_handler(RateLimitExceeded, rate_limit_exceeded_handler)
    return app
