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
    RoadmapColumnRead,
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


class BaseRoadmapService:
    def __init__(self):
        self.organization_service = organization_service

    async def _validate_feature_access(
        self,
        db: AsyncSession,
        user_id: UUID,
        feature_id: UUID,
        required_role: str = 'Admin',
    ) -> tuple[Roadmap, RoadmapColumn, RoadmapFeature]:
        feature = await roadmap_feature_repository.get(db, id=feature_id)
        if not feature:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail='Feature not found'
            )

        column = await roadmap_column_repository.get(db, id=feature.column_id)
        if not column:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail='Column not found'
            )

        roadmap = await roadmap_repository.get(db, id=column.roadmap_id)
        if not roadmap:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail='Roadmap not found'
            )

        await self.organization_service.check_project_access(
            db, user_id, roadmap.project_id, required_role=required_role
        )

        return roadmap, column, feature

    async def _validate_column_access(
        self,
        db: AsyncSession,
        user_id: UUID,
        column_id: UUID,
        required_role: str = 'Admin',
    ) -> tuple[RoadmapColumn, Roadmap]:
        column = await roadmap_column_repository.get(db, id=column_id)
        if not column:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail='Column not found'
            )

        roadmap = await roadmap_repository.get(db, id=column.roadmap_id)
        if not roadmap:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail='Roadmap not found'
            )

        await self.organization_service.check_project_access(
            db, user_id, roadmap.project_id, required_role=required_role
        )

        return column, roadmap

    async def _validate_roadmap_ownership(
        self,
        db: AsyncSession,
        user_id: UUID,
        roadmap_id: UUID,
        required_role: str = 'Admin',
    ) -> Roadmap:
        roadmap = await roadmap_repository.get(db, id=roadmap_id)
        if not roadmap:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail='Roadmap not found'
            )

        await self.organization_service.check_project_access(
            db, user_id, roadmap.project_id, required_role=required_role
        )

        return roadmap

    async def _validate_tag_access(
        self,
        db: AsyncSession,
        user_id: UUID,
        tag_id: UUID,
        required_role: str = 'Admin',
    ) -> tuple[RoadmapTag, Roadmap]:
        tag = await roadmap_tag_repository.get(db, id=tag_id)
        if not tag:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail='Tag not found'
            )

        roadmap = await roadmap_repository.get(db, id=tag.roadmap_id)
        if not roadmap:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail='Roadmap not found'
            )

        await self.organization_service.check_project_access(
            db, user_id, roadmap.project_id, required_role=required_role
        )

        return tag, roadmap

    async def _dispatch_webhook_safely(
        self, webhook_type: str, feature_id: UUID, **kwargs
    ):
        try:
            from app.services.webhook_dispatcher import webhook_dispatcher

            if webhook_type == 'feature.created':
                await webhook_dispatcher.dispatch_feature_created(
                    kwargs.get('db'), kwargs.get('feature')
                )
            elif webhook_type == 'feature.updated':
                await webhook_dispatcher.dispatch_feature_updated(
                    kwargs.get('db'),
                    kwargs.get('feature'),
                    kwargs.get('updated_fields', {}),
                )
        except Exception as e:
            from app.core.logging import get_logger

            logger = get_logger(__name__)
            logger.warning(
                f'Failed to dispatch {webhook_type} webhook for feature {feature_id}: {str(e)}'
            )


class RoadmapService(BaseRoadmapService):
    def __init__(
        self,
        roadmap_repo: RoadmapRepository = roadmap_repository,
        column_repo: RoadmapColumnRepository = roadmap_column_repository,
        feature_repo: RoadmapFeatureRepository = roadmap_feature_repository,
        tag_repo: RoadmapTagRepository = roadmap_tag_repository,
        feature_tag_repo: RoadmapFeatureTagRepository = roadmap_feature_tag_repository,
        project_serv: ProjectService = project_service,
    ):
        super().__init__()
        self.roadmap_repo = roadmap_repo
        self.column_repo = column_repo
        self.feature_repo = feature_repo
        self.tag_repo = tag_repo
        self.feature_tag_repo = feature_tag_repo
        self.project_serv = project_serv

    async def get_roadmap_by_project_id(
        self, db: AsyncSession, user_id: UUID, project_id: UUID
    ) -> Optional[Roadmap]:
        await self.organization_service.check_project_access(db, user_id, project_id)
        return await self.roadmap_repo.get_by_project_id(db, project_id=project_id)

    async def create_roadmap(
        self, db: AsyncSession, user_id: UUID, roadmap_in: RoadmapCreate
    ) -> Roadmap:
        await self.organization_service.check_project_access(
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
        roadmap = await self._validate_roadmap_ownership(db, user_id, roadmap_id)

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
            db, project_id=roadmap.project_id
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
    ) -> RoadmapColumnRead:  # The return type is the Pydantic model
        await self._validate_roadmap_ownership(db, user_id, column_in.roadmap_id)

        existing_column = await self.column_repo.get_by_name_and_roadmap(
            db, roadmap_id=column_in.roadmap_id, name=column_in.name
        )
        if existing_column:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail='A column with this name already exists in this roadmap',
            )

        column_data = column_in.model_dump()
        if column_data.get('order') is None:
            next_order = await self.column_repo.get_next_order(db, column_in.roadmap_id)
            column_data['order'] = next_order

        try:
            new_column_orm = await self.column_repo.create(db, **column_data)

            pydantic_column = RoadmapColumnRead(
                id=new_column_orm.id,
                roadmap_id=new_column_orm.roadmap_id,
                name=new_column_orm.name,
                color=new_column_orm.color,
                status=new_column_orm.status,
                order=new_column_orm.order,
                features=[],
            )

            return pydantic_column

        except Exception as e:
            if 'uq_roadmap_column_name' in str(e):
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail='A column with this name already exists for this roadmap',
                )
            raise

    async def update_column(
        self,
        db: AsyncSession,
        user_id: UUID,
        column_id: UUID,
        column_in: RoadmapColumnUpdate,
    ) -> RoadmapColumn:
        column, _ = await self._validate_column_access(db, user_id, column_id)

        if column_in.name and column_in.name != column.name:
            existing_column = await self.column_repo.get_by_name_and_roadmap(
                db, roadmap_id=column.roadmap_id, name=column_in.name
            )
            if existing_column:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail='A column with this name already exists in this roadmap',
                )

        try:
            await self.column_repo.update(
                db, id=column_id, **column_in.model_dump(exclude_unset=True)
            )
        except Exception as e:
            if 'uq_roadmap_column_name' in str(e):
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail='A column with this name already exists in this roadmap',
                )
            raise

        updated_column = await self.column_repo.get_with_features(db, id=column_id)
        if not updated_column:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail='Could not find column after update',
            )
        return updated_column

    async def delete_column(self, db: AsyncSession, user_id: UUID, column_id: UUID):
        await self._validate_column_access(db, user_id, column_id)
        await self.column_repo.delete(db, id=column_id)
        return None

    async def create_feature(
        self, db: AsyncSession, user_id: UUID, feature_in: RoadmapFeatureCreate
    ) -> RoadmapFeature:
        column, _ = await self._validate_column_access(
            db, user_id, feature_in.column_id
        )

        tag_ids = feature_in.tag_ids or []
        feature_data = feature_in.model_dump(exclude={'tag_ids'})

        if feature_data.get('order') is None:
            next_order = await self.feature_repo.get_next_order(
                db, feature_in.column_id
            )
            feature_data['order'] = next_order

        feature = await self.feature_repo.create(db, **feature_data)

        if tag_ids:
            for tag_id in tag_ids:
                await self.feature_tag_repo.add_tag_to_feature(
                    db, feature_id=feature.id, tag_id=tag_id
                )

        feature = await self.feature_repo.get_with_tags(db, id=feature.id)

        await self._dispatch_webhook_safely(
            'feature.created', feature.id, db=db, feature=feature
        )

        return feature

    async def update_feature(
        self,
        db: AsyncSession,
        user_id: UUID,
        feature_id: UUID,
        feature_in: RoadmapFeatureUpdate,
    ) -> RoadmapFeature:
        _, _, feature = await self._validate_feature_access(db, user_id, feature_id)

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
            await self._dispatch_webhook_safely(
                'feature.updated',
                feature_id,
                db=db,
                feature=updated_feature,
                updated_fields=updated_fields,
            )

        return updated_feature

    async def delete_feature(self, db: AsyncSession, user_id: UUID, feature_id: UUID):
        await self._validate_feature_access(db, user_id, feature_id)
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

            await self.organization_service.check_project_access(
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
        """Upvote a feature (public endpoint)."""
        feature = await self.feature_repo.get(db, id=feature_id)
        if not feature:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail='Feature not found'
            )

        column = await self.column_repo.get(db, id=feature.column_id)
        if not column:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail='Column not found'
            )

        roadmap = await self.roadmap_repo.get(db, id=column.roadmap_id)
        if not roadmap:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail='Roadmap not found'
            )

        if not bool(roadmap.is_public):
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
        await self._validate_feature_access(db, user_id, feature_id)

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
        await self._validate_feature_access(db, user_id, feature_id)

        assignment = await roadmap_assignment_repository.get_by_feature_and_user(
            db, feature_id, assignee_user_id
        )
        if not assignment:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail='Assignment not found'
            )

        return await roadmap_assignment_repository.delete(db, assignment.id)

    async def get_feature_assignments(
        self, db: AsyncSession, user_id: UUID, feature_id: UUID
    ) -> List[RoadmapItemAssignment]:
        await self._validate_feature_access(
            db, user_id, feature_id, required_role='User'
        )
        return await roadmap_assignment_repository.get_by_feature(db, feature_id)

    async def create_tag(
        self, db: AsyncSession, user_id: UUID, tag_in: RoadmapTagCreate
    ) -> RoadmapTag:
        await self._validate_roadmap_ownership(db, user_id, tag_in.roadmap_id)

        existing_tag = await self.tag_repo.get_by_name(
            db, roadmap_id=tag_in.roadmap_id, name=tag_in.name
        )
        if existing_tag:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail='A tag with this name already exists for this roadmap',
            )

        try:
            return await self.tag_repo.create(db, **tag_in.model_dump())
        except Exception as e:
            if 'uq_roadmap_tag_name' in str(e):
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail='A tag with this name already exists for this roadmap',
                )
            raise

    async def get_tags_by_roadmap(
        self, db: AsyncSession, roadmap_id: UUID, user_id: Optional[UUID] = None
    ) -> List[RoadmapTag]:
        roadmap = await self.roadmap_repo.get(db, id=roadmap_id)
        if not roadmap:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail='Roadmap not found'
            )

        if user_id:
            await self.organization_service.check_project_access(
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
        tag, _ = await self._validate_tag_access(db, user_id, tag_id)

        if tag_in.name and tag_in.name != tag.name:
            existing_tag = await self.tag_repo.get_by_name(
                db, roadmap_id=tag.roadmap_id, name=tag_in.name
            )
            if existing_tag:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail='A tag with this name already exists for this roadmap',
                )

        try:
            await self.tag_repo.update(
                db, id=tag_id, **tag_in.model_dump(exclude_unset=True)
            )
        except Exception as e:
            if 'uq_roadmap_tag_name' in str(e):
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail='A tag with this name already exists for this roadmap',
                )
            raise

        return await self.tag_repo.get(db, id=tag_id)

    async def delete_tag(self, db: AsyncSession, user_id: UUID, tag_id: UUID) -> None:
        await self._validate_tag_access(db, user_id, tag_id)
        await self.tag_repo.delete(db, id=tag_id)


roadmap_service = RoadmapService()
