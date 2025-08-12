import asyncio
from typing import Optional
from uuid import UUID
from datetime import datetime, timezone
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.models.user_model import User
from app.repositories.user_repository import user_repository
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
        stmt = select(User).where(User.id == user_id)
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
        await db.refresh(updated_user)

        return UserProfileResponse.model_validate(updated_user)

    async def soft_delete_user(
        self, user_id: UUID, db: AsyncSession
    ) -> Optional[UserDeleteResponse]:
        deleted_at = datetime.now(timezone.utc)

        user = await user_repository.get(db, user_id)
        if not user:
            return None

        await user_repository.soft_delete(db, user_id)
        logger.info(f'User {user_id} soft deleted at {deleted_at}')

        return UserDeleteResponse(deleted_at=deleted_at)


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
            
            # Set first_login_at for existing users who don't have it set
            if user_exist.first_login_at is None:
                await user_repository.update(
                    db, 
                    UUID(token_data.user_id), 
                    first_login_at=datetime.now(timezone.utc)
                )
                logger.info(f'Set first_login_at for existing user {token_data.user_id}')
            
            profile = await self.get_user_profile(UUID(token_data.user_id), db)
            if not profile:
                raise ValueError(
                    f'Failed to get profile for existing user {token_data.user_id}'
                )
            return profile

        current_time = datetime.now(timezone.utc)
        user_data = {
            'id': UUID(token_data.user_id),
            'email': token_data.email,
            'name': token_data.name,
            'avatar_url': token_data.avatar_url,
            'phone': token_data.phone,
            'last_synced_at': current_time,
            'last_login_at': current_time,
            'first_login_at': current_time,  # Set first login time for new users
            'onboarding_completed': False,   # New users need onboarding
            'user_type': None,              # Will be set during onboarding
        }
        await user_repository.create(db, **user_data)
        logger.info(f'Created new user {token_data.user_id} from token sync')

        profile = await self.get_user_profile(UUID(token_data.user_id), db)
        if not profile:
            raise ValueError(
                f'Failed to get user profile after creation for user {token_data.user_id}'
            )
        return profile


user_service = UserService()