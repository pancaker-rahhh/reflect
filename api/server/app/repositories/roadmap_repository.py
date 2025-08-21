from typing import Optional, List
from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from app.models.roadmap_model import (
    Roadmap,
    RoadmapColumn,
    RoadmapFeature,
    RoadmapItemAssignment,
    RoadmapTag,
    RoadmapFeatureTag,
)
from app.repositories.base_repository import BaseRepository


class RoadmapTagRepository(BaseRepository[RoadmapTag]):
    def __init__(self):
        super().__init__(RoadmapTag)

    async def get_by_roadmap(
        self, db: AsyncSession, roadmap_id: UUID
    ) -> List[RoadmapTag]:
        stmt = select(RoadmapTag).where(RoadmapTag.roadmap_id == roadmap_id)
        result = await db.execute(stmt)
        return list(result.scalars().all())

    async def get_by_name(
        self, db: AsyncSession, roadmap_id: UUID, name: str
    ) -> Optional[RoadmapTag]:
        stmt = select(RoadmapTag).where(
            RoadmapTag.roadmap_id == roadmap_id, RoadmapTag.name == name
        )
        result = await db.execute(stmt)
        return result.scalar_one_or_none()


roadmap_tag_repository = RoadmapTagRepository()


class RoadmapFeatureTagRepository(BaseRepository[RoadmapFeatureTag]):
    def __init__(self):
        super().__init__(RoadmapFeatureTag)

    async def get_tags_for_feature(
        self, db: AsyncSession, feature_id: UUID
    ) -> List[RoadmapTag]:
        stmt = (
            select(RoadmapTag)
            .join(RoadmapFeatureTag, RoadmapFeatureTag.tag_id == RoadmapTag.id)
            .where(RoadmapFeatureTag.feature_id == feature_id)
        )
        result = await db.execute(stmt)
        return list(result.scalars().all())

    async def get_features_for_tag(
        self, db: AsyncSession, tag_id: UUID
    ) -> List[RoadmapFeature]:
        stmt = (
            select(RoadmapFeature)
            .join(RoadmapFeatureTag, RoadmapFeatureTag.feature_id == RoadmapFeature.id)
            .where(RoadmapFeatureTag.tag_id == tag_id)
        )
        result = await db.execute(stmt)
        return list(result.scalars().all())

    async def add_tag_to_feature(
        self, db: AsyncSession, feature_id: UUID, tag_id: UUID
    ) -> RoadmapFeatureTag:
        feature_tag = await self.get_by_ids(db, feature_id, tag_id)
        if feature_tag:
            return feature_tag

        feature_tag = RoadmapFeatureTag(feature_id=feature_id, tag_id=tag_id)
        return await self.create(
            db, **{'feature_id': feature_tag.feature_id, 'tag_id': feature_tag.tag_id}
        )

    async def remove_tag_from_feature(
        self, db: AsyncSession, feature_id: UUID, tag_id: UUID
    ) -> bool:
        feature_tag = await self.get_by_ids(db, feature_id, tag_id)
        if not feature_tag:
            return False

        return await self.delete(db, id=feature_tag.id)

    async def get_by_ids(
        self, db: AsyncSession, feature_id: UUID, tag_id: UUID
    ) -> Optional[RoadmapFeatureTag]:
        stmt = select(RoadmapFeatureTag).where(
            RoadmapFeatureTag.feature_id == feature_id,
            RoadmapFeatureTag.tag_id == tag_id,
        )
        result = await db.execute(stmt)
        return result.scalar_one_or_none()


roadmap_feature_tag_repository = RoadmapFeatureTagRepository()


class RoadmapFeatureRepository(BaseRepository[RoadmapFeature]):
    def __init__(self):
        super().__init__(RoadmapFeature)

    async def get_with_tags(
        self, db: AsyncSession, id: UUID
    ) -> Optional[RoadmapFeature]:
        stmt = (
            select(RoadmapFeature)
            .where(RoadmapFeature.id == id)
            .options(
                selectinload(RoadmapFeature.feature_tags).selectinload(
                    RoadmapFeatureTag.tag
                )
            )
        )
        result = await db.execute(stmt)
        return result.scalar_one_or_none()


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

    async def get_with_features_and_tags(
        self, db: AsyncSession, id: UUID
    ) -> Optional[RoadmapColumn]:
        stmt = (
            select(RoadmapColumn)
            .where(RoadmapColumn.id == id)
            .options(
                selectinload(RoadmapColumn.features)
                .selectinload(RoadmapFeature.feature_tags)
                .selectinload(RoadmapFeatureTag.tag)
            )
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
            .options(
                selectinload(Roadmap.columns)
                .selectinload(RoadmapColumn.features)
                .selectinload(RoadmapFeature.feature_tags)
                .selectinload(RoadmapFeatureTag.tag)
            )
            .options(selectinload(Roadmap.tags))
        )
        result = await db.execute(stmt)
        return result.scalar_one_or_none()

    async def get_by_public_slug(
        self, db: AsyncSession, public_slug: str
    ) -> Optional[Roadmap]:
        stmt = (
            select(Roadmap)
            .where(Roadmap.public_slug == public_slug, Roadmap.is_public)
            .options(
                selectinload(Roadmap.columns)
                .selectinload(RoadmapColumn.features)
                .selectinload(RoadmapFeature.feature_tags)
                .selectinload(RoadmapFeatureTag.tag)
            )
            .options(selectinload(Roadmap.tags))
        )
        result = await db.execute(stmt)
        return result.scalar_one_or_none()

    async def get_by_subdomain(
        self, db: AsyncSession, subdomain: str
    ) -> Optional[Roadmap]:
        stmt = (
            select(Roadmap)
            .where(Roadmap.subdomain == subdomain, Roadmap.is_public)
            .options(
                selectinload(Roadmap.columns)
                .selectinload(RoadmapColumn.features)
                .selectinload(RoadmapFeature.feature_tags)
                .selectinload(RoadmapFeatureTag.tag)
            )
            .options(selectinload(Roadmap.tags))
        )
        result = await db.execute(stmt)
        return result.scalar_one_or_none()

    async def get_full_roadmap(
        self, db: AsyncSession, roadmap_id: UUID
    ) -> Optional[Roadmap]:
        stmt = (
            select(Roadmap)
            .where(Roadmap.id == roadmap_id)
            .options(
                selectinload(Roadmap.columns)
                .selectinload(RoadmapColumn.features)
                .selectinload(RoadmapFeature.feature_tags)
                .selectinload(RoadmapFeatureTag.tag)
            )
            .options(selectinload(Roadmap.tags))
        )
        result = await db.execute(stmt)
        return result.scalar_one_or_none()


roadmap_repository = RoadmapRepository()


class RoadmapAssignmentRepository(BaseRepository[RoadmapItemAssignment]):
    def __init__(self):
        super().__init__(RoadmapItemAssignment)

    async def get_by_feature(
        self, db: AsyncSession, feature_id: UUID
    ) -> list[RoadmapItemAssignment]:
        stmt = (
            select(RoadmapItemAssignment)
            .where(RoadmapItemAssignment.roadmap_feature_id == feature_id)
            .options(selectinload(RoadmapItemAssignment.user))
        )
        result = await db.execute(stmt)
        return list(result.scalars().all())

    async def get_by_feature_and_user(
        self, db: AsyncSession, feature_id: UUID, user_id: UUID
    ) -> Optional[RoadmapItemAssignment]:
        stmt = select(RoadmapItemAssignment).where(
            RoadmapItemAssignment.roadmap_feature_id == feature_id,
            RoadmapItemAssignment.user_id == user_id,
        )
        result = await db.execute(stmt)
        return result.scalar_one_or_none()


roadmap_assignment_repository = RoadmapAssignmentRepository()
