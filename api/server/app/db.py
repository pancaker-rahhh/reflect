from typing import AsyncGenerator, Optional
from sqlalchemy.ext.asyncio import AsyncSession, AsyncEngine, create_async_engine, async_sessionmaker
from sqlalchemy.ext.declarative import declarative_base
from app.core.settings import get_settings

settings = get_settings()

Base = declarative_base()


# Global references - will be set during lifespan or test setup
_engine: Optional[AsyncEngine] = None
_async_session_maker: Optional[async_sessionmaker] = None


def create_engine_and_session_maker(database_url: str | None = None) -> tuple[AsyncEngine, async_sessionmaker]:
    """
    Create a database engine and session maker.
    
    Args:
        database_url: Optional database URL. If not provided, uses settings.DATABASE_URL
        
    Returns:
        Tuple of (engine, session_maker)
    """
    if database_url is None:
        database_url = str(settings.DATABASE_URL)
    
    engine = create_async_engine(
        database_url,
        echo=settings.LOG_SQL,
        pool_size=settings.DATABASE_POOL_SIZE,
        max_overflow=settings.DATABASE_MAX_OVERFLOW,
        pool_pre_ping=True,
        pool_recycle=3600,
        future=True,
    )
    
    session_maker = async_sessionmaker(
        bind=engine,
        class_=AsyncSession,
        expire_on_commit=False,
        autocommit=False,
        autoflush=False,
        future=True,
    )
    
    return engine, session_maker


def set_engine_and_session_maker(engine: AsyncEngine, session_maker: async_sessionmaker) -> None:
    """
    Set the global engine and session maker.
    Used by lifespan context manager and tests.
    """
    global _engine, _async_session_maker
    _engine = engine
    _async_session_maker = session_maker


def get_engine() -> AsyncEngine:
    """Get the current database engine."""
    if _engine is None:
        raise RuntimeError(
            "Database engine not initialized. "
            "Ensure the FastAPI lifespan context has started or call set_engine_and_session_maker() in tests."
        )
    return _engine


def get_session_maker() -> async_sessionmaker:
    """Get the current session maker."""
    if _async_session_maker is None:
        raise RuntimeError(
            "Database session maker not initialized. "
            "Ensure the FastAPI lifespan context has started or call set_engine_and_session_maker() in tests."
        )
    return _async_session_maker


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """
    FastAPI dependency that provides a database session.
    
    Usage:
        @router.get("/items")
        async def get_items(db: AsyncSession = Depends(get_db)):
            ...
    """
    session_maker = get_session_maker()
    
    async with session_maker() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()


async def init_db() -> None:
    """
    Initialize the database by creating all tables.
    Typically called during startup or in tests.
    """
    engine = get_engine()
    
    async with engine.begin() as conn:
        from app.models import base_model  # noqa

        # Import all models to ensure they are registered
        import app.models  # noqa

        await conn.run_sync(Base.metadata.create_all)


async def close_db() -> None:
    """
    Close the database engine and dispose of connections.
    Should be called during application shutdown.
    """
    if _engine is not None:
        await _engine.dispose()
