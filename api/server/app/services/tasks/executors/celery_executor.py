from typing import Any, Dict, Callable

from app.services.tasks.base import TaskExecutor, TaskPriority
from app.core.logging import get_logger

logger = get_logger(__name__)


class CeleryExecutor(TaskExecutor):
    def __init__(self):
        self.registered_tasks: Dict[str, Callable] = {}
        logger.info('executor.initialized', executor_type='celery')

    def register_task(self, task_name: str, task_function: Callable):
        self.registered_tasks[task_name] = task_function
        logger.debug('task.registered', task_name=task_name)

    async def execute(
        self,
        task_name: str,
        payload: Dict[str, Any],
        priority: TaskPriority = TaskPriority.MEDIUM,
    ) -> None:
        # TODO: Implement Celery integration when ready for scale
        logger.error(
            'celery.not_implemented', message='CeleryExecutor not yet implemented'
        )
        raise NotImplementedError('CeleryExecutor will be implemented in Phase 3')

    async def schedule(
        self,
        task_name: str,
        payload: Dict[str, Any],
        delay_seconds: int,
        priority: TaskPriority = TaskPriority.MEDIUM,
    ) -> None:
        # TODO: Implement Celery scheduling when ready for scale
        logger.error(
            'celery.not_implemented',
            message='CeleryExecutor scheduling not yet implemented',
        )
        raise NotImplementedError('CeleryExecutor will be implemented in Phase 3')
