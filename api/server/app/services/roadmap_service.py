from uuid import UUID
from typing import List, Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException, status

from app.models.user_model import User
from app.models.roadmap_model import Roadmap, RoadmapColumn, RoadmapFeature
from app.repositories.roadmap_repository import (
    roadmap_repository,
    RoadmapRepository,
    roadmap_column_repository,
    RoadmapColumnRepository,
    roadmap_feature_repository,
    RoadmapFeatureRepository,
)
from app.schemas.roadmap_schema import (
    RoadmapUpdate,
    RoadmapColumnCreate,
    RoadmapColumnUpdate,
    RoadmapFeatureCreate,
    RoadmapFeatureUpdate,
)
from app.services.project_service import project_service, ProjectService


class RoadmapService:
    def __init__(
        self,
        roadmap_repo: RoadmapRepository = roadmap_repository,
        column_repo: RoadmapColumnRepository = roadmap_column_repository,
        feature_repo: RoadmapFeatureRepository = roadmap_feature_repository,
        project_serv: ProjectService = project_service,
    ):
        self.roadmap_repo = roadmap_repo
        self.column_repo = column_repo
        self.feature_repo = feature_repo
        self.project_serv = project_serv

    async def get_or_create_roadmap(
        self, db: AsyncSession, user: User, project_id: UUID
    ) -> Roadmap:
        await self.project_serv.get_project_and_check_access(db, user, project_id)
        roadmap = await self.roadmap_repo.get_by_project_id(db, project_id=project_id)
        if not roadmap:
            new_roadmap = Roadmap(project_id=project_id)
            roadmap_data = {
                'project_id': new_roadmap.project_id,
                'public_slug': new_roadmap.public_slug,
            }
            roadmap = await self.roadmap_repo.create(db, **roadmap_data)

            default_columns = ['Planned', 'In Progress', 'Launched']
            for i, name in enumerate(default_columns):
                col_data = {'roadmap_id': roadmap.id, 'name': name, 'order': i}
                await self.column_repo.create(db, **col_data)

            roadmap = await self.roadmap_repo.get_by_project_id(
                db, project_id=project_id
            )

        return roadmap

    async def update_roadmap(
        self, db: AsyncSession, user: User, roadmap_id: UUID, roadmap_in: RoadmapUpdate
    ) -> Roadmap:
        roadmap = await self.roadmap_repo.get(db, id=roadmap_id)
        if not roadmap:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail='Roadmap not found'
            )

        project_id = roadmap.project_id
        await self.project_serv.get_project_and_check_access(db, user, project_id)

        await self.roadmap_repo.update(
            db, id=roadmap_id, **roadmap_in.model_dump(exclude_unset=True)
        )

        updated_roadmap = await self.roadmap_repo.get_by_project_id(
            db, project_id=project_id
        )
        if not updated_roadmap:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail='Could not find roadmap after update',
            )

        return updated_roadmap

    async def get_public_roadmap(self, db: AsyncSession, public_slug: str) -> Roadmap:
        roadmap = await self.roadmap_repo.get_by_public_slug(
            db, public_slug=public_slug
        )
        if not roadmap:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail='Public roadmap not found'
            )
        return roadmap

    async def create_column(
        self, db: AsyncSession, user: User, column_in: RoadmapColumnCreate
    ) -> RoadmapColumn:
        roadmap = await self.roadmap_repo.get(db, id=column_in.roadmap_id)
        if not roadmap:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail='Roadmap not found'
            )
        await self.project_serv.get_project_and_check_access(
            db, user, roadmap.project_id
        )
        return await self.column_repo.create(db, **column_in.model_dump())

    async def update_column(
        self,
        db: AsyncSession,
        user: User,
        column_id: UUID,
        column_in: RoadmapColumnUpdate,
    ) -> RoadmapColumn:
        column = await self.column_repo.get(db, id=column_id)
        if not column:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail='Column not found'
            )
        roadmap = await self.roadmap_repo.get(db, id=column.roadmap_id)
        await self.project_serv.get_project_and_check_access(
            db, user, roadmap.project_id
        )
        await self.column_repo.update(
            db, id=column_id, **column_in.model_dump(exclude_unset=True)
        )
        updated_column = await self.column_repo.get_with_features(db, id=column_id)
        if not updated_column:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail='Could not find column after update',
            )
        return updated_column

    async def delete_column(self, db: AsyncSession, user: User, column_id: UUID):
        column = await self.column_repo.get(db, id=column_id)
        if not column:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail='Column not found'
            )
        roadmap = await self.roadmap_repo.get(db, id=column.roadmap_id)
        await self.project_serv.get_project_and_check_access(
            db, user, roadmap.project_id
        )
        await self.column_repo.delete(db, id=column_id)
        return None

    async def create_feature(
        self, db: AsyncSession, user: User, feature_in: RoadmapFeatureCreate
    ) -> RoadmapFeature:
        column = await self.column_repo.get(db, id=feature_in.column_id)
        if not column:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail='Column not found'
            )
        roadmap = await self.roadmap_repo.get(db, id=column.roadmap_id)
        await self.project_serv.get_project_and_check_access(
            db, user, roadmap.project_id
        )
        return await self.feature_repo.create(db, **feature_in.model_dump())

    async def update_feature(
        self,
        db: AsyncSession,
        user: User,
        feature_id: UUID,
        feature_in: RoadmapFeatureUpdate,
    ) -> RoadmapFeature:
        feature = await self.feature_repo.get(db, id=feature_id)
        if not feature:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail='Feature not found'
            )
        column = await self.column_repo.get(db, id=feature.column_id)
        roadmap = await self.roadmap_repo.get(db, id=column.roadmap_id)
        await self.project_serv.get_project_and_check_access(
            db, user, roadmap.project_id
        )
        return await self.feature_repo.update(
            db, id=feature_id, **feature_in.model_dump(exclude_unset=True)
        )

    async def delete_feature(self, db: AsyncSession, user: User, feature_id: UUID):
        feature = await self.feature_repo.get(db, id=feature_id)
        if not feature:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail='Feature not found'
            )
        column = await self.column_repo.get(db, id=feature.column_id)
        roadmap = await self.roadmap_repo.get(db, id=column.roadmap_id)
        await self.project_serv.get_project_and_check_access(
            db, user, roadmap.project_id
        )
        await self.feature_repo.delete(db, id=feature_id)
        return None

    async def update_features_order(
        self, db: AsyncSession, user: User, updates: List[Dict[str, Any]]
    ):
        for update in updates:
            feature_id = update.get('id')
            new_order = update.get('order')
            new_column_id = update.get('column_id')

            feature = await self.feature_repo.get(db, id=feature_id)
            if not feature:
                continue

            column = await self.column_repo.get(db, id=feature.column_id)
            roadmap = await self.roadmap_repo.get(db, id=column.roadmap_id)
            await self.project_serv.get_project_and_check_access(
                db, user, roadmap.project_id
            )

            update_data = {'order': new_order}
            if new_column_id:
                update_data['column_id'] = new_column_id

            await self.feature_repo.update(db, id=feature_id, **update_data)
        return {'status': 'success'}

    async def upvote_feature(
        self, db: AsyncSession, feature_id: UUID
    ) -> RoadmapFeature:
        feature = await self.feature_repo.get(db, id=feature_id)
        if not feature:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail='Feature not found'
            )

        column = await self.column_repo.get(db, id=feature.column_id)
        roadmap = await self.roadmap_repo.get(db, id=column.roadmap_id)
        if not roadmap.is_public:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail='This roadmap is not public',
            )

        feature.vote_count += 1
        return await self.feature_repo.update(
            db, id=feature_id, vote_count=feature.vote_count
        )


roadmap_service = RoadmapService()
