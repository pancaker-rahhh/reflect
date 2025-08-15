import pytest
import fakeredis.aioredis
from unittest.mock import AsyncMock, patch, MagicMock

from app.services.health_service import health_service


@pytest.mark.asyncio
async def test_worker_health_check_success():
    """Test worker health check endpoint when worker is healthy."""
    # Arrange
    db = AsyncMock()
    background_tasks = MagicMock()

    # Use FakeRedis with more complete mocking
    fake_redis = fakeredis.aioredis.FakeRedis()

    # Create custom mock methods
    info_result = {
        'redis_version': '7.0.0',
        'uptime_in_seconds': 3600,
        'connected_clients': 5,
        'used_memory_human': '1.5M',
    }

    # Act
    with patch('redis.asyncio.Redis', return_value=fake_redis), patch.object(
        fake_redis, 'info', return_value=info_result
    ), patch.object(fake_redis, 'llen', return_value=2), patch(
        'app.services.tasks.executor_factory.task_executor_factory'
    ) as mock_executor_factory:
        # Configure mock executor
        mock_executor = AsyncMock()
        mock_executor_factory.return_value = mock_executor
        mock_executor.execute = AsyncMock()

        result = await health_service.check_worker_health(db, background_tasks)

        # Close the FakeRedis instance
        await fake_redis.aclose()

    # Assert
    assert result.status == 'healthy'
    assert result.worker_connected is True
    assert result.redis.connected is True
    assert result.errors is None


@pytest.mark.asyncio
async def test_worker_health_check_redis_failure():
    """Test worker health check endpoint when Redis is down."""
    # Arrange
    db = AsyncMock()
    background_tasks = MagicMock()

    # Act
    with patch('redis.asyncio.Redis') as redis_mock:
        redis_mock.side_effect = Exception('Connection failed')

        result = await health_service.check_worker_health(db, background_tasks)

    # Assert
    assert result.status == 'unhealthy'
    assert result.worker_connected is False
    assert result.redis.connected is False
    assert result.errors is not None
    assert len(result.errors) > 0
    assert 'Redis connection error' in result.errors[0]


@pytest.mark.asyncio
async def test_worker_health_check_task_failure():
    """Test worker health check endpoint when task queue fails."""
    # Arrange
    db = AsyncMock()
    background_tasks = MagicMock()

    # Mock Redis connection and info
    redis_mock = AsyncMock()
    redis_mock.info.return_value = {
        'redis_version': '7.0.0',
        'uptime_in_seconds': 3600,
        'connected_clients': 5,
        'used_memory_human': '1.5M',
    }
    redis_mock.llen.return_value = 2
    redis_mock.close = AsyncMock()

    # Act
    with patch('redis.asyncio.Redis', return_value=redis_mock), patch(
        'app.services.tasks.executor_factory.task_executor_factory'
    ) as mock_executor_factory:
        # Configure mock executor to fail
        mock_executor = AsyncMock()
        mock_executor_factory.return_value = mock_executor
        mock_executor.execute.side_effect = Exception('Task queue error')

        result = await health_service.check_worker_health(db, background_tasks)

    # Assert
    assert result.status == 'unhealthy'
    assert result.worker_connected is False
    assert result.redis.connected is True
    assert result.errors is not None
    assert len(result.errors) > 0
    assert 'Failed to queue test task' in result.errors[0]
