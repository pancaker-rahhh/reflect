from uuid import UUID
from typing import Dict, Any, List

from app.db import AsyncSessionLocal
from app.core.logging import get_logger

logger = get_logger(__name__)


async def send_notification(
    ctx: dict, user_id: UUID, notification_type: str, data: Dict[str, Any]
) -> Dict[str, Any]:
    logger.info(
        'task.notification.started',
        user_id=str(user_id),
        notification_type=notification_type,
    )

    try:
        async with AsyncSessionLocal():
            logger.info(
                'task.notification.processing',
                user_id=str(user_id),
                notification_type=notification_type,
                data=data,
            )

            result = {
                'sent': True,
                'notification_id': f'simulated-{user_id}-{notification_type}',
            }

        logger.info(
            'task.notification.completed',
            user_id=str(user_id),
            notification_type=notification_type,
        )

        return {'status': 'success', 'result': result}

    except Exception as e:
        logger.error(
            'task.notification.failed',
            user_id=str(user_id),
            notification_type=notification_type,
            error=str(e),
        )

        raise


async def send_bulk_notifications(
    ctx: dict, user_ids: List[UUID], notification_type: str, data: Dict[str, Any]
) -> Dict[str, Any]:
    logger.info(
        'task.bulk_notification.started',
        user_count=len(user_ids),
        notification_type=notification_type,
    )

    results = []
    failures = []

    try:
        async with AsyncSessionLocal():
            for user_id in user_ids:
                try:
                    logger.info(
                        'task.bulk_notification.processing',
                        user_id=str(user_id),
                        notification_type=notification_type,
                    )

                    results.append({'user_id': str(user_id), 'sent': True})

                except Exception as e:
                    logger.error(
                        'task.bulk_notification.individual_failed',
                        user_id=str(user_id),
                        notification_type=notification_type,
                        error=str(e),
                    )
                    failures.append({'user_id': str(user_id), 'error': str(e)})

        logger.info(
            'task.bulk_notification.completed',
            success_count=len(results),
            failure_count=len(failures),
            notification_type=notification_type,
        )

        return {
            'status': 'completed',
            'successful': len(results),
            'failed': len(failures),
            'results': results,
            'failures': failures,
        }

    except Exception as e:
        logger.error(
            'task.bulk_notification.failed',
            user_count=len(user_ids),
            notification_type=notification_type,
            error=str(e),
        )

        raise
