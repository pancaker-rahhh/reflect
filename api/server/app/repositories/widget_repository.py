from typing import Optional, List
from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from api.server.app.models.widget_model import Widget, WidgetStatus
from api.server.app.repositories.base_repository import BaseRepository


class WidgetRepository(BaseRepository[Widget]):
    def __init__(self):
        super().__init__(Widget)

    async def get_by_public_key(
        self, db: AsyncSession, public_key: str
    ) -> Optional[Widget]:
        stmt = select(Widget).where(Widget.public_key == public_key)
        result = await db.execute(stmt)
        return result.scalar_one_or_none()

    async def get_by_project(
        self, db: AsyncSession, project_id: UUID, skip: int = 0, limit: int = 100
    ) -> List[Widget]:
        return await self.get_multi(db, project_id=project_id, skip=skip, limit=limit)

    async def get_active_by_project(
        self, db: AsyncSession, project_id: UUID
    ) -> List[Widget]:
        return await self.get_multi(
            db, project_id=project_id, status=WidgetStatus.ACTIVE, is_active=True
        )

    async def activate(self, db: AsyncSession, widget_id: UUID) -> Optional[Widget]:
        return await self.update(
            db, widget_id, status=WidgetStatus.ACTIVE, is_active=True
        )

    async def deactivate(self, db: AsyncSession, widget_id: UUID) -> Optional[Widget]:
        return await self.update(
            db, widget_id, status=WidgetStatus.INACTIVE, is_active=False
        )


widget_repository = WidgetRepository()
