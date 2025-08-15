from uuid import uuid4
import redis.asyncio as redis
from fastapi import BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.settings import get_settings
from app.schemas.health_schema import (
    HealthCheckResponse,
    WorkerHealthResponse,
    RedisHealthInfo,
)
from app.services.tasks.executor_factory import task_executor_factory


class HealthService:
    def get_health_status(self) -> HealthCheckResponse:
        settings = get_settings()

        return HealthCheckResponse(
            status='healthy',
            service=settings.APP_NAME,
            version=settings.APP_VERSION,
        )

    async def check_worker_health(
        self, db: AsyncSession, background_tasks: BackgroundTasks
    ) -> WorkerHealthResponse:
        settings = get_settings()
        errors = []
        worker_connected = False
        test_task_id = None
        queue_size = 0

        redis_info = RedisHealthInfo(connected=False)

        try:
            r = redis.Redis(
                host=settings.REDIS_HOST,
                port=settings.REDIS_PORT,
                db=settings.REDIS_DB,
                password=settings.REDIS_PASSWORD,
            )

            info = await r.info()
            redis_info = RedisHealthInfo(
                connected=True,
                version=info.get('redis_version'),
                uptime_seconds=info.get('uptime_in_seconds'),
                clients_connected=info.get('connected_clients'),
                memory_used=f"{info.get('used_memory_human', '0')}",
            )

            queue_key = 'arq:queue'
            queue_size = await r.llen(queue_key)

            try:
                executor = task_executor_factory(background_tasks)
                test_id = str(uuid4())
                await executor.execute(
                    'dispatch_webhook_event',
                    {
                        'project_id': '00000000-0000-0000-0000-000000000000',
                        'event_type_str': 'test_event',
                        'payload': {'test_id': test_id},
                    },
                )
                test_task_id = test_id
                worker_connected = True
            except Exception as e:
                errors.append(f'Failed to queue test task: {str(e)}')

            await r.close()

        except Exception as e:
            errors.append(f'Redis connection error: {str(e)}')

        status = 'healthy' if redis_info.connected and worker_connected else 'unhealthy'
        message = (
            'Worker is operational'
            if status == 'healthy'
            else 'Worker health check failed'
        )

        return WorkerHealthResponse(
            status=status,
            message=message,
            worker_connected=worker_connected,
            redis=redis_info,
            queue_size=queue_size,
            test_task_id=test_task_id,
            errors=errors if errors else None,
        )


health_service = HealthService()
