import pytest
from uuid import UUID
from unittest.mock import AsyncMock, patch

from app.services.tasks.webhook_tasks import dispatch_webhook_event
from app.models.webhook_model import WebhookEventType


@pytest.mark.asyncio
async def test_webhook_error_handling_and_retry():
    """
    Test error handling and retry mechanism for webhook tasks.
    This is critical for scalability as it ensures tasks don't fail permanently on transient errors.
    """
    # Arrange
    ctx = {}
    project_id = UUID('00000000-0000-0000-0000-000000000000')
    event_type_str = WebhookEventType.FEEDBACK_CREATED.value
    payload = {'feedback': {'id': str(UUID('11111111-1111-1111-1111-111111111111'))}}

    # Setup mock session and service with failures
    mock_db_session = AsyncMock()
    mock_webhook_service = AsyncMock()

    # First simulate a connection error (retryable)
    connection_error = ConnectionError('Test connection error')
    mock_webhook_service.trigger_webhooks.side_effect = [connection_error, []]

    # Act & Assert - Test connection error handling (should be retried)
    with patch(
        'app.services.tasks.webhook_tasks.AsyncSessionLocal'
    ) as mock_session_factory, patch(
        'app.services.tasks.webhook_tasks.webhook_service', mock_webhook_service
    ):
        # Configure the mock session
        mock_session_factory.return_value.__aenter__.return_value = mock_db_session

        # First call should raise the error (which would trigger a retry)
        try:
            await dispatch_webhook_event(ctx, project_id, event_type_str, payload)
            assert False, 'Expected ConnectionError to be raised'
        except ConnectionError:
            # This is expected - connection errors should be re-raised for retry
            pass

        # Verify the service was called with correct parameters
        mock_webhook_service.trigger_webhooks.assert_called_once_with(
            mock_db_session, project_id, WebhookEventType(event_type_str), payload
        )

        # Reset mocks
        mock_webhook_service.reset_mock()

        # Second call should succeed (simulating a retry)
        result = await dispatch_webhook_event(ctx, project_id, event_type_str, payload)

        # Verify success result
        assert result['status'] == 'success'
        mock_webhook_service.trigger_webhooks.assert_called_once()


@pytest.mark.asyncio
async def test_validation_error_handling():
    """
    Test validation error handling for tasks.
    This ensures bad data doesn't cause retries and waste worker resources.
    """
    # Arrange
    ctx = {}
    project_id = UUID('00000000-0000-0000-0000-000000000000')
    invalid_event_type = 'invalid_event_type'  # This is not a valid enum value
    payload = {'test': 'data'}

    # Act
    result = await dispatch_webhook_event(ctx, project_id, invalid_event_type, payload)

    # Assert - Validation errors should be handled gracefully without retries
    assert result['status'] == 'error'
    assert 'Invalid event type' in result['message']

    # The lack of exception shows we're properly handling validation errors
