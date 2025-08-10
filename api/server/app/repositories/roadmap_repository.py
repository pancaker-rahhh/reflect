from typing import Optional
from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from app.models.roadmap_model import Roadmap, RoadmapColumn, RoadmapFeature
from app.repositories.base_repository import BaseRepository


class RoadmapFeatureRepository(BaseRepository[RoadmapFeature]):
    def __init__(self):
        super().__init__(RoadmapFeature)


roadmap_feature_repository = RoadmapFeatureRepository()


class RoadmapColumnRepository(BaseRepository[RoadmapColumn]):
    def __init__(self):
        super().__init__(RoadmapColumn)

    async def get_with_features(
        self, db: AsyncSession, id: UUID
    ) -> Optional[RoadmapColumn]:
        stmt = (
            select(RoadmapColumn)
            .where(RoadmapColumn.id == id)
            .options(selectinload(RoadmapColumn.features))
        )
        result = await db.execute(stmt)
        return result.scalar_one_or_none()


roadmap_column_repository = RoadmapColumnRepository()


class RoadmapRepository(BaseRepository[Roadmap]):
    def __init__(self):
        super().__init__(Roadmap)

    async def get_by_project_id(
        self, db: AsyncSession, project_id: UUID
    ) -> Optional[Roadmap]:
        stmt = (
            select(Roadmap)
            .where(Roadmap.project_id == project_id)
            .options(selectinload(Roadmap.columns).selectinload(RoadmapColumn.features))
        )
        result = await db.execute(stmt)
        return result.scalar_one_or_none()

    async def get_by_public_slug(
        self, db: AsyncSession, public_slug: str
    ) -> Optional[Roadmap]:
        stmt = (
            select(Roadmap)
            .where(Roadmap.public_slug == public_slug, Roadmap.is_public)
            .options(selectinload(Roadmap.columns).selectinload(RoadmapColumn.features))
        )
        result = await db.execute(stmt)
        return result.scalar_one_or_none()


roadmap_repository = RoadmapRepository()
