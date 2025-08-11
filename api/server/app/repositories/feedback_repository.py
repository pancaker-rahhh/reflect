from typing import List, Optional, Any
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


feedback_repository = FeedbackRepository()
