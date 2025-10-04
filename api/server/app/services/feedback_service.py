from __future__ import annotations
from typing import List, Optional, Dict, Any
from uuid import UUID
from datetime import datetime
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException, status
from app.core.subscription_plans import PLAN_LIMITS
from app.repositories.feedback_repository import feedback_repository
from app.repositories.feedback_comment_repository import feedback_comment_repository
from app.services.action_item_service import action_item_service
from app.services.usage_tracking_service import usage_tracking_service
from app.services.project_service import project_service
from app.core.logging import get_logger
from app.core.exceptions import (
    NotFoundError,
    ValidationError,
    SubscriptionLimitExceededError,
)

from app.schemas.feedback_schema import (
    FeedbackUpdate,
    FeedbackCreatePayload,
    FeedbackResponsePayload,
    GeneralFeedbackCreate,
    ReviewFeedbackCreate,
    BugReportFeedbackCreate,
    FeatureRequestFeedbackCreate,
    NPSFeedbackCreate,
    CSATFeedbackCreate,
    CESFeedbackCreate,
    GeneralFeedbackResponse,
    SurveyFeedbackResponse,
    ReviewFeedbackResponse,
    BugReportFeedbackResponse,
    FeatureRequestFeedbackResponse,
    NPSFeedbackResponse,
    CSATFeedbackResponse,
    CESFeedbackResponse,
)
from app.models.feedback_model import (
    Feedback,
    GeneralFeedback,
    SurveyFeedback,
    ReviewFeedback,
    BugReportFeedback,
    FeatureRequestFeedback,
    NPSFeedback,
    CSATFeedback,
    CESFeedback,
    FeedbackType,
    FeedbackPriority,
    FeedbackComment,
)
from app.models.widget_model import WidgetType
from app.utils.feedback_formatter import FeedbackFormatter

logger = get_logger(__name__)


class FeedbackService:
    async def create_feedback(
        self, db: AsyncSession, payload: FeedbackCreatePayload
    ) -> FeedbackResponsePayload:
        obj = await feedback_repository.create_polymorphic(db, **payload.model_dump())

        # Dispatch webhook for new feedback
        try:
            from app.services.webhook_dispatcher import webhook_dispatcher

            await webhook_dispatcher.dispatch_feedback_created(db, obj)
        except Exception as e:
            logger.warning(
                f'Failed to dispatch feedback.created webhook for feedback {obj.id}: {str(e)}'
            )

        return self._convert_to_response(obj)

    async def create_feedback_from_widget(
        self,
        db: AsyncSession,
        widget_id: UUID,
        project_id: UUID,
        widget_type: WidgetType,
        data: Dict[str, Any],
        context: Dict[str, Any] = None,
    ) -> FeedbackResponsePayload:
        """
        Create feedback based on widget type and provided data.
        This method automatically determines the appropriate feedback type and creates the correct payload.
        """
        context = context or {}

        project = await project_service.get_project_by_id(db, project_id)
        if not project:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail='Project not found'
            )

        resource_type = self._get_resource_type_from_widget_type(widget_type)
        organization = await usage_tracking_service.get_organization_subscription(
            db, project.organization_id
        )
        if not organization:
            limits = PLAN_LIMITS['free']
        else:
            plan = organization.subscription_plan or 'free'
            limits = PLAN_LIMITS.get(plan, PLAN_LIMITS['free'])

        limit = limits.get(resource_type, 0)
        can_create = (
            limit >= 999
            or await usage_tracking_service.get_current_usage(
                db, project.organization_id, resource_type
            )
            < limit
        )

        if not can_create:
            current_usage = await usage_tracking_service.get_current_usage(
                db, project.organization_id, resource_type
            )
            raise SubscriptionLimitExceededError(
                resource_type='responses',
                current_usage=current_usage,
                limit=limits.get(resource_type, 0),
                message='Upgrade to Pro plan for unlimited responses',
            )

        # Base feedback data
        base_data = {
            'widget_id': widget_id,
            'project_id': project_id,
            'is_anonymous': True,
            'context': context,
            'feedback_metadata': {
                'widget_type': widget_type.value,
                'submission_method': 'widget',
            },
        }

        # Create appropriate feedback based on widget type
        if widget_type == WidgetType.REVIEW:
            payload = self._create_review_feedback(base_data, data)
        elif widget_type == WidgetType.BUG_REPORT:
            payload = self._create_bug_report_feedback(base_data, data)
        elif widget_type == WidgetType.FEATURE_REQUEST:
            payload = self._create_feature_request_feedback(base_data, data)
        elif widget_type == WidgetType.NPS:
            payload = self._create_nps_feedback(base_data, data)
        elif widget_type == WidgetType.CSAT:
            payload = self._create_csat_feedback(base_data, data)
        elif widget_type == WidgetType.CES:
            payload = self._create_ces_feedback(base_data, data)
        else:
            # Default to general feedback
            payload = self._create_general_feedback(base_data, data)

        result = await self.create_feedback(db, payload)

        await usage_tracking_service.increment_usage(
            db, project.organization_id, resource_type
        )

        return result

    def _get_resource_type_from_widget_type(self, widget_type: WidgetType) -> str:
        """Map widget type to subscription resource type"""
        # All feedback types now count towards the unified 'responses' limit
        return 'responses'

    def _create_review_feedback(
        self, base_data: Dict[str, Any], data: Dict[str, Any]
    ) -> ReviewFeedbackCreate:
        """Create review feedback with 5-star rating system"""
        logger.info(f'🔍 _create_review_feedback - data: {data}')
        logger.info(
            f'🔍 _create_review_feedback - rating from data: {data.get("rating")}'
        )
        rating_value = data.get('rating')

        # Get message from various possible fields
        response_text = (
            data.get('response') or data.get('message') or data.get('comment') or ''
        )

        # Strip "Rating: X" or "Rating: X/Y" prefix if present (from old widget versions)
        import re

        cleaned_message = re.sub(
            r'^Rating:\s*\d+(/\d+)?\s*-?\s*',
            '',
            response_text.strip(),
            flags=re.IGNORECASE,
        )

        # Determine title: use cleaned message if provided, otherwise show rating
        if cleaned_message:
            title = cleaned_message[:50]  # First 50 chars as title
        else:
            title = f'Rating: {rating_value}/5'

        return ReviewFeedbackCreate(
            **base_data,
            feedback_type=FeedbackType.REVIEW,
            rating=rating_value,  # Set base rating field
            overall_rating=rating_value,  # Set overall_rating field for review-specific data
            title=title,
            message=cleaned_message if cleaned_message else None,
        )

    def _create_bug_report_feedback(
        self, base_data: Dict[str, Any], data: Dict[str, Any]
    ) -> BugReportFeedbackCreate:
        """Create bug report feedback with detailed fields"""
        # Convert severity string to FeedbackPriority enum
        severity_str = data.get('severity', 'medium').lower()
        try:
            severity_level = FeedbackPriority(severity_str)
        except ValueError:
            # Default to medium if invalid severity provided
            severity_level = FeedbackPriority.MEDIUM

        user_description = data.get('message', '') or data.get('description', '')
        title_value = data.get('title', '')

        return BugReportFeedbackCreate(
            **base_data,
            feedback_type=FeedbackType.BUG_REPORT,
            title=title_value or 'Bug Report',
            message=user_description,
            severity_level=severity_level,
        )

    def _create_feature_request_feedback(
        self, base_data: Dict[str, Any], data: Dict[str, Any]
    ) -> FeatureRequestFeedbackCreate:
        """Create feature request feedback"""
        user_description = data.get('message', '') or data.get('description', '')
        return FeatureRequestFeedbackCreate(
            **base_data,
            feedback_type=FeedbackType.FEATURE_REQUEST,
            title=data.get('title') or 'Feature Request',
            message=user_description,
        )

    def _create_nps_feedback(
        self, base_data: Dict[str, Any], data: Dict[str, Any]
    ) -> NPSFeedbackCreate:
        """Create NPS feedback with 0-10 scale"""
        nps_score = data.get('rating', 0)  # Use rating field from frontend
        if not isinstance(nps_score, int) or nps_score < 0 or nps_score > 10:
            raise ValidationError('NPS score must be an integer between 0 and 10')

        # Determine promoter category
        if nps_score >= 9:
            promoter_category = 'promoter'
        elif nps_score >= 7:
            promoter_category = 'passive'
        else:
            promoter_category = 'detractor'

        # Get message from various possible fields
        response_text = (
            data.get('response') or data.get('message') or data.get('comment') or ''
        )

        # Strip "Rating: X" or "Rating: X/Y" prefix if present (from old widget versions)
        import re

        cleaned_message = re.sub(
            r'^Rating:\s*\d+(/\d+)?\s*-?\s*',
            '',
            response_text.strip(),
            flags=re.IGNORECASE,
        )

        # Determine title: use cleaned message if provided, otherwise show rating
        if cleaned_message:
            title = cleaned_message[:50]  # First 50 chars as title
        else:
            title = f'NPS: {nps_score}/10'

        return NPSFeedbackCreate(
            **base_data,
            feedback_type=FeedbackType.NPS,
            rating=nps_score,  # Set base rating field
            nps_score=nps_score,
            promoter_category=promoter_category,
            title=title,
            message=cleaned_message if cleaned_message else None,
        )

    def _create_csat_feedback(
        self, base_data: Dict[str, Any], data: Dict[str, Any]
    ) -> CSATFeedbackCreate:
        """Create CSAT feedback with 1-5 scale"""
        csat_score = data.get('rating', 1)  # Use rating field from frontend
        if not isinstance(csat_score, int) or csat_score < 1 or csat_score > 5:
            raise ValidationError('CSAT score must be an integer between 1 and 5')

        # Determine satisfaction level
        satisfaction_levels = {
            1: 'very_dissatisfied',
            2: 'dissatisfied',
            3: 'neutral',
            4: 'satisfied',
            5: 'very_satisfied',
        }

        # Get message from various possible fields
        response_text = (
            data.get('response') or data.get('message') or data.get('comment') or ''
        )

        # Strip "Rating: X" or "Rating: X/Y" prefix if present (from old widget versions)
        import re

        cleaned_message = re.sub(
            r'^Rating:\s*\d+(/\d+)?\s*-?\s*',
            '',
            response_text.strip(),
            flags=re.IGNORECASE,
        )

        # Determine title: use cleaned message if provided, otherwise show rating
        if cleaned_message:
            title = cleaned_message[:50]  # First 50 chars as title
        else:
            title = f'CSAT: {csat_score}/5'

        return CSATFeedbackCreate(
            **base_data,
            feedback_type=FeedbackType.CSAT,
            rating=csat_score,  # Set base rating field
            csat_score=csat_score,
            satisfaction_level=satisfaction_levels.get(csat_score, 'neutral'),
            title=title,
            message=cleaned_message if cleaned_message else None,
        )

    def _create_ces_feedback(
        self, base_data: Dict[str, Any], data: Dict[str, Any]
    ) -> CESFeedbackCreate:
        """Create CES feedback with 1-5 scale"""
        ces_score = data.get('rating', 1)  # Use rating field from frontend
        if not isinstance(ces_score, int) or ces_score < 1 or ces_score > 5:
            raise ValidationError('CES score must be an integer between 1 and 5')

        # Determine ease level
        ease_levels = {
            1: 'very_difficult',
            2: 'difficult',
            3: 'neutral',
            4: 'easy',
            5: 'very_easy',
        }

        # Get message from various possible fields
        response_text = (
            data.get('response') or data.get('message') or data.get('comment') or ''
        )

        # Strip "Rating: X" or "Rating: X/Y" prefix if present (from old widget versions)
        import re

        cleaned_message = re.sub(
            r'^Rating:\s*\d+(/\d+)?\s*-?\s*',
            '',
            response_text.strip(),
            flags=re.IGNORECASE,
        )

        # Determine title: use cleaned message if provided, otherwise show rating
        if cleaned_message:
            title = cleaned_message[:50]  # First 50 chars as title
        else:
            title = f'CES: {ces_score}/5'

        return CESFeedbackCreate(
            **base_data,
            feedback_type=FeedbackType.CES,
            rating=ces_score,  # Set base rating field
            ces_score=ces_score,
            ease_level=ease_levels.get(ces_score, 'neutral'),
            title=title,
            message=cleaned_message if cleaned_message else None,
        )

    def _create_general_feedback(
        self, base_data: Dict[str, Any], data: Dict[str, Any]
    ) -> GeneralFeedbackCreate:
        user_message = data.get('message', '')
        title = user_message

        return GeneralFeedbackCreate(
            **base_data,
            feedback_type=FeedbackType.GENERAL,
            title=title,
            message=user_message,
            rating=data.get('rating'),
        )

    async def get_feedback(
        self, db: AsyncSession, feedback_id: UUID
    ) -> Optional[FeedbackResponsePayload]:
        obj = await feedback_repository.get(db, feedback_id)
        return self._convert_to_response(obj) if obj else None

    async def list_feedback(
        self,
        db: AsyncSession,
        user_id: UUID,
        project_id: Optional[UUID] = None,
        widget_id: Optional[UUID] = None,
        skip: int = 0,
        limit: int = 100,
    ) -> List[FeedbackResponsePayload]:
        from app.services.permission_service import permission_service

        logger.info(
            f'🔍 list_feedback called: user_id={user_id}, project_id={project_id}, widget_id={widget_id}'
        )

        if project_id:
            role = await permission_service.get_user_role_in_project(
                user_id, project_id, db
            )
            logger.info(f'🔐 User {user_id} role in project {project_id}: {role}')
            if not role:
                logger.warning(
                    f'❌ User {user_id} has NO access to project {project_id}'
                )
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail='You do not have access to this project',
                )

        if widget_id:
            objs = await feedback_repository.get_by_widget(db, widget_id, skip, limit)
            if objs and project_id:
                objs = [o for o in objs if o.project_id == project_id]
        elif project_id:
            objs = await feedback_repository.get_by_project(db, project_id, skip, limit)
        else:
            accessible_projects = await permission_service.get_accessible_projects(
                user_id, None, db
            )
            project_ids = [p.id for p in accessible_projects]
            logger.info(f'📋 User {user_id} has access to projects: {project_ids}')
            objs = await feedback_repository.get_multi(db, skip=skip, limit=limit)
            objs = [o for o in objs if o.project_id in project_ids]

        logger.info(f'✅ Returning {len(objs)} feedback items for user {user_id}')
        return [self._convert_to_response(o) for o in objs]

    async def update_feedback(
        self, db: AsyncSession, feedback_id: UUID, payload: FeedbackUpdate
    ) -> Optional[FeedbackResponsePayload]:
        updated_fields = payload.model_dump(exclude_none=True)
        obj = await feedback_repository.update_polymorphic(
            db, feedback_id, **updated_fields
        )

        if obj:
            # Dispatch webhook for updated feedback
            try:
                from app.services.webhook_dispatcher import webhook_dispatcher

                await webhook_dispatcher.dispatch_feedback_updated(
                    db, obj, updated_fields
                )
            except Exception as e:
                logger.warning(
                    f'Failed to dispatch feedback.updated webhook for feedback {obj.id}: {str(e)}'
                )

        return self._convert_to_response(obj) if obj else None

    async def delete_feedback(self, db: AsyncSession, feedback_id: UUID) -> bool:
        return await feedback_repository.delete_polymorphic(db, feedback_id)

    async def add_comment(
        self, db: AsyncSession, feedback_id: UUID, user_id: UUID, comment_text: str
    ) -> FeedbackComment:
        feedback = await feedback_repository.get(db, feedback_id)
        if not feedback:
            raise NotFoundError('Feedback not found')

        return await feedback_comment_repository.create_comment(
            db, feedback_id, user_id, comment_text
        )

    async def get_comments(
        self, db: AsyncSession, feedback_id: UUID, skip: int = 0, limit: int = 100
    ) -> List[FeedbackComment]:
        return await feedback_comment_repository.get_by_feedback(
            db, feedback_id, skip, limit
        )

    async def upvote_feedback(self, db: AsyncSession, feedback_id: UUID) -> bool:
        """
        Simple upvote - increments the feedback_votes counter.

        Args:
            db: Database session
            feedback_id: ID of the feedback to upvote

        Returns:
            bool: True if upvote was successful

        Raises:
            NotFoundError: If feedback not found
            ValidationError: If feedback cannot be upvoted (archived/rejected)
        """
        feedback = await feedback_repository.get(db, feedback_id)
        if not feedback:
            raise NotFoundError('Feedback not found')

        # Validate feedback is not deleted (soft delete check)
        if feedback.deleted_at is not None:
            raise ValidationError('Cannot upvote deleted feedback')

        # Use atomic increment to prevent race conditions
        feedback.feedback_votes += 1
        await db.commit()
        await db.refresh(feedback)

        return True

    async def get_actionable_feedback(
        self,
        db: AsyncSession,
        user_id: UUID,
        project_id: UUID,
        skip: int = 0,
        limit: int = 100,
    ) -> List[FeedbackResponsePayload]:
        from app.services.permission_service import permission_service

        role = await permission_service.get_user_role_in_project(
            user_id, project_id, db
        )
        if not role:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail='You do not have access to this project',
            )

        actionable_feedback = await action_item_service.get_actionable_feedback(
            db, project_id, skip, limit
        )
        return [self._convert_to_response(f) for f in actionable_feedback]

    async def mark_feedback_converted(
        self,
        db: AsyncSession,
        feedback_id: UUID,
        roadmap_item_id: UUID,
        conversion_notes: Optional[str] = None,
    ) -> FeedbackResponsePayload:
        feedback = await feedback_repository.get(db, id=feedback_id)
        if not feedback:
            raise NotFoundError(f'Feedback {feedback_id} not found')

        update_data = {
            'converted_to_action_item_id ': roadmap_item_id,
            'conversion_date': datetime.utcnow(),
            'conversion_notes': conversion_notes,
        }

        updated_feedback = await feedback_repository.update_polymorphic(
            db, feedback_id, **update_data
        )
        return self._convert_to_response(updated_feedback)

    async def get_feedback_conversion_status(
        self, db: AsyncSession, feedback_id: UUID
    ) -> Dict[str, Any]:
        feedback = await feedback_repository.get(db, id=feedback_id)
        if not feedback:
            raise NotFoundError(f'Feedback {feedback_id} not found')

        return {
            'is_converted': bool(feedback.converted_to_action_item_id),
            'converted_to_action_item_id ': feedback.converted_to_action_item_id,
            'conversion_date': feedback.conversion_date,
            'conversion_notes': feedback.conversion_notes,
            'is_actionable': feedback.is_actionable,
        }

    async def update_feedback_from_widget(
        self,
        db: AsyncSession,
        feedback_id: UUID,
        data: Dict[str, Any],
        context: Dict[str, Any] = None,
    ) -> FeedbackResponsePayload:
        """
        Update existing feedback from widget submission.
        This method updates the feedback data and context while preserving the original ID.
        """
        context = context or {}

        # Get existing feedback
        logger.info(f'Getting feedback with ID: {feedback_id}')
        existing_feedback = await feedback_repository.get(db, feedback_id)
        if not existing_feedback:
            raise ValueError(f'Feedback with ID {feedback_id} not found')

        logger.info('Found existing feedback, updating data')

        # Update the feedback data - only update safe, non-relationship fields
        logger.info(f'Updating feedback data with keys: {list(data.keys())}')

        # Define safe fields that can be updated directly
        safe_fields = {
            'title',
            'message',
            'rating',
            'severity',
            'priority',
            'status',
            'feedback_metadata',
        }

        rating_value = None
        for key, value in data.items():
            if key in safe_fields and value is not None:
                logger.info(f'Setting {key} = {value}')
                try:
                    setattr(existing_feedback, key, value)
                    if key == 'rating':
                        rating_value = value
                except Exception as e:
                    logger.error(f'Error setting {key}: {str(e)}')
                    raise
            else:
                logger.info(f'Skipping {key} (not in safe fields or None)')

        # Update specialized rating columns based on feedback type
        if rating_value is not None:
            feedback_type = existing_feedback.feedback_type
            logger.info(
                f'🔄 Updating specialized rating field for type: {feedback_type.value}'
            )

            if feedback_type == FeedbackType.CSAT and isinstance(
                existing_feedback, CSATFeedback
            ):
                existing_feedback.csat_score = rating_value
                logger.info(f'✅ Updated csat_score to {rating_value}')
            elif feedback_type == FeedbackType.CES and isinstance(
                existing_feedback, CESFeedback
            ):
                existing_feedback.ces_score = rating_value
                logger.info(f'✅ Updated ces_score to {rating_value}')
            elif feedback_type == FeedbackType.NPS and isinstance(
                existing_feedback, NPSFeedback
            ):
                existing_feedback.nps_score = rating_value
                logger.info(f'✅ Updated nps_score to {rating_value}')
            elif feedback_type == FeedbackType.REVIEW and isinstance(
                existing_feedback, ReviewFeedback
            ):
                existing_feedback.overall_rating = rating_value
                logger.info(f'✅ Updated overall_rating to {rating_value}')

        # Update context - handle this carefully to avoid lazy loading issues
        if context:
            # Get the current context safely
            current_context = getattr(existing_feedback, 'context', None) or {}
            # Update with new context
            updated_context = {**current_context, **context}
            existing_feedback.context = updated_context

        # Update timestamp
        from datetime import datetime, timezone

        existing_feedback.updated_at = datetime.now(timezone.utc)

        # Save changes
        try:
            logger.info(f'Saving changes to database for feedback {feedback_id}')
            db.add(existing_feedback)
            await db.commit()
            logger.info(f'Committed changes for feedback {feedback_id}')
            await db.refresh(existing_feedback)
            logger.info(f'Refreshed feedback object {feedback_id}')
        except Exception as e:
            await db.rollback()
            logger.error(f'Database error updating feedback {feedback_id}: {str(e)}')
            raise ValueError(f'Failed to update feedback: {str(e)}')

        logger.info(f'Converting feedback {feedback_id} to response')
        return self._convert_to_response(existing_feedback)

    def format_feedback_for_display(self, item: Feedback) -> Dict[str, Any]:
        return FeedbackFormatter.format_for_display(item)

    def _convert_to_response(self, obj: Feedback) -> FeedbackResponsePayload:
        if isinstance(obj, BugReportFeedback):
            return BugReportFeedbackResponse.model_validate(obj)
        elif isinstance(obj, FeatureRequestFeedback):
            return FeatureRequestFeedbackResponse.model_validate(obj)
        elif isinstance(obj, ReviewFeedback):
            return ReviewFeedbackResponse.model_validate(obj)
        elif isinstance(obj, SurveyFeedback):
            return SurveyFeedbackResponse.model_validate(obj)
        elif isinstance(obj, NPSFeedback):
            return NPSFeedbackResponse.model_validate(obj)
        elif isinstance(obj, CSATFeedback):
            return CSATFeedbackResponse.model_validate(obj)
        elif isinstance(obj, CESFeedback):
            return CESFeedbackResponse.model_validate(obj)

        elif isinstance(obj, (Feedback, GeneralFeedback)):
            if obj.feedback_type != FeedbackType.GENERAL:
                logger.warning(
                    f"Feedback item {obj.id} with type '{obj.feedback_type.value}' is being treated as GeneralFeedback. "
                    'This indicates an orphaned record in the database where subclass data is missing.'
                )
            return GeneralFeedbackResponse.model_validate(obj)

        else:
            logger.error(f'Unknown feedback instance type for ID {obj.id}: {type(obj)}')
            return GeneralFeedbackResponse.model_validate(obj)


feedback_service = FeedbackService()
