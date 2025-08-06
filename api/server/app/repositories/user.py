from typing import Optional
from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.models.user import User
from app.repositories.base import BaseRepository


class UserRepository(BaseRepository[User]):
    def __init__(self):
        super().__init__(User)

    async def get_by_email(self, db: AsyncSession, email: str) -> Optional[User]:
        stmt = select(User).where(User.email == email)
        result = await db.execute(stmt)
        return result.scalar_one_or_none()

    async def get_or_create(
        self, db: AsyncSession, id: UUID, email: str, **defaults
    ) -> User:
        user = await self.get(db, id)
        if not user:
            user_data = {'id': id, 'email': email, **defaults}
            user = await self.create(db, **user_data)
        return user


user_repository = UserRepository()
