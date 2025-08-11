from typing import Optional, List, Tuple
from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, func
from datetime import datetime

from app.models.project_model import Project
from app.repositories.base_repository import BaseRepository


class ProjectRepository(BaseRepository[Project]):
    def __init__(self):
        super().__init__(Project)

    async def get(self, db: AsyncSession, id: UUID) -> Optional[Project]:
        stmt = select(Project).where(Project.id == id, Project.deleted_at.is_(None))
        result = await db.execute(stmt)
        return result.scalar_one_or_none()

    async def get_by_organization_and_slug(
        self, db: AsyncSession, organization_id: UUID, slug: str
    ) -> Optional[Project]:
        stmt = select(Project).where(
            and_(Project.organization_id == organization_id, Project.slug == slug, Project.deleted_at.is_(None))
        )
        result = await db.execute(stmt)
        return result.scalar_one_or_none()

    async def get_multi_by_organization(
        self, db: AsyncSession, *, organization_id: UUID, skip: int = 0, limit: int = 100
    ) -> Tuple[List[Project], int]:
        stmt = (
            select(Project)
            .where(Project.organization_id == organization_id, Project.deleted_at.is_(None))
            .offset(skip)
            .limit(limit)
            .order_by(Project.created_at.desc())
        )

        count_stmt = (
            select(func.count())
            .select_from(Project)
            .where(Project.organization_id == organization_id, Project.deleted_at.is_(None))
        )

        items_result = await db.execute(stmt)
        total_result = await db.execute(count_stmt)

        items = list(items_result.scalars().all())
        total = total_result.scalar_one()

        return items, total

    async def soft_delete(self, db: AsyncSession, id: UUID) -> Optional[Project]:
        project = await self.get(db, id)
        if not project:
            return None
        
        project.deleted_at = datetime.now()
        db.add(project)
        await db.flush()
        await db.refresh(project)
        return project


project_repository = ProjectRepository()
