from typing import Any
from uuid import UUID
from fastapi import APIRouter, Depends, status, Query, Response

from sqlalchemy.ext.asyncio import AsyncSession
from app.db import get_db
from app.core.auth import get_current_user, get_current_token_data
from app.schemas.auth_schema import TokenData
from app.schemas.project_schema import (
    ProjectCreate,
    ProjectUpdate,
    ProjectRead,
    PaginatedProjectRead,
    ProjectSettings,
    ProjectSettingsUpdate,
)
from app.services.project_service import project_service, ProjectService
from app.schemas.roadmap_schema import RoadmapRead
from app.services.roadmap_service import roadmap_service, RoadmapService

router = APIRouter(prefix="/projects", tags=["Projects"])


@router.post(
    '/',
    response_model=ProjectRead,
    status_code=status.HTTP_201_CREATED,
)
async def create_project(
    project_in: ProjectCreate,
    db: AsyncSession = Depends(get_db),
    current_user: TokenData = Depends(get_current_token_data),
    service: ProjectService = Depends(lambda: project_service),
) -> Any:
    project = await service.create_project(db, user_id=UUID(current_user.sub), project_in=project_in)
    return ProjectRead.model_validate(project)


@router.get(
    '/',
    response_model=PaginatedProjectRead,
)
async def list_projects(
    organization_id: UUID,
    page: int = Query(1, ge=1, description='Page number'),
    size: int = Query(20, ge=1, le=100, description='Page size'),
    db: AsyncSession = Depends(get_db),
    current_user: TokenData = Depends(get_current_token_data),
    service: ProjectService = Depends(lambda: project_service),
) -> Any:
    projects, total = await service.list_projects_by_organization(
        db, user_id=UUID(current_user.sub), organization_id=organization_id, page=page, size=size
    )
    project_reads = [ProjectRead.model_validate(project) for project in projects]
    return PaginatedProjectRead(total=total, page=page, size=size, items=project_reads)


@router.get(
    '/{project_id}',
    response_model=ProjectRead,
)
async def get_project(
    project_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: TokenData = Depends(get_current_token_data),
    service: ProjectService = Depends(lambda: project_service),
) -> Any:
    project = await service.get_project_and_check_access(
        db, user_id=UUID(current_user.sub), project_id=project_id
    )
    return ProjectRead.model_validate(project)


@router.put(
    '/{project_id}',
    response_model=ProjectRead,
)
async def update_project(
    project_id: UUID,
    project_in: ProjectUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: TokenData = Depends(get_current_token_data),
    service: ProjectService = Depends(lambda: project_service),
) -> Any:
    project = await service.update_project(
        db, user_id=UUID(current_user.sub), project_id=project_id, project_in=project_in
    )
    return ProjectRead.model_validate(project)


@router.get(
    '/{project_id}/settings',
    response_model=ProjectSettings,
)
async def get_project_settings(
    project_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: TokenData = Depends(get_current_token_data),
    service: ProjectService = Depends(lambda: project_service),
) -> Any:
    settings = await service.get_project_settings(
        db, user_id=UUID(current_user.sub), project_id=project_id
    )
    return settings


@router.put(
    '/{project_id}/settings',
    response_model=ProjectSettings,
)
async def update_project_settings(
    project_id: UUID,
    settings_in: ProjectSettingsUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: TokenData = Depends(get_current_token_data),
    service: ProjectService = Depends(lambda: project_service),
) -> Any:
    settings = await service.update_project_settings(
        db, user_id=UUID(current_user.sub), project_id=project_id, settings_in=settings_in
    )
    return settings


@router.delete(
    '/{project_id}',
    status_code=status.HTTP_204_NO_CONTENT,
)
async def delete_project(
    project_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: TokenData = Depends(get_current_token_data),
    service: ProjectService = Depends(lambda: project_service),
):
    await service.delete_project(db, user_id=UUID(current_user.sub), project_id=project_id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.get(
    '/{project_id}/roadmap',
    response_model=RoadmapRead,
    tags=['Roadmap'],
)
async def get_project_roadmap(
    project_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: TokenData = Depends(get_current_token_data),
    service: RoadmapService = Depends(lambda: roadmap_service),
) -> Any:
    return await service.get_or_create_roadmap(
        db, user_id=UUID(current_user.sub), project_id=project_id
    )
