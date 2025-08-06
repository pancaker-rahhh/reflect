from typing import Any, Dict, Callable
from fastapi import BackgroundTasks

from app.services.tasks.base import TaskExecutor, TaskPriority
from app.core.logging import get_logger

logger = get_logger(__name__)


class FastAPIExecutor(TaskExecutor):
    def __init__(self, background_tasks: BackgroundTasks):
        self.background_tasks = background_tasks
        self.registered_tasks: Dict[str, Callable] = {}
        self._register_default_tasks()

    def _register_default_tasks(self):
        # TODO: Create email task handlers in app.services.tasks.email
        # TODO: Create analytics task handlers in app.services.tasks.analytics
        pass

    def register_task(self, task_name: str, task_function: Callable):
        self.registered_tasks[task_name] = task_function
        logger.debug('task.registered', task_name=task_name)

    async def execute(
        self,
        task_name: str,
        payload: Dict[str, Any],
        priority: TaskPriority = TaskPriority.MEDIUM,
    ) -> None:
        task_func = self.registered_tasks.get(task_name)
        if not task_func:
            logger.error('task.not_found', task_name=task_name)
            raise ValueError(f"Task '{task_name}' not registered")

        logger.info('task.queued', task_name=task_name, priority=priority.value)
        self.background_tasks.add_task(
            self._execute_with_logging, task_name, task_func, payload
        )

    async def schedule(
        self,
        task_name: str,
        payload: Dict[str, Any],
        delay_seconds: int,
        priority: TaskPriority = TaskPriority.MEDIUM,
    ) -> None:
        logger.warning(
            'task.schedule_not_supported',
            task_name=task_name,
            message="FastAPI executor doesn't support scheduling, executing immediately",
        )
        await self.execute(task_name, payload, priority)

    async def _execute_with_logging(
        self, task_name: str, task_func: Callable, payload: Dict[str, Any]
    ):
        try:
            logger.info('task.started', task_name=task_name)
            await task_func(**payload)
            logger.info('task.completed', task_name=task_name)
        except Exception as e:
            logger.error(
                'task.failed',
                task_name=task_name,
                error=str(e),
                error_type=type(e).__name__,
            )
            raise
