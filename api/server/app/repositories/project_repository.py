from typing import Optional, List, Tuple
from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, func
from datetime import datetime

from api.server.app.models.project_model import Project
from api.server.app.repositories.base_repository import BaseRepository


class ProjectRepository(BaseRepository[Project]):
    def __init__(self):
        super().__init__(Project)

    async def get(self, db: AsyncSession, id: UUID) -> Optional[Project]:
        stmt = select(Project).where(Project.id == id, Project.deleted_at.is_(None))
        result = await db.execute(stmt)
        return result.scalar_one_or_none()

    async def get_by_workspace_and_slug(
        self, db: AsyncSession, workspace_id: UUID, slug: str
    ) -> Optional[Project]:
        stmt = select(Project).where(
            and_(Project.workspace_id == workspace_id, Project.slug == slug)
        )
        result = await db.execute(stmt)
        return result.scalar_one_or_none()

    async def get_multi_by_workspace(
        self, db: AsyncSession, *, workspace_id: UUID, skip: int = 0, limit: int = 100
    ) -> Tuple[List[Project], int]:
        stmt = (
            select(Project)
            .where(Project.workspace_id == workspace_id, Project.deleted_at.is_(None))
            .offset(skip)
            .limit(limit)
            .order_by(Project.created_at.desc())
        )

        count_stmt = (
            select(func.count())
            .select_from(Project)
            .where(Project.workspace_id == workspace_id, Project.deleted_at.is_(None))
        )

        items_result = await db.execute(stmt)
        total_result = await db.execute(count_stmt)

        items = list(items_result.scalars().all())
        total = total_result.scalar_one()

        return items, total

    async def soft_delete(self, db: AsyncSession, project: Project) -> Project:
        project.deleted_at = datetime.now()
        db.add(project)
        await db.flush()
        await db.refresh(project)
        return project


project_repository = ProjectRepository()
