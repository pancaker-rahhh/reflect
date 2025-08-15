from app.core.settings import get_settings
from app.core.logging import get_logger
from app.services.tasks import (
    webhook_tasks,
    notification_tasks,
    integration_tasks,
    analytics_tasks,
)
from arq.connections import RedisSettings
import os

logger = get_logger(__name__)

# TODO: Import and register your actual task functions here.
# from app.services.tasks import email_tasks, analytics_tasks
# functions = [email_tasks.send_welcome_email, analytics_tasks.track_event]

redis_host = os.environ.get('REDIS_HOST', 'redis')
logger.info(f'Initializing ARQ worker with Redis host: {redis_host}')


class WorkerSettings:
    functions = [
        webhook_tasks.dispatch_webhook_event,
        notification_tasks.send_notification,
        notification_tasks.send_bulk_notifications,
        integration_tasks.sync_integration_data,
        integration_tasks.create_external_issue,
        analytics_tasks.calculate_project_metrics,
        analytics_tasks.generate_feedback_report,
    ]

    redis_settings = RedisSettings(
        host=redis_host,
        port=int(os.environ.get('REDIS_PORT', 6379)),
        database=int(os.environ.get('REDIS_DB', 0)),
        password=os.environ.get('REDIS_PASSWORD') or None,
    )

    keep_result = 60 * 60

    max_jobs = 10

    retry_jobs = True
    job_timeout = 60 * 5
    max_tries = 5

    retry_delay = 5

    @staticmethod
    def retry_backoff(attempt: int) -> int:
        return WorkerSettings.retry_delay * (5**attempt)

    async def on_startup(ctx):
        logger.info('Arq worker started. Connecting to Redis')
        ctx['settings'] = get_settings()

    async def on_shutdown(ctx):
        logger.info('Arq worker shutting down.')
