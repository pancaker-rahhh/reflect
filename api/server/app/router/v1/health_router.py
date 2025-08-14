from fastapi import APIRouter, status, Depends, BackgroundTasks

from app.schemas.health_schema import HealthCheckResponse
from app.services.health_service import health_service
from app.services.tasks.base_executor import TaskExecutor
from app.services.tasks.executor_factory import task_executor_factory

health_router = APIRouter(
    prefix='/health',
    tags=['health'],
)


@health_router.get(
    '', response_model=HealthCheckResponse, status_code=status.HTTP_200_OK
)
async def health_check() -> HealthCheckResponse:
    return health_service.get_health_status()


@health_router.post(
    '/test-task',
    status_code=status.HTTP_202_ACCEPTED,
    summary='Test task queueing',
)
async def test_task_queue(
    background_tasks: BackgroundTasks,
    task_executor: TaskExecutor = Depends(task_executor_factory),
):
    """
    Enqueues a sample task to test the Arq worker setup.
    """
    await task_executor.execute('example_task', {'message': 'Hello from the API!'})
    return {'message': 'Task queued successfully'}
