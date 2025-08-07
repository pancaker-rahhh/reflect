import jwt
from typing import Optional
from fastapi import Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession
from api.server.app.core.exceptions import AuthenticationError
from app.core.config import get_settings
from app.schemas.auth import TokenData
from app.db import get_db


class Auth:
    def __init__(self):
        self.settings = get_settings()
        self.security = HTTPBearer(auto_error=False)

    def validate_jwt_token(self, token: str) -> TokenData:
        try:
            payload = jwt.decode(
                token,
                self.settings.SUPABASE_JWT_SECRET,
                algorithms=['HS256'],
                audience='authenticated',
                options={'verify_exp': True},
            )

            user_id = payload.get('sub')
            email = payload.get('email')

            if not user_id or not email:
                raise AuthenticationError('Invalid token claims')

            return TokenData(
                user_id=user_id,
                email=email,
                role=payload.get('role'),
                exp=payload.get('exp'),
                iat=payload.get('iat'),
                iss=payload.get('iss'),
                aud=payload.get('aud'),
            )

        except jwt.ExpiredSignatureError:
            raise AuthenticationError('Token has expired')
        except jwt.PyJWTError as e:
            raise AuthenticationError(f'Invalid token: {e}')
        except Exception as e:
            raise AuthenticationError(f'Token validation failed: {str(e)}')

    async def sync_user_to_db(self, token_data: TokenData, db: AsyncSession):
        from app.models.user import User
        from sqlalchemy import select

        stmt = select(User).where(User.id == token_data.user_id)
        result = await db.execute(stmt)
        user = result.scalar_one_or_none()

        if not user:
            user = User(id=token_data.user_id, email=token_data.email)
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
