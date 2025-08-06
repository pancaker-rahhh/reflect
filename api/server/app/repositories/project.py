from typing import Optional, List
from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_
from sqlalchemy.orm import selectinload

from app.models.project import Project
from app.repositories.base import BaseRepository


class ProjectRepository(BaseRepository[Project]):
    def __init__(self):
        super().__init__(Project)

    async def get_by_workspace_and_slug(
        self, db: AsyncSession, workspace_id: UUID, slug: str
    ) -> Optional[Project]:
        stmt = select(Project).where(
            and_(Project.workspace_id == workspace_id, Project.slug == slug)
        )
        result = await db.execute(stmt)
        return result.scalar_one_or_none()

    async def get_by_workspace(
        self, db: AsyncSession, workspace_id: UUID, skip: int = 0, limit: int = 100
    ) -> List[Project]:
        return await self.get_multi(
            db, workspace_id=workspace_id, skip=skip, limit=limit
        )

    async def get_with_widgets(
        self, db: AsyncSession, project_id: UUID
    ) -> Optional[Project]:
        stmt = (
            select(Project)
            .options(selectinload(Project.widgets))
            .where(Project.id == project_id)
        )
        result = await db.execute(stmt)
        return result.scalar_one_or_none()


project_repository = ProjectRepository()
