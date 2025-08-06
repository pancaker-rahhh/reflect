from typing import Optional
from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from app.models.workspace import Workspace
from app.repositories.base import BaseRepository


class WorkspaceRepository(BaseRepository[Workspace]):
    def __init__(self):
        super().__init__(Workspace)

    async def get_by_user_id(
        self, db: AsyncSession, user_id: UUID
    ) -> Optional[Workspace]:
        stmt = select(Workspace).where(Workspace.user_id == user_id)
        result = await db.execute(stmt)
        return result.scalar_one_or_none()

    async def get_by_slug(self, db: AsyncSession, slug: str) -> Optional[Workspace]:
        stmt = select(Workspace).where(Workspace.slug == slug)
        result = await db.execute(stmt)
        return result.scalar_one_or_none()

    async def get_with_projects(
        self, db: AsyncSession, workspace_id: UUID
    ) -> Optional[Workspace]:
        stmt = (
            select(Workspace)
            .options(selectinload(Workspace.projects))
            .where(Workspace.id == workspace_id)
        )
        result = await db.execute(stmt)
        return result.scalar_one_or_none()


workspace_repository = WorkspaceRepository()
