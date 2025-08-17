import pytest
import uuid
from typing import AsyncGenerator
import fakeredis.aioredis
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker
from fastapi import BackgroundTasks
from unittest.mock import AsyncMock, MagicMock, patch

from app.core.settings import get_settings

settings = get_settings()

# Test database setup - use a mock in-memory SQLite database instead of PostgreSQL for testing
TEST_DB_URL = 'sqlite+aiosqlite:///:memory:'


# We'll use fake Redis for testing
@pytest.fixture
async def test_redis_pool() -> AsyncGenerator:
    """Create a fake Redis pool for testing."""
    # Create a fake Redis instance
    fake_redis = fakeredis.aioredis.FakeRedis()

    # Make it behave like an ARQ Redis pool by adding necessary methods
    fake_redis.enqueue_job = AsyncMock(return_value='test-job-id')
    fake_redis.info = AsyncMock(
        return_value={
            'redis_version': '6.0.0',
            'uptime_in_seconds': 100,
            'connected_clients': 1,
            'used_memory_human': '1M',
        }
    )

    yield fake_redis

    # Cleanup
    await fake_redis.flushall()
    await fake_redis.aclose()


@pytest.fixture
async def test_db() -> AsyncGenerator:
    """
    Create a fresh database for each test.
    """
    # Create test database engine
    engine = create_async_engine(TEST_DB_URL)

    # Create test session factory
    TestingSessionLocal = sessionmaker(
        autocommit=False,
        autoflush=False,
        bind=engine,
        class_=AsyncSession,
    )

    # Create tables (if needed)
    # async with engine.begin() as conn:
    #     await conn.run_sync(Base.metadata.create_all)

    # Use existing connection for tests
    async with TestingSessionLocal() as session:
        yield session


@pytest.fixture
def background_tasks() -> BackgroundTasks:
    """
    Create a BackgroundTasks instance for testing.
    """
    return BackgroundTasks()


@pytest.fixture
def generate_uuid():
    """
    Generate a UUID for testing.
    """
    return lambda: str(uuid.uuid4())


@pytest.fixture
def mock_task_executor():
    """
    Mock the task executor to avoid actual Redis operations during tests.
    """
    mock = MagicMock()
    mock.execute = AsyncMock()
    mock.schedule = AsyncMock()

    with patch(
        'app.services.tasks.executor_factory.task_executor_factory', return_value=mock
    ):
        yield mock


@pytest.fixture
async def process_tasks(test_redis_pool):
    """
    Simulate processing of tasks for testing.
    Instead of actually processing tasks, this just pretends tasks are processed.
    """

    async def _process():
        # Set a key to indicate processing happened
        await test_redis_pool.set('tasks:processed', 'true')
        await test_redis_pool.set('tasks:last_processed', str(uuid.uuid4()))

    return _process
