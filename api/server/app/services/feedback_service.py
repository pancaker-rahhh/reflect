from __future__ import annotations
from typing import List, Optional
from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession
from app.repositories.feedback_repository import feedback_repository
from app.schemas.feedback_schema import (
    FeedbackUpdate,
    FeedbackCreatePayload,
    FeedbackResponsePayload,
)


class FeedbackService:
    async def create_feedback(
        self, db: AsyncSession, payload: FeedbackCreatePayload
    ) -> FeedbackResponsePayload:
        obj = await feedback_repository.create_polymorphic(db, **payload.model_dump())
        return FeedbackResponsePayload.model_validate(obj)  # type: ignore[return-value]

    async def get_feedback(
        self, db: AsyncSession, feedback_id: UUID
    ) -> Optional[FeedbackResponsePayload]:
        obj = await feedback_repository.get(db, feedback_id)
        return FeedbackResponsePayload.model_validate(obj) if obj else None

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
        return [FeedbackResponsePayload.model_validate(o) for o in objs]

    async def update_feedback(
        self, db: AsyncSession, feedback_id: UUID, payload: FeedbackUpdate
    ) -> Optional[FeedbackResponsePayload]:
        obj = await feedback_repository.update_polymorphic(
            db, feedback_id, **payload.model_dump(exclude_none=True)
        )
        return FeedbackResponsePayload.model_validate(obj) if obj else None

    async def delete_feedback(self, db: AsyncSession, feedback_id: UUID) -> bool:
        return await feedback_repository.delete_polymorphic(db, feedback_id)


feedback_service = FeedbackService()
