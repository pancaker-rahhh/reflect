from typing import Optional
from fastapi import BackgroundTasks

from app.core.settings import get_settings
from app.services.tasks.base import TaskExecutor
from app.services.tasks.executors.fastapi_executor import FastAPIExecutor
from app.core.logging import get_logger

logger = get_logger(__name__)


def get_task_executor(
    background_tasks: Optional[BackgroundTasks] = None,
) -> TaskExecutor:
    settings = get_settings()

    if settings.TASK_BACKEND == 'celery':
        # TODO: Import and return CeleryExecutor when implemented
        logger.warning(
            'celery.not_implemented', message='Falling back to FastAPI executor'
        )
        if not background_tasks:
            raise ValueError('BackgroundTasks required for FastAPI executor fallback')
        return FastAPIExecutor(background_tasks)

    elif settings.TASK_BACKEND == 'vercel':
        # TODO: Implement VercelExecutor for Vercel Functions
        logger.warning(
            'vercel.not_implemented', message='Falling back to FastAPI executor'
        )
        if not background_tasks:
            raise ValueError('BackgroundTasks required for FastAPI executor fallback')
        return FastAPIExecutor(background_tasks)

    else:
        if not background_tasks:
            raise ValueError('BackgroundTasks required for FastAPI executor')
        logger.info('executor.initialized', executor_type='fastapi')
        return FastAPIExecutor(background_tasks)
