from uuid import UUID
from typing import Dict, Any

from app.db import AsyncSessionLocal
from app.services.webhook_service import webhook_service
from app.models.webhook_model import WebhookEventType
from app.core.logging import get_logger

logger = get_logger(__name__)


async def dispatch_webhook_event(
    ctx: dict, project_id: UUID, event_type_str: str, payload: Dict[str, Any]
) -> Dict[str, Any]:
    logger.info(
        'task.webhook_dispatch.started',
        project_id=str(project_id),
        event_type=event_type_str,
    )
    try:
        event_type = WebhookEventType(event_type_str)
        async with AsyncSessionLocal() as db:
            results = await webhook_service.trigger_webhooks(
                db, project_id, event_type, payload
            )

        logger.info(
            'task.webhook_dispatch.completed',
            project_id=str(project_id),
            event_type=event_type_str,
            results_count=len(results),
        )
        return {'status': 'success', 'results': results}
    except ValueError:
        logger.error(
            'task.webhook_dispatch.failed',
            project_id=str(project_id),
            event_type=event_type_str,
            error='Invalid event type provided.',
        )
        return {'status': 'error', 'message': 'Invalid event type'}
    except ValueError as e:
        logger.error(
            'task.webhook_dispatch.failed',
            project_id=str(project_id),
            event_type=event_type_str,
            error=str(e),
            error_type='validation_error',
            retry=False,
        )

        return {'status': 'error', 'message': str(e), 'retry': False}

    except ConnectionError as e:
        logger.error(
            'task.webhook_dispatch.failed',
            project_id=str(project_id),
            event_type=event_type_str,
            error=str(e),
            error_type='connection_error',
            retry=True,
        )

        raise

    except Exception as e:
        logger.error(
            'task.webhook_dispatch.failed',
            project_id=str(project_id),
            event_type=event_type_str,
            error=str(e),
            error_type='unexpected_error',
            retry=True,
        )

        raise
