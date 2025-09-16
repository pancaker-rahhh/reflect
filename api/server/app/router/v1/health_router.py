from fastapi import APIRouter, Request
from app.core.rate_limiting import create_rate_limit_decorator

health_router = APIRouter(prefix='/health', tags=['health'])


@health_router.get('')
async def health_check(request: Request):
    return {'status': 'ok', 'message': 'Service is healthy'}


@health_router.get('/test-rate-limit')
@create_rate_limit_decorator('feedback_submission', is_anonymous=True)
async def test_rate_limit(request: Request):
    return {
        'status': 'ok',
        'message': 'Rate limit test endpoint',
        'ip': request.client.host,
    }
