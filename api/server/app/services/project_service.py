from typing import Tuple, List
from uuid import UUID
import logging

from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException, status

from app.models.user import User
from app.models.project import Project
from app.repositories.project import project_repository, ProjectRepository
from app.schemas.project import (
    ProjectCreate,
    ProjectUpdate,
    ProjectSettings,
    ProjectSettingsUpdate,
)


async def _check_workspace_access(db: AsyncSession, user: User, workspace_id: UUID):
    # TODO: Implement real logic. For now, we'll assume the user has access
    # to any workspace they are trying to interact with.
    # Example logic:
    # from app.repositories.workspace import workspace_member_repository
    # member = await workspace_member_repository.get_by_user_and_workspace(
    #     db, user_id=user.id, workspace_id=workspace_id
    # )
    # if not member:
    #     raise HTTPException(status_code=403, detail="Not authorized for this workspace")
    logging.warning(
        f'Workspace access check for user {user.id} and workspace {workspace_id} is currently a placeholder.'
    )
    return True


class ProjectService:
    def __init__(self, repository: ProjectRepository = project_repository):
        self.repository = repository

    async def get_project_and_check_access(
        self, db: AsyncSession, user: User, project_id: UUID
    ) -> Project:
        project = await self.repository.get(db, id=project_id)
        if not project:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)

        await _check_workspace_access(db, user, project.workspace_id)

        return project

    async def list_projects_by_workspace(
        self, db: AsyncSession, user: User, workspace_id: UUID, page: int, size: int
    ) -> Tuple[List[Project], int]:
        await _check_workspace_access(db, user, workspace_id)

        skip = (page - 1) * size
        return await self.repository.get_multi_by_workspace(
            db, workspace_id=workspace_id, skip=skip, limit=size
        )

    async def create_project(
        self, db: AsyncSession, user: User, project_in: ProjectCreate
    ) -> Project:
        await _check_workspace_access(db, user, project_in.workspace_id)

        base_slug = Project().generate_slug(project_in.name)
        unique_slug = base_slug
        suffix = 1
        while await self.repository.get_by_workspace_and_slug(
            db, project_in.workspace_id, unique_slug
        ):
            unique_slug = f'{base_slug}-{suffix}'
            suffix += 1
            if suffix > 10:
                raise HTTPException(status_code=400)

        project_data = project_in.model_dump()

        return await self.repository.create(db, **project_data)

    async def update_project(
        self, db: AsyncSession, user: User, project_id: UUID, project_in: ProjectUpdate
    ) -> Project:
        await self.get_project_and_check_access(db, user, project_id)
        update_data = project_in.model_dump(exclude_unset=True)
        updated_project = await self.repository.update(db, id=project_id, **update_data)
        if not updated_project:
            raise HTTPException(status.HTTP_404_NOT_FOUND)

        return updated_project

    async def get_project_settings(
        self, db: AsyncSession, user: User, project_id: UUID
    ) -> dict:
        project = await self.get_project_and_check_access(db, user, project_id)
        return ProjectSettings.model_validate(project.settings or {}).model_dump()

    async def update_project_settings(
        self,
        db: AsyncSession,
        user: User,
        project_id: UUID,
        settings_in: ProjectSettingsUpdate,
    ) -> dict:
        project = await self.get_project_and_check_access(db, user, project_id)

        update_data = settings_in.model_dump(exclude_unset=True)
        current_settings = (
            project.settings.copy() if isinstance(project.settings, dict) else {}
        )
        current_settings.update(update_data)
        validated_settings = ProjectSettings.model_validate(
            current_settings
        ).model_dump()
        await self.repository.update(db, id=project_id, settings=validated_settings)

        return validated_settings

    async def delete_project(
        self, db: AsyncSession, user: User, project_id: UUID
    ) -> Project:
        project_to_delete = await self.get_project_and_check_access(
            db, user, project_id
        )
        return await self.repository.soft_delete(db, project=project_to_delete)


project_service = ProjectService()
