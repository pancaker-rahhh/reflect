from fastapi import APIRouter, status

from app.schemas.health_schema import HealthCheckResponse
from app.services.health_service import health_service

health_router = APIRouter(
    prefix='/health',
    tags=['health'],
)


@health_router.get(
    '', response_model=HealthCheckResponse, status_code=status.HTTP_200_OK
)
async def health_check() -> HealthCheckResponse:
    return health_service.get_health_status()
