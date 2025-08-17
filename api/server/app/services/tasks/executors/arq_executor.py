from typing import Any, Dict, Callable
from arq import create_pool
from arq.connections import ArqRedis, RedisSettings

from app.services.tasks.base_executor import TaskExecutor, TaskPriority
from app.core.logging import get_logger
from app.core.settings import Settings

logger = get_logger(__name__)


class ArqExecutor(TaskExecutor):
    def __init__(self, settings: Settings):
        self.settings = settings
        self.redis_pool: ArqRedis = None
        self.registered_tasks: Dict[str, Callable] = {}
        logger.info('executor.initialized', executor_type='arq')

    async def _get_redis_pool(self) -> ArqRedis:
        if not self.redis_pool:
            redis_settings = RedisSettings(
                host=self.settings.REDIS_HOST,
                port=self.settings.REDIS_PORT,
                database=self.settings.REDIS_DB,
                password=self.settings.REDIS_PASSWORD,
            )
            self.redis_pool = await create_pool(redis_settings)
        return self.redis_pool

    def register_task(self, task_name: str, task_function: Callable):
        self.registered_tasks[task_name] = task_function
        logger.debug('task.registered', task_name=task_name)

    async def execute(
        self,
        task_name: str,
        payload: Dict[str, Any],
        priority: TaskPriority = TaskPriority.MEDIUM,
    ) -> None:
        redis = await self._get_redis_pool()
        await redis.enqueue_job(task_name, **payload)
        logger.info(
            'task.queued',
            task_name=task_name,
            priority=priority.value,
            executor='arq',
        )

    async def schedule(
        self,
        task_name: str,
        payload: Dict[str, Any],
        delay_seconds: int,
        priority: TaskPriority = TaskPriority.MEDIUM,
    ) -> None:
        redis = await self._get_redis_pool()
        await redis.enqueue_job(task_name, _defer_by=delay_seconds, **payload)
        logger.info(
            'task.scheduled',
            task_name=task_name,
            delay_seconds=delay_seconds,
            priority=priority.value,
            executor='arq',
        )
