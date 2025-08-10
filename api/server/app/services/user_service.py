import asyncio
from typing import Optional
from uuid import UUID
from datetime import datetime, timezone
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from app.models.user_model import User
from app.models.workspace_model import Workspace
from app.repositories.user_repository import user_repository
from app.repositories.workspace_repository import workspace_repository
from app.schemas.user_schema import (
    UserProfileUpdateRequest,
    UserProfileResponse,
    UserDeleteResponse,
)
from app.schemas.workspace_schema import WorkspaceCreate
from app.core.logging import get_logger
from app.schemas.auth_schema import TokenData
from app.services.supabase_service import supabase_service

logger = get_logger(__name__)


class UserService:
    async def get_user_profile(
        self, user_id: UUID, db: AsyncSession
    ) -> Optional[UserProfileResponse]:
        stmt = (
            select(User).where(User.id == user_id).options(selectinload(User.workspace))
        )
        result = await db.execute(stmt)
        user = result.scalar_one_or_none()

        if not user:
            return None

        return UserProfileResponse.model_validate(user)

    async def update_user_profile(
        self, user_id: UUID, update_data: UserProfileUpdateRequest, db: AsyncSession
    ) -> Optional[UserProfileResponse]:
        update_dict = update_data.model_dump(exclude_unset=True)

        if not update_dict:
            return await self.get_user_profile(user_id, db)

        update_dict['updated_at'] = datetime.now(timezone.utc)

        updated_user = await user_repository.update(db, user_id, **update_dict)

        if not updated_user:
            return None

        asyncio.create_task(self._sync_user_to_supabase(user_id, update_dict))
        await db.refresh(updated_user, ['workspace'])

        return UserProfileResponse.model_validate(updated_user)

    async def soft_delete_user(
        self, user_id: UUID, db: AsyncSession
    ) -> Optional[UserDeleteResponse]:
        deleted_at = datetime.now(timezone.utc)

        async with db.begin_nested():
            from sqlalchemy.orm import selectinload
            stmt = select(User).where(User.id == user_id).options(
                selectinload(User.workspace)
            )
            result = await db.execute(stmt)
            user = result.scalar_one_or_none()

            if not user:
                await db.rollback()
                return None

            if user.workspace:
                await workspace_repository.soft_delete(db, user.workspace.id)

            await user_repository.soft_delete(db, user_id)

            logger.info(f'User {user_id} and related data soft deleted at {deleted_at}')

        return UserDeleteResponse(deleted_at=deleted_at)

    async def ensure_user_has_workspace(self, user: User, db: AsyncSession) -> User:
        if not user.workspace:
            workspace_name = user.name or user.email.split('@')[0]
            workspace_create = WorkspaceCreate(
                name=f"{workspace_name}'s Workspace",
                description=f'Personal workspace for {user.email}'
            )
            workspace = await workspace_repository.create_workspace(
                db, user_id=user.id, **workspace_create.model_dump()
            )

            stmt = (
                select(User)
                .where(User.id == user.id)
                .options(selectinload(User.workspace))
            )
            result = await db.execute(stmt)
            user = result.scalar_one()

            logger.info(f'Created workspace {workspace.id} for user {user.id}')

        return user

    async def _sync_user_to_supabase(self, user_id: UUID, update_data: dict) -> None:
        supabase_metadata = {}

        if 'name' in update_data:
            supabase_metadata['full_name'] = update_data['name']
            supabase_metadata['name'] = update_data['name']

        if 'avatar_url' in update_data:
            supabase_metadata['avatar_url'] = update_data['avatar_url']

        if 'phone' in update_data:
            supabase_metadata['phone'] = update_data['phone']

        if supabase_metadata:
            success = await supabase_service.update_user_metadata(
                str(user_id), supabase_metadata
            )

            if success:
                logger.info(f'Successfully synced user {user_id} updates to Supabase')
            else:
                logger.warning(f'Failed to sync user {user_id} updates to Supabase')

    async def sync_user_from_token(
        self, token_data: TokenData, db: AsyncSession
    ) -> UserProfileResponse:
        user_exist = await user_repository.get(db, UUID(token_data.user_id))

        if user_exist:
            logger.debug(f'User {token_data.user_id} already exists, returning profile')
            profile = await self.get_user_profile(UUID(token_data.user_id), db)
            if not profile:
                raise ValueError(f'Failed to get profile for existing user {token_data.user_id}')
            return profile

        user_data = {
            'id': UUID(token_data.user_id),
            'email': token_data.email,
            'name': token_data.name,
            'avatar_url': token_data.avatar_url,
            'phone': token_data.phone,
            'last_synced_at': datetime.now(timezone.utc),
            'last_login_at': datetime.now(timezone.utc),
        }
        user = await user_repository.create(db, **user_data)
        logger.info(f'Created new user {token_data.user_id} from token sync')

        workspace_name = user.name or user.email.split('@')[0]
        workspace_create = WorkspaceCreate(
            name=f"{workspace_name}'s Workspace",
            description=f'Personal workspace for {user.email}'
        )
        workspace = await workspace_repository.create_workspace(
            db, user_id=user.id, **workspace_create.model_dump()
        )
        logger.info(f'Created workspace {workspace.id} for new user {user.id}')

        profile = await self.get_user_profile(UUID(token_data.user_id), db)
        if not profile:
            raise ValueError(f'Failed to get user profile after creation for user {token_data.user_id}')
        return profile


user_service = UserService()
