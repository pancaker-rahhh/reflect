import jwt
from typing import Optional, Dict, Any
from fastapi import Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.exceptions import AuthenticationError
from app.core.settings import get_settings
from app.schemas.auth_schema import TokenData
from app.db import get_db
from app.models.user_model import User
from sqlalchemy import select


class Auth:
    def __init__(self):
        self.settings = get_settings()
        self.security = HTTPBearer(auto_error=False)

    def validate_jwt_token(self, token: str) -> TokenData:
        try:
            payload = jwt.decode(
                token,
                self.settings.SUPABASE_JWT_SECRET,
                algorithms=[self.settings.ALGORITHM],
                audience='authenticated',
                options={'verify_exp': True},
                leeway=60,  # Allow 60 seconds of clock skew
            )

            user_id = payload.get('sub')
            email = payload.get('email')

            if not user_id or not email:
                raise AuthenticationError('Invalid token claims')

            user_metadata = payload.get('user_metadata', {})
            app_metadata = payload.get('app_metadata', {})

            if not isinstance(user_metadata, dict):
                user_metadata = {}
            if not isinstance(app_metadata, dict):
                app_metadata = {}

            def safe_get_string(
                data: Dict[str, Any], key: str, max_length: int = 255
            ) -> Optional[str]:
                value = data.get(key)
                if value is None:
                    return None
                if not isinstance(value, str):
                    return None
                return value[:max_length] if len(value) > max_length else value

            return TokenData(
                sub=user_id,
                email=email,
                name=safe_get_string(user_metadata, 'full_name')
                or safe_get_string(user_metadata, 'name'),
                avatar_url=safe_get_string(user_metadata, 'avatar_url', 500),
                phone=safe_get_string(user_metadata, 'phone', 50),
                role=safe_get_string(app_metadata, 'role', 50) or payload.get('role'),
                exp=payload.get('exp'),
                iat=payload.get('iat'),
                iss=payload.get('iss'),
                aud=payload.get('aud'),
            )

        except jwt.ExpiredSignatureError:
            raise AuthenticationError('Token has expired')
        except jwt.PyJWTError:
            raise AuthenticationError('Invalid token')
        except Exception:
            raise AuthenticationError('Token validation failed')

    async def sync_user_to_db(self, token_data: TokenData, db: AsyncSession):
        stmt = select(User).where(User.id == token_data.sub)
        result = await db.execute(stmt)
        user = result.scalar_one_or_none()

        if not user:
            user = User(id=token_data.sub, email=token_data.email)
            db.add(user)
            await db.commit()
            await db.refresh(user)

        return user

    async def verify_and_get_user(
        self, credentials: HTTPAuthorizationCredentials, db: AsyncSession
    ):
        token_data = self.validate_jwt_token(credentials.credentials)
        user = await self.sync_user_to_db(token_data, db)
        return user


auth = Auth()


async def get_current_user_optional(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(auth.security),
    db: AsyncSession = Depends(get_db),
):
    if not credentials:
        return None
    return await auth.verify_and_get_user(credentials, db)


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(auth.security),
    db: AsyncSession = Depends(get_db),
):
    if not credentials:
        raise AuthenticationError('Authentication required')
    return await auth.verify_and_get_user(credentials, db)


async def get_current_token_data(
    credentials: HTTPAuthorizationCredentials = Depends(auth.security),
) -> TokenData:
    if not credentials:
        raise AuthenticationError('Authentication required')
    return auth.validate_jwt_token(credentials.credentials)


async def get_current_token_data_optional(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(auth.security),
) -> Optional[TokenData]:
    if not credentials:
        return None
    try:
        return auth.validate_jwt_token(credentials.credentials)
    except AuthenticationError:
        return None
