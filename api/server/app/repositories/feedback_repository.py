from typing import List, Optional, Any, Dict
from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.feedback_model import (
    Feedback,
    FeedbackStatus,
    FeedbackType,
    SurveyFeedback,
    ReviewFeedback,
    BugReportFeedback,
    FeatureRequestFeedback,
    NPSFeedback,
    CSATFeedback,
    CESFeedback,
)
from app.repositories.base_repository import BaseRepository


class FeedbackRepository(BaseRepository[Feedback]):
    def __init__(self):
        super().__init__(Feedback)

    async def get_by_project(
        self, db: AsyncSession, project_id: UUID, skip: int = 0, limit: int = 100
    ) -> List[Feedback]:
        return await self.get_multi(db, project_id=project_id, skip=skip, limit=limit)

    async def get_by_widget(
        self, db: AsyncSession, widget_id: UUID, skip: int = 0, limit: int = 100
    ) -> List[Feedback]:
        return await self.get_multi(db, widget_id=widget_id, skip=skip, limit=limit)

    async def get_by_status(
        self,
        db: AsyncSession,
        project_id: Optional[UUID] = None,
        status: Optional[FeedbackStatus] = None,
        skip: int = 0,
        limit: int = 100,
    ) -> List[Feedback]:
        filters = {}
        if project_id:
            filters['project_id'] = project_id
        if status:
            filters['status'] = status
        return await self.get_multi(db, skip=skip, limit=limit, **filters)

    async def get_by_type(
        self,
        db: AsyncSession,
        project_id: Optional[UUID] = None,
        feedback_type: Optional[FeedbackType] = None,
        skip: int = 0,
        limit: int = 100,
    ) -> List[Feedback]:
        filters = {}
        if project_id:
            filters['project_id'] = project_id
        if feedback_type:
            filters['feedback_type'] = feedback_type
        return await self.get_multi(db, skip=skip, limit=limit, **filters)

    async def create_polymorphic(self, db: AsyncSession, **obj_data: Any) -> Feedback:
        ftype = obj_data.get('feedback_type')
        if isinstance(ftype, str):
            try:
                ftype = FeedbackType(ftype)
            except Exception:
                ftype = FeedbackType.GENERAL
        model_cls: Any
        if ftype == FeedbackType.SURVEY:
            model_cls = SurveyFeedback
        elif ftype == FeedbackType.REVIEW:
            model_cls = ReviewFeedback
        elif ftype == FeedbackType.BUG_REPORT:
            model_cls = BugReportFeedback
        elif ftype == FeedbackType.FEATURE_REQUEST:
            model_cls = FeatureRequestFeedback
        elif ftype == FeedbackType.NPS:
            model_cls = NPSFeedback
        elif ftype == FeedbackType.CSAT:
            model_cls = CSATFeedback
        elif ftype == FeedbackType.CES:
            model_cls = CESFeedback
        else:
            model_cls = Feedback

        db_obj = model_cls(**obj_data)
        db.add(db_obj)
        await db.commit()
        await db.refresh(db_obj)
        return db_obj

    async def update_polymorphic(
        self, db: AsyncSession, id: UUID, **update_data: Any
    ) -> Optional[Feedback]:
        obj = await self.get(db, id)
        if not obj:
            return None
        for key, value in update_data.items():
            if value is not None and hasattr(obj, key):
                setattr(obj, key, value)
        db.add(obj)
        await db.commit()
        await db.refresh(obj)
        return obj

    async def delete_polymorphic(self, db: AsyncSession, id: UUID) -> bool:
        obj = await self.get(db, id)
        if not obj:
            return False
        await db.delete(obj)
        await db.commit()
        return True

    async def get_by_widget_and_type(
        self, db: AsyncSession, widget_id: UUID, feedback_type: FeedbackType
    ) -> List[Feedback]:
        """Get all feedback for a specific widget and type"""
        from sqlalchemy import select

        # Use the base Feedback model and filter by feedback_type and widget_id
        stmt = select(Feedback).where(
            Feedback.widget_id == widget_id, Feedback.feedback_type == feedback_type
        )
        result = await db.execute(stmt)
        return list(result.scalars().all())

    async def get_existing_feedback_by_context(
        self,
        db: AsyncSession,
        widget_id: UUID,
        context: Dict[str, Any],
        feedback_type: Any,
        within_hours: int = 24,
    ) -> Optional[Feedback]:
        """
        Check for existing feedback from the same user context to prevent duplicates.
        Looks for feedback with matching IP, user agent, and widget within the specified time window.
        """
        from sqlalchemy import and_, select
        from datetime import datetime, timedelta, timezone

        # Extract IP and user agent from context
        ip_address = context.get('ip_address')
        user_agent = context.get('user_agent')

        if not ip_address and not user_agent:
            return None  # Can't deduplicate without context

        cutoff_time = datetime.now(timezone.utc) - timedelta(hours=within_hours)

        # Build query filters
        filters = [
            Feedback.widget_id == widget_id,
            Feedback.feedback_type == feedback_type,
            Feedback.created_at >= cutoff_time,
        ]

        # Add context filters if available - now using context JSONB field
        if ip_address:
            filters.append(Feedback.context['ip_address'].astext == ip_address)
        if user_agent:
            filters.append(Feedback.context['user_agent'].astext == user_agent)

        # Use SQLAlchemy 2.x async syntax
        stmt = (
            select(Feedback)
            .where(and_(*filters))
            .order_by(Feedback.created_at.desc())
            .limit(1)
        )
        result = await db.execute(stmt)
        return result.scalar_one_or_none()

    async def update_votes(
        self, db: AsyncSession, feedback_id: UUID, new_vote_count: int
    ) -> bool:
        """Update the vote count for a feedback item"""
        obj = await self.get(db, feedback_id)
        if not obj:
            return False

        obj.feedback_votes = new_vote_count  # Use correct field name
        db.add(obj)
        await db.commit()
        return True


feedback_repository = FeedbackRepository()
