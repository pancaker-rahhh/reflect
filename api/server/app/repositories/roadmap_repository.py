from typing import Optional, List, Dict, Any
from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_, or_
from sqlalchemy.orm import selectinload
from sqlalchemy.exc import IntegrityError
from app.models.roadmap_model import (
    Roadmap,
    RoadmapColumn,
    RoadmapActionItem,
    RoadmapItemAssignment,
    RoadmapTag,
    RoadmapActionItemTag,
)
from app.repositories.base_repository import BaseRepository
from app.core.logging import get_logger

logger = get_logger(__name__)


class RoadmapTagRepository(BaseRepository[RoadmapTag]):
    def __init__(self):
        super().__init__(RoadmapTag)

    async def get_by_roadmap(
        self, db: AsyncSession, roadmap_id: UUID
    ) -> List[RoadmapTag]:
        try:
            stmt = (
                select(RoadmapTag)
                .where(RoadmapTag.roadmap_id == roadmap_id)
                .order_by(RoadmapTag.name)
            )
            result = await db.execute(stmt)
            return list(result.scalars().all())
        except Exception as e:
            logger.error(f'Error fetching tags for roadmap {roadmap_id}: {str(e)}')
            raise

    async def get_by_name(
        self, db: AsyncSession, roadmap_id: UUID, name: str
    ) -> Optional[RoadmapTag]:
        try:
            stmt = select(RoadmapTag).where(
                and_(RoadmapTag.roadmap_id == roadmap_id, RoadmapTag.name == name)
            )
            result = await db.execute(stmt)
            return result.scalar_one_or_none()
        except Exception as e:
            logger.error(
                f'Error fetching tag {name} for roadmap {roadmap_id}: {str(e)}'
            )
            raise

    async def get_by_roadmap_with_feature_count(
        self, db: AsyncSession, roadmap_id: UUID
    ) -> List[Dict[str, Any]]:
        try:
            stmt = (
                select(
                    RoadmapTag,
                    func.count(RoadmapActionItemTag.feature_id).label('feature_count'),
                )
                .outerjoin(
                    RoadmapActionItemTag, RoadmapTag.id == RoadmapActionItemTag.tag_id
                )
                .where(RoadmapTag.roadmap_id == roadmap_id)
                .group_by(RoadmapTag.id)
                .order_by(RoadmapTag.name)
            )
            result = await db.execute(stmt)
            return [
                {'tag': row[0], 'feature_count': row[1] or 0} for row in result.all()
            ]
        except Exception as e:
            logger.error(
                f'Error fetching tags with feature count for roadmap {roadmap_id}: {str(e)}'
            )
            raise

    async def bulk_create(
        self, db: AsyncSession, tags: List[Dict[str, Any]]
    ) -> List[RoadmapTag]:
        try:
            tag_objects = [RoadmapTag(**tag_data) for tag_data in tags]
            db.add_all(tag_objects)
            await db.flush()
            await db.refresh(tag_objects)
            return tag_objects
        except IntegrityError as e:
            await db.rollback()
            logger.error(f'Integrity error creating tags: {str(e)}')
            raise
        except Exception as e:
            await db.rollback()
            logger.error(f'Error creating tags: {str(e)}')
            raise


roadmap_tag_repository = RoadmapTagRepository()


class RoadmapActionItemTagRepository(BaseRepository[RoadmapActionItemTag]):
    def __init__(self):
        super().__init__(RoadmapActionItemTag)

    async def get_tags_for_feature(
        self, db: AsyncSession, feature_id: UUID
    ) -> List[RoadmapTag]:
        try:
            stmt = (
                select(RoadmapTag)
                .join(
                    RoadmapActionItemTag, RoadmapActionItemTag.tag_id == RoadmapTag.id
                )
                .where(RoadmapActionItemTag.feature_id == feature_id)
                .order_by(RoadmapTag.name)
            )
            result = await db.execute(stmt)
            return list(result.scalars().all())
        except Exception as e:
            logger.error(f'Error fetching tags for feature {feature_id}: {str(e)}')
            raise

    async def get_features_for_tag(
        self, db: AsyncSession, tag_id: UUID
    ) -> List[RoadmapActionItem]:
        try:
            stmt = (
                select(RoadmapActionItem)
                .join(
                    RoadmapActionItemTag,
                    RoadmapActionItemTag.feature_id == RoadmapActionItem.id,
                )
                .where(RoadmapActionItemTag.tag_id == tag_id)
                .order_by(RoadmapActionItem.order)
            )
            result = await db.execute(stmt)
            return list(result.scalars().all())
        except Exception as e:
            logger.error(f'Error fetching features for tag {tag_id}: {str(e)}')
            raise

    async def add_tag_to_feature(
        self, db: AsyncSession, feature_id: UUID, tag_id: UUID
    ) -> RoadmapActionItemTag:
        try:
            existing = await self.get_by_ids(db, feature_id, tag_id)
            if existing:
                return existing

            feature_tag = RoadmapActionItemTag(feature_id=feature_id, tag_id=tag_id)
            return await self.create(
                db,
                **{'feature_id': feature_tag.feature_id, 'tag_id': feature_tag.tag_id},
            )
        except IntegrityError as e:
            logger.error(
                f'Integrity error adding tag {tag_id} to feature {feature_id}: {str(e)}'
            )
            raise
        except Exception as e:
            logger.error(f'Error adding tag {tag_id} to feature {feature_id}: {str(e)}')
            raise

    async def remove_tag_from_feature(
        self, db: AsyncSession, feature_id: UUID, tag_id: UUID
    ) -> bool:
        try:
            feature_tag = await self.get_by_ids(db, feature_id, tag_id)
            if not feature_tag:
                return False

            return await self.delete(db, id=feature_tag.id)
        except Exception as e:
            logger.error(
                f'Error removing tag {tag_id} from feature {feature_id}: {str(e)}'
            )
            raise

    async def get_by_ids(
        self, db: AsyncSession, feature_id: UUID, tag_id: UUID
    ) -> Optional[RoadmapActionItemTag]:
        try:
            stmt = select(RoadmapActionItemTag).where(
                and_(
                    RoadmapActionItemTag.feature_id == feature_id,
                    RoadmapActionItemTag.tag_id == tag_id,
                )
            )
            result = await db.execute(stmt)
            return result.scalar_one_or_none()
        except Exception as e:
            logger.error(f'Error fetching feature-tag relationship: {str(e)}')
            raise

    async def bulk_add_tags_to_feature(
        self, db: AsyncSession, feature_id: UUID, tag_ids: List[UUID]
    ) -> List[RoadmapActionItemTag]:
        try:
            existing_stmt = select(RoadmapActionItemTag.tag_id).where(
                RoadmapActionItemTag.feature_id == feature_id
            )
            existing_result = await db.execute(existing_stmt)
            existing_tag_ids = {row[0] for row in existing_result.all()}

            new_tag_ids = [tid for tid in tag_ids if tid not in existing_tag_ids]
            new_relationships = [
                RoadmapActionItemTag(feature_id=feature_id, tag_id=tag_id)
                for tag_id in new_tag_ids
            ]

            if new_relationships:
                db.add_all(new_relationships)
                await db.flush()
                await db.refresh(new_relationships)

            return new_relationships
        except IntegrityError as e:
            await db.rollback()
            logger.error(
                f'Integrity error bulk adding tags to feature {feature_id}: {str(e)}'
            )
            raise
        except Exception as e:
            await db.rollback()
            logger.error(f'Error bulk adding tags to feature {feature_id}: {str(e)}')
            raise


roadmap_feature_tag_repository = RoadmapActionItemTagRepository()


class RoadmapActionItemRepository(BaseRepository[RoadmapActionItem]):
    def __init__(self):
        super().__init__(RoadmapActionItem)

    async def get_with_tags(
        self, db: AsyncSession, id: UUID
    ) -> Optional[RoadmapActionItem]:
        try:
            stmt = (
                select(RoadmapActionItem)
                .where(RoadmapActionItem.id == id)
                .options(
                    selectinload(RoadmapActionItem.action_item_tags).selectinload(
                        RoadmapActionItemTag.tag
                    )
                )
            )
            result = await db.execute(stmt)
            return result.scalar_one_or_none()
        except Exception as e:
            logger.error(f'Error fetching feature {id} with tags: {str(e)}')
            raise

    async def get_by_column(
        self, db: AsyncSession, column_id: UUID
    ) -> List[RoadmapActionItem]:
        try:
            stmt = (
                select(RoadmapActionItem)
                .where(RoadmapActionItem.column_id == column_id)
                .order_by(RoadmapActionItem.order)
            )
            result = await db.execute(stmt)
            return list(result.scalars().all())
        except Exception as e:
            logger.error(f'Error fetching features for column {column_id}: {str(e)}')
            raise

    async def get_by_roadmap(
        self, db: AsyncSession, roadmap_id: UUID
    ) -> List[RoadmapActionItem]:
        try:
            stmt = (
                select(RoadmapActionItem)
                .join(RoadmapColumn, RoadmapActionItem.column_id == RoadmapColumn.id)
                .where(RoadmapColumn.roadmap_id == roadmap_id)
                .order_by(RoadmapColumn.order, RoadmapActionItem.order)
            )
            result = await db.execute(stmt)
            return list(result.scalars().all())
        except Exception as e:
            logger.error(f'Error fetching features for roadmap {roadmap_id}: {str(e)}')
            raise

    async def update_order(
        self,
        db: AsyncSession,
        feature_id: UUID,
        new_order: int,
        new_column_id: Optional[UUID] = None,
    ) -> RoadmapActionItem:
        try:
            update_data = {'order': new_order}
            if new_column_id:
                update_data['column_id'] = new_column_id

            return await self.update(db, id=feature_id, **update_data)
        except Exception as e:
            logger.error(f'Error updating order for feature {feature_id}: {str(e)}')
            raise

    async def bulk_update_order(
        self, db: AsyncSession, updates: List[Dict[str, Any]]
    ) -> List[RoadmapActionItem]:
        try:
            updated_features = []
            for update in updates:
                feature_id = update.get('id')
                new_order = update.get('order')
                new_column_id = update.get('column_id')

                if feature_id and new_order is not None:
                    update_data = {'order': new_order}
                    if new_column_id:
                        update_data['column_id'] = new_column_id

                    updated_feature = await self.update(
                        db, id=feature_id, **update_data
                    )
                    updated_features.append(updated_feature)

            return updated_features
        except Exception as e:
            logger.error(f'Error bulk updating feature orders: {str(e)}')
            raise

    async def get_next_order(self, db: AsyncSession, column_id: UUID) -> int:
        try:
            stmt = select(func.coalesce(func.max(RoadmapActionItem.order), -1)).where(
                RoadmapActionItem.column_id == column_id
            )
            result = await db.execute(stmt)
            max_order = result.scalar_one()
            return max_order + 1
        except Exception as e:
            logger.error(f'Error getting next order for column {column_id}: {str(e)}')
            raise


roadmap_feature_repository = RoadmapActionItemRepository()


class RoadmapColumnRepository(BaseRepository[RoadmapColumn]):
    def __init__(self):
        super().__init__(RoadmapColumn)

    async def get_with_features(
        self, db: AsyncSession, id: UUID
    ) -> Optional[RoadmapColumn]:
        try:
            stmt = (
                select(RoadmapColumn)
                .where(RoadmapColumn.id == id)
                .options(selectinload(RoadmapColumn.action_items))
            )
            result = await db.execute(stmt)
            return result.scalar_one_or_none()
        except Exception as e:
            logger.error(f'Error fetching column {id} with features: {str(e)}')
            raise

    async def get_with_features_and_tags(
        self, db: AsyncSession, id: UUID
    ) -> Optional[RoadmapColumn]:
        try:
            stmt = (
                select(RoadmapColumn)
                .where(RoadmapColumn.id == id)
                .options(
                    selectinload(RoadmapColumn.action_items)
                    .selectinload(RoadmapActionItem.action_item_tags)
                    .selectinload(RoadmapActionItemTag.tag)
                )
            )
            result = await db.execute(stmt)
            return result.scalar_one_or_none()
        except Exception as e:
            logger.error(f'Error fetching column {id} with features and tags: {str(e)}')
            raise

    async def get_by_roadmap(
        self, db: AsyncSession, roadmap_id: UUID
    ) -> List[RoadmapColumn]:
        try:
            stmt = (
                select(RoadmapColumn)
                .where(RoadmapColumn.roadmap_id == roadmap_id)
                .order_by(RoadmapColumn.order)
            )
            result = await db.execute(stmt)
            return list(result.scalars().all())
        except Exception as e:
            logger.error(f'Error fetching columns for roadmap {roadmap_id}: {str(e)}')
            raise

    async def get_by_name_and_roadmap(
        self, db: AsyncSession, roadmap_id: UUID, name: str
    ) -> Optional[RoadmapColumn]:
        try:
            stmt = select(RoadmapColumn).where(
                and_(RoadmapColumn.roadmap_id == roadmap_id, RoadmapColumn.name == name)
            )
            result = await db.execute(stmt)
            return result.scalar_one_or_none()
        except Exception as e:
            logger.error(
                f'Error fetching column {name} for roadmap {roadmap_id}: {str(e)}'
            )
            raise

    async def get_next_order(self, db: AsyncSession, roadmap_id: UUID) -> int:
        try:
            stmt = select(func.coalesce(func.max(RoadmapColumn.order), -1)).where(
                RoadmapColumn.roadmap_id == roadmap_id
            )
            result = await db.execute(stmt)
            max_order = result.scalar_one()
            return max_order + 1
        except Exception as e:
            logger.error(f'Error getting next order for roadmap {roadmap_id}: {str(e)}')
            raise

    async def reorder_columns(
        self, db: AsyncSession, roadmap_id: UUID, column_orders: List[Dict[str, Any]]
    ) -> List[RoadmapColumn]:
        try:
            updated_columns = []
            for order_info in column_orders:
                column_id = order_info.get('id')
                new_order = order_info.get('order')

                if column_id and new_order is not None:
                    updated_column = await self.update(
                        db, id=column_id, order=new_order
                    )
                    updated_columns.append(updated_column)

            return updated_columns
        except Exception as e:
            logger.error(f'Error reordering columns for roadmap {roadmap_id}: {str(e)}')
            raise


roadmap_column_repository = RoadmapColumnRepository()


class RoadmapRepository(BaseRepository[Roadmap]):
    def __init__(self):
        super().__init__(Roadmap)

    async def get_by_project_id(
        self, db: AsyncSession, project_id: UUID
    ) -> Optional[Roadmap]:
        try:
            stmt = (
                select(Roadmap)
                .where(Roadmap.project_id == project_id)
                .options(
                    selectinload(Roadmap.columns)
                    .selectinload(RoadmapColumn.action_items)
                    .selectinload(RoadmapActionItem.action_item_tags)
                    .selectinload(RoadmapActionItemTag.tag)
                )
                .options(selectinload(Roadmap.tags))
            )
            result = await db.execute(stmt)
            return result.scalar_one_or_none()
        except Exception as e:
            logger.error(f'Error fetching roadmap for project {project_id}: {str(e)}')
            raise

    async def get_by_public_slug(
        self, db: AsyncSession, public_slug: str
    ) -> Optional[Roadmap]:
        try:
            stmt = (
                select(Roadmap)
                .where(
                    and_(
                        Roadmap.public_slug == public_slug, Roadmap.is_public.is_(True)
                    )
                )
                .options(
                    selectinload(Roadmap.columns)
                    .selectinload(RoadmapColumn.action_items)
                    .selectinload(RoadmapActionItem.action_item_tags)
                    .selectinload(RoadmapActionItemTag.tag)
                )
                .options(selectinload(Roadmap.tags))
            )
            result = await db.execute(stmt)
            return result.scalar_one_or_none()
        except Exception as e:
            logger.error(
                f'Error fetching public roadmap by slug {public_slug}: {str(e)}'
            )
            raise

    async def get_by_subdomain(
        self, db: AsyncSession, subdomain: str
    ) -> Optional[Roadmap]:
        try:
            stmt = (
                select(Roadmap)
                .where(
                    and_(Roadmap.subdomain == subdomain, Roadmap.is_public.is_(True))
                )
                .options(
                    selectinload(Roadmap.columns)
                    .selectinload(RoadmapColumn.action_items)
                    .selectinload(RoadmapActionItem.action_item_tags)
                    .selectinload(RoadmapActionItemTag.tag)
                )
                .options(selectinload(Roadmap.tags))
            )
            result = await db.execute(stmt)
            return result.scalar_one_or_none()
        except Exception as e:
            logger.error(
                f'Error fetching public roadmap by subdomain {subdomain}: {str(e)}'
            )
            raise

    async def get_full_roadmap(
        self, db: AsyncSession, roadmap_id: UUID
    ) -> Optional[Roadmap]:
        try:
            stmt = (
                select(Roadmap)
                .where(Roadmap.id == roadmap_id)
                .options(
                    selectinload(Roadmap.columns)
                    .selectinload(RoadmapColumn.action_items)
                    .selectinload(RoadmapActionItem.action_item_tags)
                    .selectinload(RoadmapActionItemTag.tag)
                )
                .options(selectinload(Roadmap.tags))
            )
            result = await db.execute(stmt)
            return result.scalar_one_or_none()
        except Exception as e:
            logger.error(f'Error fetching full roadmap {roadmap_id}: {str(e)}')
            raise

    async def get_roadmaps_by_organization(
        self, db: AsyncSession, organization_id: UUID
    ) -> List[Roadmap]:
        try:
            stmt = (
                select(Roadmap)
                .join(Roadmap.project)
                .where(Roadmap.project.has(organization_id=organization_id))
                .options(
                    selectinload(Roadmap.columns).selectinload(
                        RoadmapColumn.action_items
                    )
                )
                .order_by(Roadmap.created_at.desc())
            )
            result = await db.execute(stmt)
            return list(result.scalars().all())
        except Exception as e:
            logger.error(
                f'Error fetching roadmaps for organization {organization_id}: {str(e)}'
            )
            raise

    async def search_roadmaps(
        self, db: AsyncSession, search_term: str, organization_id: Optional[UUID] = None
    ) -> List[Roadmap]:
        try:
            stmt = select(Roadmap).where(
                or_(
                    Roadmap.name.ilike(f'%{search_term}%'),
                    Roadmap.description.ilike(f'%{search_term}%')
                    if Roadmap.description
                    else False,
                )
            )

            if organization_id:
                stmt = stmt.join(Roadmap.project).where(
                    Roadmap.project.has(organization_id=organization_id)
                )

            stmt = stmt.order_by(Roadmap.name)
            result = await db.execute(stmt)
            return list(result.scalars().all())
        except Exception as e:
            logger.error(
                f"Error searching roadmaps with term '{search_term}': {str(e)}"
            )
            raise

    async def get_roadmap_stats(
        self, db: AsyncSession, roadmap_id: UUID
    ) -> Dict[str, Any]:
        try:
            feature_stats_stmt = (
                select(
                    RoadmapColumn.status,
                    func.count(RoadmapActionItem.id).label('count'),
                )
                .outerjoin(
                    RoadmapActionItem, RoadmapColumn.id == RoadmapActionItem.column_id
                )
                .where(RoadmapColumn.roadmap_id == roadmap_id)
                .group_by(RoadmapColumn.status)
            )

            feature_stats_result = await db.execute(feature_stats_stmt)
            feature_stats = {row[0]: row[1] for row in feature_stats_result.all()}

            total_votes_stmt = (
                select(func.sum(RoadmapActionItem.vote_count))
                .join(RoadmapColumn, RoadmapActionItem.column_id == RoadmapColumn.id)
                .where(RoadmapColumn.roadmap_id == roadmap_id)
            )

            total_votes_result = await db.execute(total_votes_stmt)
            total_votes = total_votes_result.scalar_one() or 0

            most_voted_stmt = (
                select(RoadmapActionItem)
                .join(RoadmapColumn, RoadmapActionItem.column_id == RoadmapColumn.id)
                .where(RoadmapColumn.roadmap_id == roadmap_id)
                .order_by(RoadmapActionItem.vote_count.desc())
                .limit(1)
            )

            most_voted_result = await db.execute(most_voted_stmt)
            most_voted_feature = most_voted_result.scalar_one()

            return {
                'feature_stats': feature_stats,
                'total_votes': total_votes,
                'most_voted_feature': most_voted_feature,
                'total_features': sum(feature_stats.values()),
            }
        except Exception as e:
            logger.error(f'Error getting stats for roadmap {roadmap_id}: {str(e)}')
            raise


roadmap_repository = RoadmapRepository()


class RoadmapAssignmentRepository(BaseRepository[RoadmapItemAssignment]):
    def __init__(self):
        super().__init__(RoadmapItemAssignment)

    async def get_by_feature(
        self, db: AsyncSession, feature_id: UUID
    ) -> List[RoadmapItemAssignment]:
        try:
            stmt = (
                select(RoadmapItemAssignment)
                .where(RoadmapItemAssignment.roadmap_feature_id == feature_id)
                .options(selectinload(RoadmapItemAssignment.user))
                .order_by(RoadmapItemAssignment.created_at)
            )
            result = await db.execute(stmt)
            return list(result.scalars().all())
        except Exception as e:
            logger.error(
                f'Error fetching assignments for feature {feature_id}: {str(e)}'
            )
            raise

    async def get_by_feature_and_user(
        self, db: AsyncSession, feature_id: UUID, user_id: UUID
    ) -> Optional[RoadmapItemAssignment]:
        try:
            stmt = select(RoadmapItemAssignment).where(
                and_(
                    RoadmapItemAssignment.roadmap_feature_id == feature_id,
                    RoadmapItemAssignment.user_id == user_id,
                )
            )
            result = await db.execute(stmt)
            return result.scalar_one_or_none()
        except Exception as e:
            logger.error(
                f'Error fetching assignment for feature {feature_id} and user {user_id}: {str(e)}'
            )
            raise

    async def get_by_user(
        self, db: AsyncSession, user_id: UUID
    ) -> List[RoadmapItemAssignment]:
        try:
            stmt = (
                select(RoadmapItemAssignment)
                .where(RoadmapItemAssignment.user_id == user_id)
                .options(
                    selectinload(RoadmapItemAssignment.roadmap_feature).selectinload(
                        RoadmapActionItem.column
                    )
                )
                .order_by(RoadmapItemAssignment.created_at.desc())
            )
            result = await db.execute(stmt)
            return list(result.scalars().all())
        except Exception as e:
            logger.error(f'Error fetching assignments for user {user_id}: {str(e)}')
            raise

    async def bulk_create_assignments(
        self, db: AsyncSession, assignments: List[Dict[str, Any]]
    ) -> List[RoadmapItemAssignment]:
        try:
            assignment_objects = [
                RoadmapItemAssignment(**assignment_data)
                for assignment_data in assignments
            ]
            db.add_all(assignment_objects)
            await db.flush()
            await db.refresh(assignment_objects)
            return assignment_objects
        except IntegrityError as e:
            await db.rollback()
            logger.error(f'Integrity error creating assignments: {str(e)}')
            raise
        except Exception as e:
            await db.rollback()
            logger.error(f'Error creating assignments: {str(e)}')
            raise


roadmap_assignment_repository = RoadmapAssignmentRepository()
