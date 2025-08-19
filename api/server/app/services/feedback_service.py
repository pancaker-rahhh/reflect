from __future__ import annotations
from typing import List, Optional
from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession
from app.repositories.feedback_repository import feedback_repository
from app.repositories.feedback_comment_repository import feedback_comment_repository
from app.repositories.feedback_vote_repository import feedback_vote_repository
from app.schemas.feedback_schema import (
    FeedbackUpdate,
    FeedbackCreatePayload,
    FeedbackResponsePayload,
    SurveyFeedbackResponse,
    ReviewFeedbackResponse,
    BugReportFeedbackResponse,
    FeatureRequestFeedbackResponse,
)
from app.models.feedback_model import FeedbackType
from app.models.feedback_model import FeedbackComment, FeedbackVote
from app.core.exceptions import NotFoundError
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

    async def vote_feedback(
        self,
        db: AsyncSession,
        feedback_id: UUID,
        vote_type: str,
        user_id: Optional[UUID] = None,
        session_id: Optional[str] = None,
    ) -> FeedbackVote:
        feedback = await feedback_repository.get(db, feedback_id)
        if not feedback:
            raise NotFoundError('Feedback not found')

        if vote_type not in ['up', 'down']:
            raise ValueError("Vote type must be 'up' or 'down'")

        return await feedback_vote_repository.update_vote(
            db, feedback_id, vote_type, user_id, session_id
        )

    async def remove_vote(
        self,
        db: AsyncSession,
        feedback_id: UUID,
        user_id: Optional[UUID] = None,
        session_id: Optional[str] = None,
    ) -> bool:
        return await feedback_vote_repository.remove_vote(
            db, feedback_id, user_id, session_id
        )

    async def get_vote_counts(self, db: AsyncSession, feedback_id: UUID) -> dict:
        return await feedback_vote_repository.get_vote_counts(db, feedback_id)

    async def get_user_vote(
        self,
        db: AsyncSession,
        feedback_id: UUID,
        user_id: Optional[UUID] = None,
        session_id: Optional[str] = None,
    ) -> Optional[FeedbackVote]:
        return await feedback_vote_repository.get_user_vote(
            db, feedback_id, user_id, session_id
        )

    def _convert_to_response(self, obj) -> FeedbackResponsePayload:
        if obj.feedback_type == FeedbackType.SURVEY:
            return SurveyFeedbackResponse.model_validate(obj)
        elif obj.feedback_type == FeedbackType.REVIEW:
            return ReviewFeedbackResponse.model_validate(obj)
        elif obj.feedback_type == FeedbackType.BUG_REPORT:
            return BugReportFeedbackResponse.model_validate(obj)
        elif obj.feedback_type == FeedbackType.FEATURE_REQUEST:
            return FeatureRequestFeedbackResponse.model_validate(obj)
        else:
            return SurveyFeedbackResponse.model_validate(obj)


feedback_service = FeedbackService()
