from typing import Dict, Any, Optional
from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.webhook_model import WebhookEventType
from app.models.feedback_model import Feedback
from app.models.roadmap_model import RoadmapActionItem
from app.models.project_model import Project
from app.services.webhook_service import webhook_service
from app.core.logging import get_logger

logger = get_logger(__name__)


class WebhookEventDispatcher:
    """Centralized webhook event dispatcher for the application"""

    async def dispatch_feedback_created(
        self, db: AsyncSession, feedback: Feedback
    ) -> Optional[Dict[str, Any]]:
        """Dispatch webhook for new feedback creation"""

        feedback_data = {
            'id': str(feedback.id),
            'widget_id': str(feedback.widget_id),
            'project_id': str(feedback.project_id),
            'feedback_type': feedback.feedback_type.value,
            'title': feedback.title,
            'message': feedback.message,
            'rating': feedback.rating,
            'submitter_name': feedback.submitter_name,
            'submitter_email': feedback.submitter_email,
            'is_anonymous': feedback.is_anonymous,
            'created_at': feedback.created_at.isoformat(),
            'updated_at': feedback.updated_at.isoformat(),
        }

        payload = {
            'feedback': feedback_data,
            'project': {
                'id': str(feedback.project_id),
            },
            'widget': {
                'id': str(feedback.widget_id),
            },
        }

        try:
            results = await webhook_service.trigger_webhooks(
                db,
                UUID(str(feedback.project_id)),
                WebhookEventType.FEEDBACK_CREATED,
                payload,
            )
            logger.info(
                f'Dispatched feedback.created webhooks for feedback {feedback.id}: {len(results)} webhooks triggered'
            )
            return {'event': 'feedback.created', 'results': results}
        except Exception as e:
            logger.error(
                f'Failed to dispatch feedback.created webhooks for feedback {feedback.id}: {str(e)}'
            )
            return None

    async def dispatch_feedback_updated(
        self, db: AsyncSession, feedback: Feedback, updated_fields: Dict[str, Any]
    ) -> Optional[Dict[str, Any]]:
        """Dispatch webhook for feedback updates"""

        payload = {
            'feedback': {
                'id': str(feedback.id),
                'type': feedback.feedback_type.value,
                'title': feedback.title,
                'message': feedback.message,
                'updated_at': feedback.updated_at.isoformat()
                if feedback.updated_at
                else None,
            },
            'changes': updated_fields,
            'project': {
                'id': str(feedback.project_id),
            },
        }

        try:
            results = await webhook_service.trigger_webhooks(
                db,
                UUID(str(feedback.project_id)),
                WebhookEventType.FEEDBACK_UPDATED,
                payload,
            )
            logger.info(
                f'Dispatched feedback.updated webhooks for feedback {feedback.id}: {len(results)} webhooks triggered'
            )
            return {'event': 'feedback.updated', 'results': results}
        except Exception as e:
            logger.error(
                f'Failed to dispatch feedback.updated webhooks for feedback {feedback.id}: {str(e)}'
            )
            return None

    async def dispatch_feature_created(
        self, db: AsyncSession, feature: RoadmapActionItem
    ) -> Optional[Dict[str, Any]]:
        """Dispatch webhook for new roadmap feature creation"""

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
            'roadmap': {
                'id': str(feature.roadmap_id),
            },
            'column': {
                'id': str(feature.column_id) if feature.column_id else None,
            },
        }

        try:
            from app.repositories.roadmap_repository import roadmap_repository

            roadmap = await roadmap_repository.get(db, feature.roadmap_id)
            if not roadmap:
                logger.error(
                    f'Roadmap {feature.roadmap_id} not found for feature {feature.id}'
                )
                return None

            results = await webhook_service.trigger_webhooks(
                db, roadmap.project_id, WebhookEventType.FEATURE_CREATED, payload
            )
            logger.info(
                f'Dispatched feature.created webhooks for feature {feature.id}: {len(results)} webhooks triggered'
            )
            return {'event': 'feature.created', 'results': results}
        except Exception as e:
            logger.error(
                f'Failed to dispatch feature.created webhooks for feature {feature.id}: {str(e)}'
            )
            return None

    async def dispatch_feature_updated(
        self,
        db: AsyncSession,
        feature: RoadmapActionItem,
        updated_fields: Dict[str, Any],
    ) -> Optional[Dict[str, Any]]:
        """Dispatch webhook for roadmap feature updates"""

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
            'roadmap': {
                'id': str(feature.roadmap_id),
            },
            'column': {
                'id': str(feature.column_id) if feature.column_id else None,
            },
        }

        try:
            from app.repositories.roadmap_repository import roadmap_repository

            roadmap = await roadmap_repository.get(db, feature.roadmap_id)
            if not roadmap:
                logger.error(
                    f'Roadmap {feature.roadmap_id} not found for feature {feature.id}'
                )
                return None

            results = await webhook_service.trigger_webhooks(
                db, roadmap.project_id, WebhookEventType.FEATURE_UPDATED, payload
            )
            logger.info(
                f'Dispatched feature.updated webhooks for feature {feature.id}: {len(results)} webhooks triggered'
            )
            return {'event': 'feature.updated', 'results': results}
        except Exception as e:
            logger.error(
                f'Failed to dispatch feature.updated webhooks for feature {feature.id}: {str(e)}'
            )
            return None

    async def dispatch_project_updated(
        self, db: AsyncSession, project: Project, updated_fields: Dict[str, Any]
    ) -> Optional[Dict[str, Any]]:
        """Dispatch webhook for project updates"""

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
            'organization': {
                'id': str(project.organization_id),
            },
        }

        try:
            results = await webhook_service.trigger_webhooks(
                db, project.id, WebhookEventType.PROJECT_UPDATED, payload
            )
            logger.info(
                f'Dispatched project.updated webhooks for project {project.id}: {len(results)} webhooks triggered'
            )
            return {'event': 'project.updated', 'results': results}
        except Exception as e:
            logger.error(
                f'Failed to dispatch project.updated webhooks for project {project.id}: {str(e)}'
            )
            return None


webhook_dispatcher = WebhookEventDispatcher()
