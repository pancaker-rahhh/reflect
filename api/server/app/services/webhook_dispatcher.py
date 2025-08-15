import asyncio
from typing import Dict, Any
from uuid import UUID
from fastapi import BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.webhook_model import WebhookEventType
from app.models.feedback_model import Feedback
from app.models.roadmap_model import RoadmapFeature
from app.models.project_model import Project
from app.services.tasks.executor_factory import task_executor_factory
from app.core.logging import get_logger

logger = get_logger(__name__)


class WebhookEventDispatcher:
    async def _enqueue_webhook_event(
        self,
        project_id: UUID,
        event_type: WebhookEventType,
        payload: Dict[str, Any],
    ):
        try:
            executor = task_executor_factory(BackgroundTasks())

            asyncio.create_task(
                self._execute_webhook_task(executor, project_id, event_type, payload)
            )

            logger.info(
                'webhook.event.queued',
                event_type=event_type.value,
                project_id=str(project_id),
            )
        except Exception as e:
            logger.error(
                'webhook.event.queue_failed',
                event_type=event_type.value,
                project_id=str(project_id),
                error=str(e),
            )

    async def _execute_webhook_task(
        self,
        executor,
        project_id: UUID,
        event_type: WebhookEventType,
        payload: Dict[str, Any],
    ):
        try:
            await executor.execute(
                'dispatch_webhook_event',
                {
                    'project_id': project_id,
                    'event_type_str': event_type.value,
                    'payload': payload,
                },
            )
        except Exception as e:
            logger.error(
                'webhook.execute.failed',
                event_type=event_type.value,
                project_id=str(project_id),
                error=str(e),
            )

    async def dispatch_feedback_created(
        self, db: AsyncSession, feedback: Feedback
    ) -> None:
        payload = {
            'feedback': {
                'id': str(feedback.id),
                'type': feedback.feedback_type.value,
                'title': feedback.title,
                'message': feedback.message,
                'rating': feedback.rating,
                'status': feedback.status.value,
                'priority': feedback.priority.value if feedback.priority else None,
                'submitter_name': feedback.submitter_name,
                'submitter_email': feedback.submitter_email,
                'is_anonymous': feedback.is_anonymous,
                'created_at': feedback.created_at.isoformat()
                if feedback.created_at
                else None,
            },
            'project': {'id': str(feedback.project_id)},
            'widget': {'id': str(feedback.widget_id)},
        }
        await self._enqueue_webhook_event(
            feedback.project_id, WebhookEventType.FEEDBACK_CREATED, payload
        )

    async def dispatch_feedback_updated(
        self, db: AsyncSession, feedback: Feedback, updated_fields: Dict[str, Any]
    ) -> None:
        payload = {
            'feedback': {
                'id': str(feedback.id),
                'type': feedback.feedback_type.value,
                'title': feedback.title,
                'message': feedback.message,
                'status': feedback.status.value,
                'priority': feedback.priority.value if feedback.priority else None,
                'updated_at': feedback.updated_at.isoformat()
                if feedback.updated_at
                else None,
            },
            'changes': updated_fields,
            'project': {'id': str(feedback.project_id)},
        }
        await self._enqueue_webhook_event(
            feedback.project_id, WebhookEventType.FEEDBACK_UPDATED, payload
        )

    async def dispatch_feature_created(
        self, db: AsyncSession, feature: RoadmapFeature
    ) -> None:
        payload = {
            'feature': {
                'id': str(feature.id),
                'title': feature.title,
                'description': feature.description,
                'status': feature.status.value if feature.status else None,
                'priority': feature.priority.value if feature.priority else None,
                'effort_estimate': feature.effort_estimate,
                'created_at': feature.created_at.isoformat()
                if feature.created_at
                else None,
            },
            'roadmap': {'id': str(feature.roadmap_id)},
            'column': {'id': str(feature.column_id) if feature.column_id else None},
        }
        from app.repositories.roadmap_repository import roadmap_repository

        roadmap = await roadmap_repository.get(db, feature.roadmap_id)
        if roadmap:
            await self._enqueue_webhook_event(
                roadmap.project_id, WebhookEventType.FEATURE_CREATED, payload
            )
        else:
            logger.error(
                f'Roadmap {feature.roadmap_id} not found for feature {feature.id}'
            )

    async def dispatch_feature_updated(
        self, db: AsyncSession, feature: RoadmapFeature, updated_fields: Dict[str, Any]
    ) -> None:
        payload = {
            'feature': {
                'id': str(feature.id),
                'title': feature.title,
                'description': feature.description,
                'status': feature.status.value if feature.status else None,
                'priority': feature.priority.value if feature.priority else None,
                'effort_estimate': feature.effort_estimate,
                'updated_at': feature.updated_at.isoformat()
                if feature.updated_at
                else None,
            },
            'changes': updated_fields,
            'roadmap': {'id': str(feature.roadmap_id)},
            'column': {'id': str(feature.column_id) if feature.column_id else None},
        }
        from app.repositories.roadmap_repository import roadmap_repository

        roadmap = await roadmap_repository.get(db, feature.roadmap_id)
        if roadmap:
            await self._enqueue_webhook_event(
                roadmap.project_id, WebhookEventType.FEATURE_UPDATED, payload
            )
        else:
            logger.error(
                f'Roadmap {feature.roadmap_id} not found for feature {feature.id}'
            )

    async def dispatch_project_updated(
        self, db: AsyncSession, project: Project, updated_fields: Dict[str, Any]
    ) -> None:
        payload = {
            'project': {
                'id': str(project.id),
                'name': project.name,
                'description': project.description,
                'is_active': project.is_active,
                'updated_at': project.updated_at.isoformat()
                if project.updated_at
                else None,
            },
            'changes': updated_fields,
            'organization': {'id': str(project.organization_id)},
        }
        await self._enqueue_webhook_event(
            project.id, WebhookEventType.PROJECT_UPDATED, payload
        )


webhook_dispatcher = WebhookEventDispatcher()
