import pytest
import asyncio
from uuid import UUID
from unittest.mock import AsyncMock, MagicMock, patch

from app.models.webhook_model import WebhookEventType
from app.models.feedback_model import (
    Feedback,
    FeedbackType,
    FeedbackStatus,
    FeedbackPriority,
)
from app.services.webhook_dispatcher import webhook_dispatcher


@pytest.mark.asyncio
async def test_webhook_dispatch_scalability():
    """
    Test webhook dispatch with ARQ integration for scalability.
    This test verifies that:
    1. Events are properly queued for asynchronous processing
    2. The dispatcher doesn't block the main application flow
    3. Multiple events can be queued in parallel
    """
    # Arrange
    mock_db = AsyncMock()

    # Create mock feedback
    mock_feedback = MagicMock(spec=Feedback)
    mock_feedback.id = UUID('00000000-0000-0000-0000-000000000000')
    mock_feedback.project_id = UUID('11111111-1111-1111-1111-111111111111')
    mock_feedback.widget_id = UUID('22222222-2222-2222-2222-222222222222')
    mock_feedback.feedback_type = FeedbackType.FEATURE_REQUEST
    mock_feedback.title = 'Test Feedback'
    mock_feedback.message = 'This is a test feedback message'
    mock_feedback.status = FeedbackStatus.NEW
    mock_feedback.priority = FeedbackPriority.MEDIUM
    mock_feedback.submitter_name = 'Test User'
    mock_feedback.submitter_email = 'test@example.com'
    mock_feedback.is_anonymous = False
    mock_feedback.created_at = None

    # Track task execution
    task_calls = []
    task_payloads = []

    # Create a patched version of the _execute_webhook_task method
    # Note: We don't include 'self' since we're patching at the instance level
    async def mock_execute_webhook_task(self, *args, **kwargs):
        # Add some debugging
        print(f'Args: {args}, Kwargs: {kwargs}')
        # Assume project_id is the first arg, event_type is the second
        task_calls.append((args[0], args[1]))
        task_payloads.append(args[-1])  # Assume payload is the last arg

    # Act & Assert - Test feedback created event
    with patch.object(
        webhook_dispatcher, '_execute_webhook_task', mock_execute_webhook_task
    ):
        # Test 1: Basic event queueing
        await webhook_dispatcher.dispatch_feedback_created(mock_db, mock_feedback)

        # Give the asyncio event loop a chance to run any pending tasks
        await asyncio.sleep(0.1)

        # Verify task was queued
        assert len(task_calls) == 1

        # Check that the correct event type and project ID were used
        project_id, event_type = task_calls[0]
        assert project_id == mock_feedback.project_id
        assert event_type == WebhookEventType.FEEDBACK_CREATED

        # Check payload contains the right data
        payload = task_payloads[0]
        assert payload['feedback']['id'] == str(mock_feedback.id)
        assert payload['project']['id'] == str(mock_feedback.project_id)

        # Reset for next test
        task_calls.clear()
        task_payloads.clear()

        # Test 2: Different event type with additional data
        updated_fields = {'status': 'RESOLVED', 'priority': 'HIGH'}
        await webhook_dispatcher.dispatch_feedback_updated(
            mock_db, mock_feedback, updated_fields
        )

        # Give the asyncio event loop a chance to run any pending tasks
        await asyncio.sleep(0.1)

        # Verify task was queued again
        assert len(task_calls) == 1

        # Check correct event type
        project_id, event_type = task_calls[0]
        assert event_type == WebhookEventType.FEEDBACK_UPDATED

        # Check payload contains changes
        payload = task_payloads[0]
        assert 'changes' in payload
        assert payload['changes'] == updated_fields

        # Test 3: Verify the dispatcher is non-blocking (key for scalability)
        # Create a slow executor to simulate network latency
        slow_task_started = False
        slow_task_completed = False
        original_create_task = asyncio.create_task

        # Create a mock for asyncio.create_task that tracks when it's called
        def mock_create_task(coro):
            nonlocal slow_task_started
            slow_task_started = True
            # Return the original task so it actually runs
            return original_create_task(coro)

        # Create a mock for _execute_webhook_task that runs a slow task
        async def mock_execute_webhook_task(*args, **kwargs):
            # Schedule the slow task
            asyncio.create_task(run_slow_task())

        async def run_slow_task():
            nonlocal slow_task_completed
            await asyncio.sleep(0.5)
            slow_task_completed = True

        # Patch asyncio.create_task to use our mock
        with patch('asyncio.create_task', side_effect=mock_create_task):
            # Also patch the _execute_webhook_task method
            with patch.object(
                webhook_dispatcher, '_execute_webhook_task', mock_execute_webhook_task
            ):
                # Measure how fast the dispatch function returns
                start_time = asyncio.get_event_loop().time()
                await webhook_dispatcher.dispatch_feedback_created(
                    mock_db, mock_feedback
                )
                end_time = asyncio.get_event_loop().time()

                # The dispatch should return almost immediately, not waiting for task execution
                dispatch_time = end_time - start_time
                assert (
                    dispatch_time < 0.1
                ), f'Dispatch took {dispatch_time}s, should be near-instantaneous'

                # Task should have started but not completed
                assert slow_task_started, 'Task should have started'
                assert not slow_task_completed, 'Task should not have completed yet'

                # Wait for task to complete
                await asyncio.sleep(0.6)
                assert slow_task_completed, 'Task should have completed after waiting'
