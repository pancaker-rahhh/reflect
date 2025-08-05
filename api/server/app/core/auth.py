import logging
from typing import Optional
from uuid import UUID
import jwt
from app.core.exceptions import AuthorizationError
from app.core.config import get_settings
from fastapi import Depends, HTTPException, Security, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from supabase import Client, create_client

logger = logging.getLogger(__name__)


settings = get_settings()
supabase: Client = create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_KEY)
security = HTTPBearer()


def verify_jwt_token(token: str) -> dict:
    try:
        return jwt.decode(
            token,
            settings.SUPABASE_JWT_SECRET,
            algorithms=['HS256'],
            audience='authenticated',
            issuer=f'{settings.SUPABASE_URL}/auth/v1',
        )
    except jwt.PyJWTError as e:
        raise AuthorizationError(f'Invalid or expired token: {e}', 401)


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Security(security),
) -> dict:
    try:
        token = credentials.credentials
        verify_jwt_token(token)
        user_response = supabase.auth.get_user(token)

        if user_response.user is None:
            raise AuthorizationError('User not found in Supabase', 404)

        user = user_response.user
        return {
            'id': str(user.id),
            'email': user.email,
            'user_metadata': user.user_metadata or {},
            'app_metadata': user.app_metadata or {},
        }
    except AuthorizationError as e:
        raise HTTPException(status_code=e.status_code, detail=e.error)
    except Exception as e:
        logger.error(f'An unexpected authentication failure occurred: {str(e)}')
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail='An unexpected authentication failure occurred',
        )


def get_current_user_id(current_user: dict = Depends(get_current_user)) -> UUID:
    try:
        return UUID(current_user['id'])
    except (ValueError, TypeError, KeyError):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail='Invalid user ID format in token',
        )


def get_current_user_optional(
    credentials: Optional[HTTPAuthorizationCredentials] = Security(security),
) -> Optional[dict]:
    if credentials is None:
        return None
    try:
        return get_current_user(credentials)
    except HTTPException:
        return None


def require_admin(current_user: dict = Security(get_current_user)) -> dict:
    app_metadata = current_user.get('app_metadata', {})

    if app_metadata.get('role') != 'admin':
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail='Admin access required'
        )
    return current_user
