import pytest
from uuid import UUID
from unittest.mock import AsyncMock, MagicMock, patch

from app.services.tasks.notification_tasks import (
    send_notification,
    send_bulk_notifications,
)
from app.services.notification_service import notification_service


@pytest.mark.asyncio
async def test_send_notification():
    """Test the send_notification task function."""
    # Arrange
    ctx = {}
    user_id = UUID('00000000-0000-0000-0000-000000000000')
    notification_type = 'test_notification'
    data = {'subject': 'Test', 'content': 'This is a test notification'}

    # Act
    with patch('app.services.tasks.notification_tasks.AsyncSessionLocal') as mock_db:
        # Mock the session and DB operations
        mock_session = AsyncMock()
        mock_db.return_value.__aenter__.return_value = mock_session

        result = await send_notification(ctx, user_id, notification_type, data)

    # Assert
    assert result['status'] == 'success'
    assert 'result' in result
    assert result['result']['sent'] is True


@pytest.mark.asyncio
async def test_send_bulk_notifications():
    """Test the send_bulk_notifications task function."""
    # Arrange
    ctx = {}
    user_ids = [
        UUID('00000000-0000-0000-0000-000000000000'),
        UUID('00000000-0000-0000-0000-000000000001'),
    ]
    notification_type = 'test_bulk_notification'
    data = {'subject': 'Bulk Test', 'content': 'This is a bulk test notification'}

    # Act
    with patch('app.services.tasks.notification_tasks.AsyncSessionLocal') as mock_db:
        # Mock the session and DB operations
        mock_session = AsyncMock()
        mock_db.return_value.__aenter__.return_value = mock_session

        result = await send_bulk_notifications(ctx, user_ids, notification_type, data)

    # Assert
    assert result['status'] == 'completed'
    assert result['successful'] == len(user_ids)
    assert result['failed'] == 0


@pytest.mark.asyncio
async def test_notification_service_send():
    """Test the notification service send method."""
    # Arrange
    user_id = UUID('00000000-0000-0000-0000-000000000000')
    notification_type = 'test_service_notification'
    data = {'subject': 'Service Test', 'content': 'Testing notification service'}

    # Mock everything needed
    mock_db = AsyncMock()
    background_tasks = MagicMock()
    mock_executor = AsyncMock()
    mock_executor.execute = AsyncMock(return_value=None)

    # Act
    with patch(
        'app.services.tasks.executor_factory.task_executor_factory',
        return_value=mock_executor,
    ):
        result = await notification_service.send_notification(
            mock_db, background_tasks, user_id, notification_type, data
        )

    # Assert
    assert result['status'] == 'queued'
    mock_executor.execute.assert_called_once()
    args = mock_executor.execute.call_args[0]
    assert args[0] == 'send_notification'
    assert args[1]['user_id'] == user_id
    assert args[1]['notification_type'] == notification_type


@pytest.mark.asyncio
async def test_notification_service_send_with_delay():
    """Test the notification service send method with delay."""
    # Arrange
    user_id = UUID('00000000-0000-0000-0000-000000000000')
    notification_type = 'test_delayed_notification'
    data = {'subject': 'Delayed Test', 'content': 'Testing delayed notification'}
    delay_seconds = 60

    # Mock everything needed
    mock_db = AsyncMock()
    background_tasks = MagicMock()
    mock_executor = AsyncMock()
    mock_executor.schedule = AsyncMock(return_value=None)

    # Act
    with patch(
        'app.services.tasks.executor_factory.task_executor_factory',
        return_value=mock_executor,
    ):
        result = await notification_service.send_notification(
            mock_db, background_tasks, user_id, notification_type, data, delay_seconds
        )

    # Assert
    assert result['status'] == 'scheduled'
    assert result['delay_seconds'] == delay_seconds
    mock_executor.schedule.assert_called_once()
    args = mock_executor.schedule.call_args[0]
    assert args[0] == 'send_notification'
    assert args[1]['user_id'] == user_id
    assert args[2] == delay_seconds
