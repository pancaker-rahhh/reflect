from uuid import UUID
from typing import List, Dict, Any, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException, status
from app.models.roadmap_model import (
    Roadmap,
    RoadmapColumn,
    RoadmapFeature,
    RoadmapItemAssignment,
    RoadmapTag,
)
from app.repositories.roadmap_repository import (
    roadmap_repository,
    RoadmapRepository,
    roadmap_column_repository,
    RoadmapColumnRepository,
    roadmap_feature_repository,
    RoadmapFeatureRepository,
    roadmap_assignment_repository,
    roadmap_tag_repository,
    RoadmapTagRepository,
    roadmap_feature_tag_repository,
    RoadmapFeatureTagRepository,
)
from app.schemas.roadmap_schema import (
    RoadmapUpdate,
    RoadmapColumnCreate,
    RoadmapColumnUpdate,
    RoadmapFeatureCreate,
    RoadmapFeatureUpdate,
    RoadmapAssignmentCreate,
    RoadmapTagCreate,
    RoadmapTagUpdate,
    RoadmapCreate,
)
from app.services.project_service import project_service, ProjectService
from app.services.organization_service import organization_service
import re


class RoadmapService:
    def __init__(
        self,
        roadmap_repo: RoadmapRepository = roadmap_repository,
        column_repo: RoadmapColumnRepository = roadmap_column_repository,
        feature_repo: RoadmapFeatureRepository = roadmap_feature_repository,
        tag_repo: RoadmapTagRepository = roadmap_tag_repository,
        feature_tag_repo: RoadmapFeatureTagRepository = roadmap_feature_tag_repository,
        project_serv: ProjectService = project_service,
    ):
        self.roadmap_repo = roadmap_repo
        self.column_repo = column_repo
        self.feature_repo = feature_repo
        self.tag_repo = tag_repo
        self.feature_tag_repo = feature_tag_repo
        self.project_serv = project_serv

    async def get_roadmap_by_project_id(
        self, db: AsyncSession, user_id: UUID, project_id: UUID
    ) -> Optional[Roadmap]:
        await organization_service.check_project_access(db, user_id, project_id)
        return await self.roadmap_repo.get_by_project_id(db, project_id=project_id)

    async def create_roadmap(
        self, db: AsyncSession, user_id: UUID, roadmap_in: RoadmapCreate
    ) -> Roadmap:
        await organization_service.check_project_access(
            db, user_id, roadmap_in.project_id, required_role='Admin'
        )

        existing_roadmap = await self.roadmap_repo.get_by_project_id(
            db, project_id=roadmap_in.project_id
        )
        if existing_roadmap:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail='A roadmap for this project already exists',
            )

        new_roadmap = Roadmap(project_id=roadmap_in.project_id, name=roadmap_in.name)
        roadmap_data = {
            'project_id': new_roadmap.project_id,
            'public_slug': new_roadmap.public_slug,
            'name': new_roadmap.name,
        }
        created_roadmap = await self.roadmap_repo.create(db, **roadmap_data)

        return await self.roadmap_repo.get_by_project_id(
            db, project_id=created_roadmap.project_id
        )

    async def validate_subdomain_format(self, subdomain: str) -> bool:
        if not subdomain:
            return True

        pattern = r'^[a-z0-9\-]+$'
        return bool(re.match(pattern, subdomain))

    async def check_subdomain_uniqueness(
        self, db: AsyncSession, subdomain: str, roadmap_id: Optional[UUID] = None
    ) -> bool:
        if not subdomain:
            return True

        existing_roadmap = await self.roadmap_repo.get_by_subdomain(
            db, subdomain=subdomain
        )
        if not existing_roadmap:
            return True

        if roadmap_id and existing_roadmap.id == roadmap_id:
            return True

        return False

    async def update_roadmap(
        self,
        db: AsyncSession,
        user_id: UUID,
        roadmap_id: UUID,
        roadmap_in: RoadmapUpdate,
    ) -> Roadmap:
        roadmap = await self.roadmap_repo.get(db, id=roadmap_id)
        if not roadmap:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail='Roadmap not found'
            )

        project_id = roadmap.project_id
        await organization_service.check_project_access(
            db, user_id, project_id, required_role='Admin'
        )

        if roadmap_in.subdomain is not None:
            if not await self.validate_subdomain_format(roadmap_in.subdomain):
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail='Invalid subdomain format. Use only lowercase letters, numbers, and hyphens.',
                )

            if not await self.check_subdomain_uniqueness(
                db, roadmap_in.subdomain, roadmap_id
            ):
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail='Subdomain is already in use',
                )

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

    async def get_public_roadmap_by_subdomain(
        self, db: AsyncSession, subdomain: str
    ) -> Roadmap:
        roadmap = await self.roadmap_repo.get_by_subdomain(db, subdomain=subdomain)
        if not roadmap:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail='Public roadmap not found'
            )
        if not roadmap.is_public:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN, detail='Roadmap is not public'
            )
        return roadmap

    async def create_column(
        self, db: AsyncSession, user_id: UUID, column_in: RoadmapColumnCreate
    ) -> RoadmapColumn:
        roadmap = await self.roadmap_repo.get(db, id=column_in.roadmap_id)
        if not roadmap:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail='Roadmap not found'
            )
        await organization_service.check_project_access(
            db, user_id, roadmap.project_id, required_role='Admin'
        )
        return await self.column_repo.create(db, **column_in.model_dump())

    async def update_column(
        self,
        db: AsyncSession,
        user_id: UUID,
        column_id: UUID,
        column_in: RoadmapColumnUpdate,
    ) -> RoadmapColumn:
        column = await self.column_repo.get(db, id=column_id)
        if not column:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail='Column not found'
            )
        roadmap = await self.roadmap_repo.get(db, id=column.roadmap_id)
        if not roadmap:
            raise HTTPException(status_code=404, detail='Roadmap not found')
        await organization_service.check_project_access(
            db, user_id, roadmap.project_id, required_role='Admin'
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

    async def delete_column(self, db: AsyncSession, user_id: UUID, column_id: UUID):
        column = await self.column_repo.get(db, id=column_id)
        if not column:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail='Column not found'
            )
        roadmap = await self.roadmap_repo.get(db, id=column.roadmap_id)
        if not roadmap:
            raise HTTPException(status_code=404, detail='Roadmap not found')
        await organization_service.check_project_access(
            db, user_id, roadmap.project_id, required_role='Admin'
        )
        await self.column_repo.delete(db, id=column_id)
        return None

    async def create_feature(
        self, db: AsyncSession, user_id: UUID, feature_in: RoadmapFeatureCreate
    ) -> RoadmapFeature:
        column = await self.column_repo.get(db, id=feature_in.column_id)
        if not column:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail='Column not found'
            )
        roadmap = await self.roadmap_repo.get(db, id=column.roadmap_id)
        if not roadmap:
            raise HTTPException(status_code=404, detail='Roadmap not found')
        await organization_service.check_project_access(
            db, user_id, roadmap.project_id, required_role='Admin'
        )

        tag_ids = feature_in.tag_ids or []
        feature_data = feature_in.model_dump(exclude={'tag_ids'})

        feature = await self.feature_repo.create(db, **feature_data)

        if tag_ids:
            for tag_id in tag_ids:
                await self.feature_tag_repo.add_tag_to_feature(
                    db, feature_id=feature.id, tag_id=tag_id
                )

        feature = await self.feature_repo.get_with_tags(db, id=feature.id)

        # Dispatch webhook for new feature
        try:
            from app.services.webhook_dispatcher import webhook_dispatcher

            await webhook_dispatcher.dispatch_feature_created(db, feature)
        except Exception as e:
            from app.core.logging import get_logger

            logger = get_logger(__name__)
            logger.warning(
                f'Failed to dispatch feature.created webhook for feature {feature.id}: {str(e)}'
            )

        return feature

    async def update_feature(
        self,
        db: AsyncSession,
        user_id: UUID,
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
        if not roadmap:
            raise HTTPException(status_code=404, detail='Roadmap not found')
        await organization_service.check_project_access(
            db, user_id, roadmap.project_id, required_role='Admin'
        )

        tag_ids = feature_in.tag_ids
        updated_fields = feature_in.model_dump(exclude_unset=True, exclude={'tag_ids'})

        updated_feature = await self.feature_repo.update(
            db, id=feature_id, **updated_fields
        )

        if tag_ids is not None:
            current_tags = await self.feature_tag_repo.get_tags_for_feature(
                db, feature_id
            )
            current_tag_ids = [tag.id for tag in current_tags]

            for tag_id in current_tag_ids:
                if tag_id not in tag_ids:
                    await self.feature_tag_repo.remove_tag_from_feature(
                        db, feature_id=feature_id, tag_id=tag_id
                    )

            for tag_id in tag_ids:
                if tag_id not in current_tag_ids:
                    await self.feature_tag_repo.add_tag_to_feature(
                        db, feature_id=feature_id, tag_id=tag_id
                    )

        updated_feature = await self.feature_repo.get_with_tags(db, id=feature_id)

        if updated_feature:
            try:
                from app.services.webhook_dispatcher import webhook_dispatcher

                await webhook_dispatcher.dispatch_feature_updated(
                    db, updated_feature, updated_fields
                )
            except Exception as e:
                from app.core.logging import get_logger

                logger = get_logger(__name__)
                logger.warning(
                    f'Failed to dispatch feature.updated webhook for feature {feature_id}: {str(e)}'
                )

        return updated_feature

    async def delete_feature(self, db: AsyncSession, user_id: UUID, feature_id: UUID):
        feature = await self.feature_repo.get(db, id=feature_id)
        if not feature:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail='Feature not found'
            )
        column = await self.column_repo.get(db, id=feature.column_id)
        roadmap = await self.roadmap_repo.get(db, id=column.roadmap_id)
        if not roadmap:
            raise HTTPException(status_code=404, detail='Roadmap not found')
        await organization_service.check_project_access(
            db, user_id, roadmap.project_id, required_role='Admin'
        )
        await self.feature_repo.delete(db, id=feature_id)
        return None

    async def update_features_order(
        self, db: AsyncSession, user_id: UUID, updates: List[Dict[str, Any]]
    ):
        for update in updates:
            feature_id = update.get('id')
            new_order = update.get('order')
            new_column_id = update.get('column_id')

            if not feature_id:
                continue

            feature = await self.feature_repo.get(db, id=UUID(feature_id))
            if not feature:
                continue

            column = await self.column_repo.get(db, id=feature.column_id)
            if not column:
                continue
            roadmap = await self.roadmap_repo.get(db, id=column.roadmap_id)
            if not roadmap:
                continue
            await organization_service.check_project_access(
                db, user_id, roadmap.project_id, required_role='Admin'
            )

            update_data = {'order': new_order}
            if new_column_id:
                update_data['column_id'] = new_column_id

            await self.feature_repo.update(db, id=UUID(feature_id), **update_data)
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
        if not column:
            raise HTTPException(status_code=404, detail='Column not found')
        roadmap = await self.roadmap_repo.get(db, id=column.roadmap_id)
        if not roadmap:
            raise HTTPException(status_code=404, detail='Roadmap not found')
        if not bool(roadmap.is_public):  # type: ignore
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail='This roadmap is not public',
            )

        feature.vote_count += 1
        return await self.feature_repo.update(
            db, id=feature_id, vote_count=feature.vote_count
        )

    async def assign_user_to_feature(
        self,
        db: AsyncSession,
        user_id: UUID,
        feature_id: UUID,
        assignee_user_id: UUID,
        role: str = 'contributor',
    ) -> RoadmapItemAssignment:
        feature = await self.feature_repo.get(db, id=feature_id)
        if not feature:
            raise HTTPException(status_code=404, detail='Feature not found')

        column = await self.column_repo.get(db, id=feature.column_id)
        if not column:
            raise HTTPException(status_code=404, detail='Column not found')
        roadmap = await self.roadmap_repo.get(db, id=column.roadmap_id)
        if not roadmap:
            raise HTTPException(status_code=404, detail='Roadmap not found')

        await organization_service.check_project_access(
            db, user_id, roadmap.project_id, required_role='Admin'
        )

        assignment_data = RoadmapAssignmentCreate(
            roadmap_feature_id=feature_id,
            user_id=assignee_user_id,
            role=role,
            assigned_by=user_id,
        )

        return await roadmap_assignment_repository.create(
            db, **assignment_data.model_dump()
        )

    async def remove_user_from_feature(
        self, db: AsyncSession, user_id: UUID, feature_id: UUID, assignee_user_id: UUID
    ) -> bool:
        feature = await self.feature_repo.get(db, id=feature_id)
        if not feature:
            raise HTTPException(status_code=404, detail='Feature not found')

        column = await self.column_repo.get(db, id=feature.column_id)
        if not column:
            raise HTTPException(status_code=404, detail='Column not found')
        roadmap = await self.roadmap_repo.get(db, id=column.roadmap_id)
        if not roadmap:
            raise HTTPException(status_code=404, detail='Roadmap not found')

        await organization_service.check_project_access(
            db, user_id, roadmap.project_id, required_role='Admin'
        )

        assignment = await roadmap_assignment_repository.get_by_feature_and_user(
            db, feature_id, assignee_user_id
        )
        if not assignment:
            raise HTTPException(status_code=404, detail='Assignment not found')

        return await roadmap_assignment_repository.delete(db, assignment.id)

    async def get_feature_assignments(
        self, db: AsyncSession, user_id: UUID, feature_id: UUID
    ) -> List[RoadmapItemAssignment]:
        feature = await self.feature_repo.get(db, id=feature_id)
        if not feature:
            raise HTTPException(status_code=404, detail='Feature not found')

        column = await self.column_repo.get(db, id=feature.column_id)
        if not column:
            raise HTTPException(status_code=404, detail='Column not found')
        roadmap = await self.roadmap_repo.get(db, id=column.roadmap_id)
        if not roadmap:
            raise HTTPException(status_code=404, detail='Roadmap not found')

        await organization_service.check_project_access(db, user_id, roadmap.project_id)

        return await roadmap_assignment_repository.get_by_feature(db, feature_id)

    async def create_tag(
        self, db: AsyncSession, user_id: UUID, tag_in: RoadmapTagCreate
    ) -> RoadmapTag:
        roadmap = await self.roadmap_repo.get(db, id=tag_in.roadmap_id)
        if not roadmap:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail='Roadmap not found'
            )

        await organization_service.check_project_access(
            db, user_id, roadmap.project_id, required_role='Admin'
        )

        existing_tag = await self.tag_repo.get_by_name(
            db, roadmap_id=tag_in.roadmap_id, name=tag_in.name
        )
        if existing_tag:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail='A tag with this name already exists for this roadmap',
            )

        return await self.tag_repo.create(db, **tag_in.model_dump())

    async def get_tags_by_roadmap(
        self, db: AsyncSession, roadmap_id: UUID, user_id: Optional[UUID] = None
    ) -> List[RoadmapTag]:
        roadmap = await self.roadmap_repo.get(db, id=roadmap_id)
        if not roadmap:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail='Roadmap not found'
            )

        if user_id:
            await organization_service.check_project_access(
                db, user_id, roadmap.project_id
            )
        elif not roadmap.is_public:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN, detail='Roadmap is not public'
            )

        return await self.tag_repo.get_by_roadmap(db, roadmap_id=roadmap_id)

    async def update_tag(
        self, db: AsyncSession, user_id: UUID, tag_id: UUID, tag_in: RoadmapTagUpdate
    ) -> RoadmapTag:
        tag = await self.tag_repo.get(db, id=tag_id)
        if not tag:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail='Tag not found'
            )

        roadmap = await self.roadmap_repo.get(db, id=tag.roadmap_id)
        if not roadmap:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail='Roadmap not found'
            )

        await organization_service.check_project_access(
            db, user_id, roadmap.project_id, required_role='Admin'
        )

        if tag_in.name and tag_in.name != tag.name:
            existing_tag = await self.tag_repo.get_by_name(
                db, roadmap_id=tag.roadmap_id, name=tag_in.name
            )
            if existing_tag:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail='A tag with this name already exists for this roadmap',
                )

        await self.tag_repo.update(
            db, id=tag_id, **tag_in.model_dump(exclude_unset=True)
        )

        return await self.tag_repo.get(db, id=tag_id)

    async def delete_tag(self, db: AsyncSession, user_id: UUID, tag_id: UUID) -> None:
        tag = await self.tag_repo.get(db, id=tag_id)
        if not tag:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail='Tag not found'
            )

        roadmap = await self.roadmap_repo.get(db, id=tag.roadmap_id)
        if not roadmap:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail='Roadmap not found'
            )

        await organization_service.check_project_access(
            db, user_id, roadmap.project_id, required_role='Admin'
        )

        await self.tag_repo.delete(db, id=tag_id)


roadmap_service = RoadmapService()
