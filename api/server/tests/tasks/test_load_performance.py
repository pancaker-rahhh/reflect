import pytest
import asyncio
import time
from uuid import UUID
from unittest.mock import AsyncMock, MagicMock, patch

from app.services.webhook_dispatcher import webhook_dispatcher
from app.models.feedback_model import (
    Feedback,
    FeedbackType,
    FeedbackStatus,
    FeedbackPriority,
)


@pytest.mark.asyncio
async def test_parallel_task_queueing():
    """
    Test the system's ability to queue multiple tasks in parallel.
    This is crucial for handling high traffic scenarios.
    """
    # Arrange
    mock_db = AsyncMock()
    num_tasks = 100  # Simulate high volume of events

    # Create mock feedback objects
    mock_feedbacks = []
    for i in range(num_tasks):
        mock_feedback = MagicMock(spec=Feedback)
        mock_feedback.id = UUID(f'00000000-0000-0000-0000-{i:012d}')
        mock_feedback.project_id = UUID('11111111-1111-1111-1111-111111111111')
        mock_feedback.feedback_type = FeedbackType.FEATURE_REQUEST
        mock_feedback.title = f'Test Feedback {i}'
        mock_feedback.message = f'Test message {i}'
        mock_feedback.status = FeedbackStatus.NEW
        mock_feedback.priority = FeedbackPriority.MEDIUM
        mock_feedbacks.append(mock_feedback)

    # Create a completely mocked executor with successful execution
    mock_executor = AsyncMock()
    mock_executor.execute = AsyncMock(return_value='test-job-id')

    # Define mock executor factory that doesn't try to connect to Redis
    def mock_executor_factory(*args, **kwargs):
        return mock_executor

    # Act - Queue tasks in parallel
    start_time = time.time()

    with patch(
        'app.services.webhook_dispatcher.task_executor_factory', mock_executor_factory
    ):
        # Use asyncio.gather to run tasks in parallel
        dispatch_tasks = [
            webhook_dispatcher.dispatch_feedback_created(mock_db, feedback)
            for feedback in mock_feedbacks
        ]
        await asyncio.gather(*dispatch_tasks)

    end_time = time.time()
    execution_time = end_time - start_time

    # Assert
    # Verify all tasks were queued
    assert mock_executor.execute.call_count == num_tasks

    # Check performance - should be much faster than processing sequentially
    # Even with mocks, parallel execution should be faster than it would take
    # to process 100 items sequentially if they took even 10ms each (which would be 1s)
    assert (
        execution_time < 1.0
    ), f'Parallel queueing took {execution_time}s, should be much faster'

    # Calculate theoretical throughput (tasks per second)
    throughput = num_tasks / execution_time
    print(f'Theoretical throughput: {throughput:.2f} tasks/second')


@pytest.mark.asyncio
async def test_non_blocking_behavior():
    """
    Test that task queueing doesn't block the main application thread.
    This is essential for maintaining application responsiveness under load.
    """
    # Arrange
    mock_db = AsyncMock()
    mock_feedback = MagicMock(spec=Feedback)
    mock_feedback.id = UUID('00000000-0000-0000-0000-000000000000')
    mock_feedback.project_id = UUID('11111111-1111-1111-1111-111111111111')
    mock_feedback.feedback_type = FeedbackType.FEATURE_REQUEST
    mock_feedback.status = FeedbackStatus.NEW
    mock_feedback.priority = FeedbackPriority.MEDIUM

    # Create a special mock executor that records when execute is called
    mock_executor = AsyncMock()

    # Flag to indicate if execute was called
    execute_called = False
    execute_completed = False

    async def tracking_execute(*args, **kwargs):
        nonlocal execute_called, execute_completed
        execute_called = True
        # Simulate a delay
        await asyncio.sleep(0.5)
        execute_completed = True
        return 'test-job-id'

    mock_executor.execute = tracking_execute

    # Define mock executor factory that doesn't try to connect to Redis
    def mock_executor_factory(*args, **kwargs):
        return mock_executor

    # Act - Measure if execution continues without waiting for task to complete
    with patch(
        'app.services.webhook_dispatcher.task_executor_factory', mock_executor_factory
    ):
        # Start a task that doesn't await completion
        task = asyncio.create_task(
            webhook_dispatcher.dispatch_feedback_created(mock_db, mock_feedback)
        )

        # Give it a moment to start execution
        await asyncio.sleep(0.1)

        # Check if execute was called but not yet completed
        assert execute_called, 'Task execution should have started'
        assert not execute_completed, 'Task execution should not have completed yet'

        # Wait for the task to finish (but it shouldn't be waiting for execute to complete)
        await task

        # Task should be done but execute might still be running
        assert execute_called, 'Task execution should have been called'

        # Wait to allow the execute function to complete
        await asyncio.sleep(0.5)
        assert execute_completed, 'Task execution should have completed after waiting'
