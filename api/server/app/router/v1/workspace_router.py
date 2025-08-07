from typing import Any
from fastapi import APIRouter, Depends, status

from sqlalchemy.ext.asyncio import AsyncSession
from app.db import get_db
from app.core.auth import get_current_user
from app.models.user import User
from app.schemas.workspace import WorkspaceCreate, WorkspaceRead
from app.services.workspace_service import workspace_service, WorkspaceService

router = APIRouter()

@router.post(
    "/",
    response_model=WorkspaceRead,
    status_code=status.HTTP_201_CREATED,
    summary="Create a workspace"
)
async def create_workspace(
    workspace_in: WorkspaceCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
    service: WorkspaceService = Depends(lambda: workspace_service)
) -> Any:
    """
    Create a new workspace for the authenticated user.
    Each user can only have one workspace.
    """
    workspace = await service.create_workspace(db, user=current_user, workspace_in=workspace_in)
    return workspace

@router.get(
    "/me",
    response_model=WorkspaceRead,
    summary="Get the current user's workspace"
)
async def get_my_workspace(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
    service: WorkspaceService = Depends(lambda: workspace_service)
) -> Any:
    """
    Retrieve the workspace associated with the currently authenticated user.
    """
    workspace = await service.get_workspace_by_user(db, user=current_user)
    return workspace