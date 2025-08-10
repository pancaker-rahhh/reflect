import re
from typing import Optional, Dict, Any
from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from sqlalchemy.orm import selectinload
from fastapi import HTTPException, status

from app.models.workspace_model import Workspace
from app.repositories.base_repository import BaseRepository
from app.core.logging import get_logger

logger = get_logger(__name__)


class WorkspaceRepository(BaseRepository[Workspace]):
    MAX_WORKSPACES_PER_USER = 5
    
    def __init__(self):
        super().__init__(Workspace)

    async def get_by_user_id(
        self, db: AsyncSession, user_id: UUID
    ) -> Optional[Workspace]:
        stmt = select(Workspace).where(Workspace.user_id == user_id)
        result = await db.execute(stmt)
        return result.scalar_one_or_none()

    async def get_by_slug(self, db: AsyncSession, slug: str) -> Optional[Workspace]:
        stmt = select(Workspace).where(Workspace.slug == slug)
        result = await db.execute(stmt)
        return result.scalar_one_or_none()

    async def get_with_projects(
        self, db: AsyncSession, workspace_id: UUID
    ) -> Optional[Workspace]:
        stmt = (
            select(Workspace)
            .options(selectinload(Workspace.projects))
            .where(Workspace.id == workspace_id)
        )
        result = await db.execute(stmt)
        return result.scalar_one_or_none()
    
    async def count_user_workspaces(self, db: AsyncSession, user_id: UUID) -> int:
        stmt = select(func.count()).select_from(Workspace).where(
            Workspace.user_id == user_id,
            Workspace.deleted_at.is_(None)
        )
        result = await db.execute(stmt)
        return result.scalar() or 0
    
    def validate_workspace_name(self, name: str) -> str:
        if not name or not name.strip():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Workspace name cannot be empty"
            )

        if len(name) > 255:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Workspace name cannot exceed 255 characters"
            )

        if re.search(r'[<>"\'\/]|javascript:|data:|vbscript:', name, re.IGNORECASE):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Workspace name contains invalid characters"
            )

        sanitized_name = name.strip()

        if not re.search(r'[a-zA-Z0-9]', sanitized_name):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Workspace name must contain at least one alphanumeric character"
            )
        
        return sanitized_name
    
    async def create_workspace(
        self, db: AsyncSession, user_id: UUID, **workspace_data: Any
    ) -> Workspace:
        workspace_count = await self.count_user_workspaces(db, user_id)
        if workspace_count >= self.MAX_WORKSPACES_PER_USER:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"User has reached the maximum limit of {self.MAX_WORKSPACES_PER_USER} workspaces"
            )

        if 'name' in workspace_data:
            workspace_data['name'] = self.validate_workspace_name(workspace_data['name'])

        workspace_data['user_id'] = user_id

        return await self.create(db, **workspace_data)
    
    async def update_workspace(
        self, db: AsyncSession, workspace_id: UUID, **update_data: Any
    ) -> Optional[Workspace]:

        if 'name' in update_data:
            update_data['name'] = self.validate_workspace_name(update_data['name'])

            workspace = Workspace()
            update_data['slug'] = workspace.generate_slug(update_data['name'])
        
        return await self.update(db, workspace_id, **update_data)


workspace_repository = WorkspaceRepository()
