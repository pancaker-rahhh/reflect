from typing import Dict, Any, List, Optional
from uuid import UUID
from fastapi import BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession

from app.services.tasks.executor_factory import task_executor_factory
from app.core.logging import get_logger

logger = get_logger(__name__)


class NotificationService:
    async def send_notification(
        self,
        db: AsyncSession,
        background_tasks: BackgroundTasks,
        user_id: UUID,
        notification_type: str,
        data: Dict[str, Any],
        delay_seconds: Optional[int] = None,
    ) -> Dict[str, Any]:
        try:
            executor = task_executor_factory(background_tasks)
            task_payload = {
                'user_id': user_id,
                'notification_type': notification_type,
                'data': data,
            }

            if delay_seconds:
                await executor.schedule(
                    'send_notification', task_payload, delay_seconds
                )
                logger.info(
                    'notification.scheduled',
                    user_id=str(user_id),
                    notification_type=notification_type,
                    delay_seconds=delay_seconds,
                )
                return {'status': 'scheduled', 'delay_seconds': delay_seconds}
            else:
                await executor.execute('send_notification', task_payload)
                logger.info(
                    'notification.queued',
                    user_id=str(user_id),
                    notification_type=notification_type,
                )
                return {'status': 'queued'}

        except Exception as e:
            logger.error(
                'notification.queue_failed',
                user_id=str(user_id),
                notification_type=notification_type,
                error=str(e),
            )
            raise

    async def send_bulk_notifications(
        self,
        db: AsyncSession,
        background_tasks: BackgroundTasks,
        user_ids: List[UUID],
        notification_type: str,
        data: Dict[str, Any],
        delay_seconds: Optional[int] = None,
    ) -> Dict[str, Any]:
        try:
            executor = task_executor_factory(background_tasks)
            task_payload = {
                'user_ids': user_ids,
                'notification_type': notification_type,
                'data': data,
            }

            if delay_seconds:
                await executor.schedule(
                    'send_bulk_notifications', task_payload, delay_seconds
                )
                logger.info(
                    'bulk_notification.scheduled',
                    user_count=len(user_ids),
                    notification_type=notification_type,
                    delay_seconds=delay_seconds,
                )
                return {
                    'status': 'scheduled',
                    'delay_seconds': delay_seconds,
                    'user_count': len(user_ids),
                }
            else:
                await executor.execute('send_bulk_notifications', task_payload)
                logger.info(
                    'bulk_notification.queued',
                    user_count=len(user_ids),
                    notification_type=notification_type,
                )
                return {'status': 'queued', 'user_count': len(user_ids)}

        except Exception as e:
            logger.error(
                'bulk_notification.queue_failed',
                user_count=len(user_ids),
                notification_type=notification_type,
                error=str(e),
            )
            raise


notification_service = NotificationService()
