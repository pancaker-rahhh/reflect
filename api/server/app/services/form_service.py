from __future__ import annotations

from typing import List, Optional
from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession

from app.repositories.form_repository import feedback_form_repository
from app.schemas.form_schema import (
    FeedbackFormCreate,
    FeedbackFormUpdate,
    FeedbackFormResponse,
)


class FeedbackFormService:
    async def create_form(
        self, db: AsyncSession, payload: FeedbackFormCreate
    ) -> FeedbackFormResponse:
        obj = await feedback_form_repository.create(db, **payload.model_dump())
        return FeedbackFormResponse.model_validate(obj)

    async def get_form(
        self, db: AsyncSession, form_id: UUID
    ) -> Optional[FeedbackFormResponse]:
        obj = await feedback_form_repository.get(db, form_id)
        return FeedbackFormResponse.model_validate(obj) if obj else None

    async def list_forms(
        self,
        db: AsyncSession,
        project_id: Optional[UUID] = None,
        skip: int = 0,
        limit: int = 100,
    ) -> List[FeedbackFormResponse]:
        if project_id:
            objs = await feedback_form_repository.get_by_project(
                db, project_id, skip, limit
            )
        else:
            objs = await feedback_form_repository.get_multi(db, skip=skip, limit=limit)
        return [FeedbackFormResponse.model_validate(o) for o in objs]

    async def update_form(
        self, db: AsyncSession, form_id: UUID, payload: FeedbackFormUpdate
    ) -> Optional[FeedbackFormResponse]:
        obj = await feedback_form_repository.update(
            db, form_id, **payload.model_dump(exclude_none=True)
        )
        return FeedbackFormResponse.model_validate(obj) if obj else None

    async def delete_form(self, db: AsyncSession, form_id: UUID) -> bool:
        return await feedback_form_repository.delete(db, form_id)


feedback_form_service = FeedbackFormService()
