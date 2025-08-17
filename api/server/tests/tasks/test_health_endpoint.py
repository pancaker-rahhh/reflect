import pytest
import fakeredis.aioredis
from unittest.mock import AsyncMock, MagicMock, patch

from app.services.health_service import health_service


@pytest.mark.asyncio
async def test_health_check():
    """Test the basic health check endpoint."""
    # Arrange & Act
    result = health_service.get_health_status()

    # Assert
    assert result.status == 'healthy'
    assert result.service is not None
    assert result.version is not None


@pytest.mark.asyncio
async def test_worker_health_check_integration():
    """Test the worker health check endpoint with mocked Redis."""
    # Arrange
    mock_db = AsyncMock()
    background_tasks = MagicMock()

    # Use FakeRedis with more complete mocking
    fake_redis = fakeredis.aioredis.FakeRedis()

    # Add necessary data to Redis
    await fake_redis.set('arq:queue:test', 'test')
    await fake_redis.set('arq:job:test', 'test')

    # Mock the info method
    info_result = {
        'redis_version': '7.0.0',
        'uptime_in_seconds': 3600,
        'connected_clients': 5,
        'used_memory_human': '1.5M',
    }

    # Mock task execution
    mock_executor = AsyncMock()
    mock_executor.execute = AsyncMock(return_value='test-job-id')

    # Act
    with patch('redis.asyncio.Redis', return_value=fake_redis), patch.object(
        fake_redis, 'info', return_value=info_result
    ), patch.object(fake_redis, 'llen', return_value=2), patch(
        'app.services.tasks.executor_factory.task_executor_factory',
        return_value=mock_executor,
    ):
        result = await health_service.check_worker_health(mock_db, background_tasks)

        # Close the FakeRedis instance
        await fake_redis.aclose()

    # Assert
    assert result.status == 'healthy'
    assert result.worker_connected is True
    assert result.redis.connected is True
    assert result.queue_size == 2
    assert result.errors is None

    # Verify task was queued with correct parameters
    mock_executor.execute.assert_called_once()
    args = mock_executor.execute.call_args[0]
    assert args[0] == 'dispatch_webhook_event'
    assert 'project_id' in args[1]
    assert args[1]['event_type_str'] == 'test_event'
