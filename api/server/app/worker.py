from app.core.settings import get_settings
from app.core.logging import get_logger

logger = get_logger(__name__)


# This is a placeholder task. In a real application, you would
# import and register your actual task functions here.
async def example_task(ctx, *args, **kwargs):
    logger.info(f'Executing example_task with args: {args}, kwargs: {kwargs}')
    return 'Task completed'


class WorkerSettings:
    """
    Defines the settings for the Arq worker.
    This class is discovered by the `arq` CLI.
    """

    # List of functions that the worker can execute.
    functions = [example_task]

    # Runs when the worker starts.
    async def on_startup(self, ctx):
        logger.info('Arq worker started.')
        ctx['settings'] = get_settings()

    # Runs when the worker shuts down.
    async def on_shutdown(self, ctx):
        logger.info('Arq worker shutting down.')


# Redis settings for the worker.
settings = get_settings()
redis_settings = {
    'host': settings.REDIS_HOST,
    'port': settings.REDIS_PORT,
    'database': settings.REDIS_DB,
    'password': settings.REDIS_PASSWORD,
}
