from fastapi import BackgroundTasks

from app.core.settings import get_settings
from app.services.tasks.base_executor import TaskExecutor
from app.services.tasks.executors.fastapi_executor import FastAPIExecutor
from app.services.tasks.executors.arq_executor import ArqExecutor
from app.core.logging import get_logger

logger = get_logger(__name__)


def task_executor_factory(
    background_tasks: BackgroundTasks,
) -> TaskExecutor:
    settings = get_settings()

    if settings.TASK_BACKEND == 'arq':
        return ArqExecutor(settings)

    if settings.TASK_BACKEND == 'celery':
        # TODO: Implement CeleryExecutor
        logger.warning(
            'celery.not_implemented', message='Falling back to FastAPI executor'
        )
        return FastAPIExecutor(background_tasks)

    logger.info('executor.initialized', executor_type='fastapi')
    return FastAPIExecutor(background_tasks)
