from fastapi import APIRouter, status, BackgroundTasks, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.schemas.health_schema import HealthCheckResponse, WorkerHealthResponse
from app.services.health_service import health_service
from app.db import get_db

health_router = APIRouter(
    prefix='/health',
    tags=['health'],
)


@health_router.get(
    '', response_model=HealthCheckResponse, status_code=status.HTTP_200_OK
)
async def health_check() -> HealthCheckResponse:
    return health_service.get_health_status()


@health_router.get(
    '/worker', response_model=WorkerHealthResponse, status_code=status.HTTP_200_OK
)
async def worker_health_check(
    background_tasks: BackgroundTasks, db: AsyncSession = Depends(get_db)
) -> WorkerHealthResponse:
    return await health_service.check_worker_health(db, background_tasks)
