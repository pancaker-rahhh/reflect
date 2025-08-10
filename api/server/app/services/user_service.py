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

        # Update user metadata in Supabase as well
        await self._sync_user_to_supabase(user_id, update_dict)

        stmt = (
            select(User).where(User.id == user_id).options(selectinload(User.workspace))
        )
        result = await db.execute(stmt)
        user = result.scalar_one_or_none()

        return UserProfileResponse.model_validate(user)

    async def soft_delete_user(
        self, user_id: UUID, db: AsyncSession
    ) -> Optional[UserDeleteResponse]:
        deleted_at = datetime.now(timezone.utc)

        user = await user_repository.soft_delete(db, user_id)

        if not user:
            return None

        if user.workspace:
            await workspace_repository.soft_delete(db, user.workspace.id)

        logger.info(f'User {user_id} soft deleted at {deleted_at}')

        return UserDeleteResponse(deleted_at=deleted_at)

    async def ensure_user_has_workspace(self, user: User, db: AsyncSession) -> User:
        if not user.workspace:
            workspace_name = user.name or user.email.split('@')[0]
            workspace = Workspace(
                user_id=user.id,
                name=f"{workspace_name}'s Workspace",
                description=f'Personal workspace for {user.email}',
            )
            db.add(workspace)
            await db.commit()
            await db.refresh(workspace)

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
        """
        Sync user profile updates to Supabase user metadata.
        This ensures both systems stay in sync when profile is updated.
        """
        # Prepare metadata for Supabase - only include fields that are user-facing
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

    # TODO: Implement webhook for user sync and workspace creation in prod
    # This is a stopgap for local development
    async def sync_user_from_token(
        self, token_data: TokenData, db: AsyncSession
    ) -> UserProfileResponse:
        user_exist = await user_repository.get(db, UUID(token_data.user_id))

        if user_exist:
            # Update existing user with latest token data
            update_data = {}
            current_time = datetime.now(timezone.utc)

            # Update name if it's provided and different
            if token_data.name and token_data.name != user_exist.name:
                update_data['name'] = token_data.name

            # Update avatar_url if it's provided and different
            if token_data.avatar_url and token_data.avatar_url != user_exist.avatar_url:
                update_data['avatar_url'] = token_data.avatar_url

            # Update phone if it's provided and different
            if token_data.phone and token_data.phone != user_exist.phone:
                update_data['phone'] = token_data.phone

            # Always update sync and login timestamps
            update_data.update(
                {
                    'last_synced_at': current_time,
                    'last_login_at': current_time,
                    'updated_at': current_time,
                }
            )

            if len(update_data) > 3:  # More than just timestamps updated
                await user_repository.update(
                    db, UUID(token_data.user_id), **update_data
                )
                logger.info(f'Updated user {token_data.user_id} with latest token data')
            else:
                await user_repository.update(
                    db, UUID(token_data.user_id), **update_data
                )
                logger.info(f'Updated timestamps for user {token_data.user_id}')
        else:
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
            workspace = Workspace(
                user_id=user.id,
                name=f"{workspace_name}'s Workspace",
                description=f'Personal workspace for {user.email}',
            )
            db.add(workspace)
            await db.commit()
            await db.refresh(workspace)
            logger.info(f'Created workspace {workspace.id} for new user {user.id}')

        profile = await self.get_user_profile(UUID(token_data.user_id), db)
        if not profile:
            raise ValueError(
                f'Failed to get user profile after sync for user {token_data.user_id}'
            )
        return profile


user_service = UserService()
