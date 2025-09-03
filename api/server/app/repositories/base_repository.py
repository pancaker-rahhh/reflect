from typing import TypeVar, Generic, Type, Optional, List
from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update, delete, func

from app.models.base_model import BaseModel

ModelType = TypeVar('ModelType', bound=BaseModel)


class BaseRepository(Generic[ModelType]):
    def __init__(self, model: Type[ModelType]):
        self.model = model

    async def get(self, db: AsyncSession, id: UUID) -> Optional[ModelType]:
        from app.core.logging import get_logger

        logger = get_logger(__name__)

        logger.info(f'BaseRepository.get called with id: {id}')
        stmt = select(self.model).where(self.model.id == id)

        # Automatically filter out soft-deleted records
        if hasattr(self.model, 'deleted_at'):
            stmt = stmt.where(self.model.deleted_at.is_(None))

        logger.info(f'Executing query for {self.model.__name__}')
        result = await db.execute(stmt)
        logger.info(f'Query executed, getting result')
        return result.scalar_one_or_none()

    async def get_multi(
        self, db: AsyncSession, skip: int = 0, limit: int = 100, **filters
    ) -> List[ModelType]:
        stmt = select(self.model)

        # Automatically filter out soft-deleted records
        if hasattr(self.model, 'deleted_at'):
            stmt = stmt.where(self.model.deleted_at.is_(None))

        for key, value in filters.items():
            if hasattr(self.model, key) and value is not None:
                stmt = stmt.where(getattr(self.model, key) == value)

        stmt = stmt.offset(skip).limit(limit)
        result = await db.execute(stmt)
        return list(result.scalars().all())

    async def count(self, db: AsyncSession, **filters) -> int:
        stmt = select(func.count(self.model.id))

        for key, value in filters.items():
            if hasattr(self.model, key) and value is not None:
                stmt = stmt.where(getattr(self.model, key) == value)

        result = await db.execute(stmt)
        count = result.scalar()
        return count or 0

    async def create(self, db: AsyncSession, **obj_data) -> ModelType:
        db_obj = self.model(**obj_data)
        db.add(db_obj)
        await db.commit()
        await db.refresh(db_obj)
        return db_obj

    async def update(
        self, db: AsyncSession, id: UUID, **update_data
    ) -> Optional[ModelType]:
        stmt = (
            update(self.model)
            .where(self.model.id == id)
            .values(**update_data)
            .returning(self.model)
        )
        result = await db.execute(stmt)
        await db.commit()
        return result.scalar_one_or_none()

    async def delete(self, db: AsyncSession, id: UUID) -> bool:
        stmt = delete(self.model).where(self.model.id == id)
        result = await db.execute(stmt)
        await db.commit()
        return result.rowcount > 0

    async def soft_delete(self, db: AsyncSession, id: UUID) -> Optional[ModelType]:
        if hasattr(self.model, 'deleted_at'):
            return await self.update(db, id, deleted_at=func.now())
        return None
