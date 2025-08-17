from typing import Dict, Any, Optional
import httpx
from app.core.settings import get_settings
from app.core.logging import get_logger

logger = get_logger(__name__)


class SupabaseService:
    def __init__(self):
        self.settings = get_settings()
        self.base_url = self.settings.SUPABASE_URL
        self.service_key = self.settings.SUPABASE_SERVICE_KEY

        if not self.base_url or not self.service_key:
            logger.warning(
                'Supabase configuration incomplete. User updates to Supabase will be skipped.'
            )

    async def update_user_metadata(
        self, user_id: str, user_metadata: Dict[str, Any]
    ) -> bool:
        if not self.base_url or not self.service_key:
            logger.warning('Supabase not configured, skipping user metadata update')
            return False

        url = f'{self.base_url}/auth/v1/admin/users/{user_id}'
        headers = {
            'Authorization': f'Bearer {self.service_key}',
            'Content-Type': 'application/json',
            'apikey': self.service_key,
        }

        payload = {'user_metadata': user_metadata}

        try:
            async with httpx.AsyncClient() as client:
                response = await client.put(url, json=payload, headers=headers)

                if response.status_code == 200:
                    logger.info(
                        f'Successfully updated user metadata for user {user_id}'
                    )
                    return True
                else:
                    logger.error(
                        f'Failed to update user metadata for user {user_id}: '
                        f'{response.status_code} - {response.text}'
                    )
                    return False

        except Exception as e:
            logger.error(f'Error updating user metadata for user {user_id}: {str(e)}')
            return False
    
    async def create_user(
        self,
        email: str,
        password: str,
        metadata: Optional[Dict[str, Any]] = None
    ) -> Optional[Dict[str, Any]]:
        """Create a new user in Supabase Auth."""
        if not self.base_url or not self.service_key:
            logger.warning('Supabase not configured, skipping user creation')
            return None
        
        url = f'{self.base_url}/auth/v1/admin/users'
        headers = {
            'Authorization': f'Bearer {self.service_key}',
            'Content-Type': 'application/json',
            'apikey': self.service_key,
        }
        
        payload = {
            'email': email,
            'password': password,
            'email_confirm': True,  # Auto-confirm email for invited users
            'user_metadata': metadata or {}
        }
        
        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(url, json=payload, headers=headers)
                
                if response.status_code in [200, 201]:
                    user_data = response.json()
                    logger.info(f'Successfully created user with email {email}')
                    return user_data.get('user', user_data)
                else:
                    logger.error(
                        f'Failed to create user with email {email}: '
                        f'{response.status_code} - {response.text}'
                    )
                    return None
        
        except Exception as e:
            logger.error(f'Error creating user with email {email}: {str(e)}')
            return None


supabase_service = SupabaseService()
