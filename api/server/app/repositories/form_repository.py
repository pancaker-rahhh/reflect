from typing import List, Optional
from uuid import UUID

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from app.models.form_model import FeedbackForm, FormField
from app.repositories.base_repository import BaseRepository


class FeedbackFormRepository(BaseRepository[FeedbackForm]):
    def __init__(self):
        super().__init__(FeedbackForm)

    async def get_by_project(
        self, db: AsyncSession, project_id: UUID, skip: int = 0, limit: int = 100
    ) -> List[FeedbackForm]:
        stmt = (
            select(FeedbackForm)
            .where(FeedbackForm.project_id == project_id)
            .options(selectinload(FeedbackForm.form_fields))
            .offset(skip)
            .limit(limit)
            .order_by(FeedbackForm.created_at.desc())
        )
        result = await db.execute(stmt)
        return list(result.scalars().all())

    async def get_active_by_project(
        self, db: AsyncSession, project_id: UUID
    ) -> List[FeedbackForm]:
        stmt = (
            select(FeedbackForm)
            .where(
                FeedbackForm.project_id == project_id,
                FeedbackForm.is_active
            )
            .options(selectinload(FeedbackForm.form_fields))
            .order_by(FeedbackForm.created_at.desc())
        )
        result = await db.execute(stmt)
        return list(result.scalars().all())

    async def get_with_fields(
        self, db: AsyncSession, form_id: UUID
    ) -> Optional[FeedbackForm]:
        stmt = (
            select(FeedbackForm)
            .where(FeedbackForm.id == form_id)
            .options(selectinload(FeedbackForm.form_fields))
        )
        result = await db.execute(stmt)
        return result.scalar_one_or_none()


class FormFieldRepository(BaseRepository[FormField]):
    def __init__(self):
        super().__init__(FormField)

    async def get_by_form(
        self, db: AsyncSession, form_id: UUID
    ) -> List[FormField]:
        stmt = (
            select(FormField)
            .where(FormField.form_id == form_id)
            .order_by(FormField.order_index.asc())
        )
        result = await db.execute(stmt)
        return list(result.scalars().all())

    async def create_field(
        self, 
        db: AsyncSession, 
        form_id: UUID, 
        field_type: str,
        field_key: str,
        label: str,
        is_required: bool = False,
        validation_rules: dict = None,
        options: list = None,
        order_index: int = 0
    ) -> FormField:
        field_data = {
            'form_id': form_id,
            'field_type': field_type,
            'field_key': field_key,
            'label': label,
            'is_required': is_required,
            'validation_rules': validation_rules or {},
            'options': options or [],
            'order_index': order_index
        }
        return await self.create(db, **field_data)

    async def reorder_fields(
        self, db: AsyncSession, form_id: UUID, field_orders: List[dict]
    ) -> bool:
        try:
            for field_order in field_orders:
                field_id = field_order['field_id']
                new_order = field_order['order_index']
                await self.update(db, field_id, order_index=new_order)
            return True
        except Exception:
            return False


feedback_form_repository = FeedbackFormRepository()
form_field_repository = FormFieldRepository()
