from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException, status

from app.models.user_model import User
from app.models.workspace_model import Workspace
from app.repositories.workspace_repository import (
    workspace_repository,
    WorkspaceRepository,
)
from app.schemas.workspace_schema import WorkspaceCreate


class WorkspaceService:
    def __init__(self, repository: WorkspaceRepository = workspace_repository):
        self.repository = repository

    async def get_workspace_by_user(self, db: AsyncSession, user: User) -> Workspace:
        workspace = await self.repository.get_by_user_id(db, user_id=user.id)
        if not workspace:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
            )
        return workspace

    async def create_workspace(
        self, db: AsyncSession, user: User, workspace_in: WorkspaceCreate
    ) -> Workspace:
        workspace_data = workspace_in.model_dump()
        return await self.repository.create_workspace(
            db, user_id=user.id, **workspace_data
        )


workspace_service = WorkspaceService()
