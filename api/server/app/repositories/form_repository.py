from typing import List
from uuid import UUID

from sqlalchemy.ext.asyncio import AsyncSession

from app.models.form_model import FeedbackForm
from app.repositories.base_repository import BaseRepository


class FeedbackFormRepository(BaseRepository[FeedbackForm]):
    def __init__(self):
        super().__init__(FeedbackForm)

    async def get_by_project(
        self, db: AsyncSession, project_id: UUID, skip: int = 0, limit: int = 100
    ) -> List[FeedbackForm]:
        return await self.get_multi(db, project_id=project_id, skip=skip, limit=limit)


feedback_form_repository = FeedbackFormRepository()
