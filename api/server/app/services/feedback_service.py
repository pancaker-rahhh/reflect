from __future__ import annotations
from typing import List, Optional, Dict, Any
from uuid import UUID
from datetime import datetime
from sqlalchemy.ext.asyncio import AsyncSession
from app.repositories.feedback_repository import feedback_repository
from app.repositories.feedback_comment_repository import feedback_comment_repository
from app.services.action_item_service import action_item_service
from app.core.logging import get_logger

logger = get_logger(__name__)

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
    FeedbackStatus,
    FeedbackType,
    FeedbackPriority,
)
from app.models.feedback_model import FeedbackComment
from app.models.widget_model import WidgetType
from app.core.exceptions import NotFoundError, ValidationError
from app.core.logging import get_logger

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

        return await self.create_feedback(db, payload)

    def _create_review_feedback(
        self, base_data: Dict[str, Any], data: Dict[str, Any]
    ) -> ReviewFeedbackCreate:
        """Create review feedback with 5-star rating system"""
        logger.info(f'🔍 _create_review_feedback - data: {data}')
        logger.info(
            f'🔍 _create_review_feedback - rating from data: {data.get("rating")}'
        )
        rating_value = data.get('rating')
        return ReviewFeedbackCreate(
            **base_data,
            feedback_type=FeedbackType.REVIEW,
            rating=rating_value,  # Set base rating field
            overall_rating=rating_value,  # Set overall_rating field for review-specific data
            title=data.get('title', 'Product Review'),
            message=data.get('message', ''),
            pros=data.get('pros', ''),
            cons=data.get('cons', ''),
            is_published=data.get('is_published', False),
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

        return BugReportFeedbackCreate(
            **base_data,
            feedback_type=FeedbackType.BUG_REPORT,
            title=data.get('title', 'Bug Report'),
            message=data.get('description', ''),
            severity_level=severity_level,
            steps_to_reproduce=data.get('steps_to_reproduce', ''),
            expected_behavior=data.get('expected_result', ''),
            actual_behavior=data.get('actual_result', ''),
            visual_proof=data.get('visual_proof') or {},
        )

    def _create_feature_request_feedback(
        self, base_data: Dict[str, Any], data: Dict[str, Any]
    ) -> FeatureRequestFeedbackCreate:
        """Create feature request feedback with solution and benefits"""
        return FeatureRequestFeedbackCreate(
            **base_data,
            feedback_type=FeedbackType.FEATURE_REQUEST,
            title=data.get('title', 'Feature Request'),
            message=data.get('description', ''),
            suggested_solution=data.get('suggested_solution', ''),
            benefits=data.get('benefits', ''),
            use_case=data.get('use_case', ''),
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

        return NPSFeedbackCreate(
            **base_data,
            feedback_type=FeedbackType.NPS,
            rating=nps_score,  # Set base rating field
            nps_score=nps_score,
            promoter_category=promoter_category,
            follow_up_comment=data.get('comment', ''),
            title='NPS Survey Response',
            message=data.get('comment', ''),
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

        return CSATFeedbackCreate(
            **base_data,
            feedback_type=FeedbackType.CSAT,
            rating=csat_score,  # Set base rating field
            csat_score=csat_score,
            satisfaction_level=satisfaction_levels.get(csat_score, 'neutral'),
            follow_up_comment=data.get('comment', ''),
            title='CSAT Survey Response',
            message=data.get('comment', ''),
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

        return CESFeedbackCreate(
            **base_data,
            feedback_type=FeedbackType.CES,
            rating=ces_score,  # Set base rating field
            ces_score=ces_score,
            ease_level=ease_levels.get(ces_score, 'neutral'),
            follow_up_comment=data.get('comment', ''),
            title='CES Survey Response',
            message=data.get('comment', ''),
        )

    def _create_general_feedback(
        self, base_data: Dict[str, Any], data: Dict[str, Any]
    ) -> GeneralFeedbackCreate:
        """Create general feedback as fallback"""
        return GeneralFeedbackCreate(
            **base_data,
            feedback_type=FeedbackType.GENERAL,
            title=data.get('title', 'General Feedback'),
            message=data.get('message', ''),
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
        project_id: Optional[UUID] = None,
        widget_id: Optional[UUID] = None,
        skip: int = 0,
        limit: int = 100,
    ) -> List[FeedbackResponsePayload]:
        if widget_id:
            objs = await feedback_repository.get_by_widget(db, widget_id, skip, limit)
        elif project_id:
            objs = await feedback_repository.get_by_project(db, project_id, skip, limit)
        else:
            objs = await feedback_repository.get_multi(db, skip=skip, limit=limit)
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

        # Validate feedback is not deleted or archived
        if feedback.status in [FeedbackStatus.ARCHIVED, FeedbackStatus.REJECTED]:
            raise ValidationError('Cannot upvote archived or rejected feedback')

        # Use atomic increment to prevent race conditions
        feedback.feedback_votes += 1
        await db.commit()
        await db.refresh(feedback)

        return True

    async def get_actionable_feedback(
        self, db: AsyncSession, project_id: UUID, skip: int = 0, limit: int = 100
    ) -> List[FeedbackResponsePayload]:
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
            'status': FeedbackStatus.IN_PROGRESS,
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

        logger.info(f'Found existing feedback, updating data')

        # Update the feedback data - only update safe, non-relationship fields
        logger.info(f'Updating feedback data with keys: {list(data.keys())}')

        # Define safe fields that can be updated directly
        safe_fields = {
            'title',
            'message',
            'rating',
            'severity',
            'steps_to_reproduce',
            'expected_result',
            'actual_result',
            'visual_proof',
            'priority',
            'status',
            'feedback_metadata',
        }

        for key, value in data.items():
            if key in safe_fields and value is not None:
                logger.info(f'Setting {key} = {value}')
                try:
                    setattr(existing_feedback, key, value)
                except Exception as e:
                    logger.error(f'Error setting {key}: {str(e)}')
                    raise
            else:
                logger.info(f'Skipping {key} (not in safe fields or None)')

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
