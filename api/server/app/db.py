import os
from typing import AsyncGenerator
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from sqlalchemy.ext.declarative import declarative_base
from app.core.settings import get_settings

settings = get_settings()

# Only create async engine if not in migration context
if os.getenv('ALEMBIC_MIGRATION'):
    # In migration context - don't create async engine
    engine = None
else:
    engine = create_async_engine(
        str(settings.DATABASE_URL),
        echo=settings.LOG_SQL,  # Control SQL query logging via LOG_SQL setting
        pool_size=settings.DATABASE_POOL_SIZE,
        max_overflow=settings.DATABASE_MAX_OVERFLOW,
        pool_pre_ping=True,
        pool_recycle=3600,
        future=True,
    )

AsyncSessionLocal = (
    async_sessionmaker(
        bind=engine,
        class_=AsyncSession,
        expire_on_commit=False,
        autocommit=False,
        autoflush=False,
        future=True,
    )
    if engine
    else None
)

Base = declarative_base()


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    if AsyncSessionLocal is None:
        raise RuntimeError(
            'Database not initialized. This function should not be called in migration context.'
        )

    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()


async def init_db() -> None:
    if engine is None:
        raise RuntimeError(
            'Database engine not initialized. This function should not be called in migration context.'
        )

    async with engine.begin() as conn:
        from app.models import base_model  # noqa

        # Import all models to ensure they are registered
        import app.models  # noqa

        await conn.run_sync(Base.metadata.create_all)


async def close_db() -> None:
    if engine is None:
        raise RuntimeError(
            'Database engine not initialized. This function should not be called in migration context.'
        )

    await engine.dispose()
