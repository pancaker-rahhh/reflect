import logging
from typing import Dict, List
from uuid import UUID
from fastapi import HTTPException, status
from supabase import Client, create_client
from gotrue.types import User as GoTrueUser

from app.core.config import get_settings
from app.models.schemas.user_schemas import UserInfo, UserProfileUpdate, AdminUserUpdate

logger = logging.getLogger(__name__)
settings = get_settings()


class UserService:
    def __init__(self):
        try:
            self.supabase: Client = create_client(
                settings.SUPABASE_URL, settings.SUPABASE_SERVICE_KEY
            )
        except Exception as e:
            logger.critical(f'Failed to initialize Supabase client: {e}')
            self.supabase = None

    def get_user_details_by_id(self, user_id: str) -> GoTrueUser | None:
        if not self.supabase:
            return None
        try:
            return self.supabase.auth.admin.get_user_by_id(user_id).user
        except Exception:
            return None

    def get_user_info_from_id(self, user_id: UUID) -> UserInfo:
        user_details_obj = self.get_user_details_by_id(str(user_id))
        if not user_details_obj:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f'User with ID {user_id} not found in authentication service.',
            )
        return UserInfo(
            id=user_details_obj.id,
            name=user_details_obj.user_metadata.get('name', 'N/A'),
            email=user_details_obj.email,
        )

    def get_multiple_user_details(self, user_ids: List[str]) -> Dict[str, GoTrueUser]:
        if not self.supabase:
            return {}
        unique_ids = list(filter(None, set(user_ids)))
        users = {}
        for user_id in unique_ids:
            user_data = self.get_user_details_by_id(user_id)
            if user_data:
                users[user_id] = user_data
        return users

    def update_own_profile(
        self, profile_data: UserProfileUpdate, current_user: dict
    ) -> UserInfo:
        try:
            update_data = profile_data.model_dump(exclude_unset=True)
            response = self.supabase.auth.admin.update_user_by_id(
                current_user['id'], {'user_metadata': update_data}
            )
            return self.get_user_info_from_id(response.user.id)
        except Exception as e:
            logger.exception(
                f'Exception while updating profile for user {current_user["id"]}: {e}'
            )
            raise HTTPException(
                status_code=400, detail=f'Failed to update profile: {e}'
            )

    def update_user_by_id(self, user_id: str, update_data: AdminUserUpdate) -> UserInfo:
        try:
            update_payload = {}
            if update_data.email is not None:
                update_payload['email'] = update_data.email
            if update_data.role is not None:
                update_payload['app_metadata'] = {'role': update_data.role}

            response = self.supabase.auth.admin.update_user_by_id(
                user_id, update_payload
            )
            return self.get_user_info_from_id(response.user.id)
        except Exception as e:
            logger.exception(f'Exception while admin updating user {user_id}: {e}')
            raise HTTPException(status_code=400, detail=f'Failed to update user: {e}')

    def delete_user_by_id(self, user_id: str) -> Dict[str, str]:
        try:
            self.supabase.auth.admin.delete_user(user_id)
            return {'message': f'User {user_id} deleted successfully'}
        except Exception as e:
            logger.exception(f'Exception while deleting user {user_id}: {e}')
            raise HTTPException(status_code=400, detail=f'Failed to delete user: {e}')

    def search_users(self, query: str, limit: int = 20) -> List[GoTrueUser]:
        """
        TODO - Supabase's GoTrue Admin API does not have a native search filter.
            This implementation fetches users and filters in memory.
            For large user bases (>1000s), a more robust pagination or
            dedicated search solution (e.g., Algolia) is recommended.
        """
        if not self.supabase or not query:
            return []

        try:
            response = self.supabase.auth.admin.list_users(per_page=1000)

            all_users = response

            logger.info(
                f"Searching for '{query}' among {len(all_users)} users fetched from Supabase."
            )

            query_lower = query.lower()
            results = []
            for user in all_users:
                name = user.user_metadata.get('name', '').lower()
                email = user.email.lower() if user.email else ''

                if query_lower in name or query_lower in email:
                    results.append(user)
                    if len(results) >= limit:
                        break

            logger.info(f'Found {len(results)} matching users.')
            return results
        except Exception as e:
            logger.error(f'Error searching users in Supabase: {e}', exc_info=True)
            return []


user_service = UserService()
