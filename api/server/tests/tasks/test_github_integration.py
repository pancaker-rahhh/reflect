import pytest
import asyncio
from uuid import UUID
from unittest.mock import AsyncMock, MagicMock, patch

from app.services.github_integration_service import github_integration_service


@pytest.mark.asyncio
async def test_create_issue_from_feedback_async():
    """
    Test creating a GitHub issue from feedback using ARQ.
    This tests the actual GitHub service that uses ARQ.
    """
    # Arrange
    mock_db = AsyncMock()
    background_tasks = MagicMock()
    integration_id = UUID('00000000-0000-0000-0000-000000000000')
    feedback_id = UUID('11111111-1111-1111-1111-111111111111')
    title = 'Test Issue Title'
    labels = ['bug', 'enhancement']

    # Mock integration repository
    mock_integration = MagicMock()
    mock_integration.id = integration_id

    # Mock feedback repository
    mock_feedback = MagicMock()
    mock_feedback.id = feedback_id
    mock_feedback.title = 'Test Feedback'
    mock_feedback.message = 'Test feedback message'

    # Track if _execute_issue_creation_task was called
    task_called = False
    task_args = None

    # Create a patched version of the _execute_issue_creation_task method
    async def mock_execute_task(self, executor, int_id, fb_id, payload):
        nonlocal task_called, task_args
        task_called = True
        task_args = payload
        # Don't try to await the mock executor, just record that it was called

    # Act
    with patch('app.services.github_integration_service.task_executor_factory'), patch(
        'app.repositories.integration_repository.integration_repository.get',
        return_value=mock_integration,
    ), patch(
        'app.repositories.feedback_repository.feedback_repository.get',
        return_value=mock_feedback,
    ), patch(
        'app.services.github_integration_service.GitHubIntegrationService._execute_issue_creation_task',
        new=mock_execute_task,
    ):
        # Execute the method under test
        result = await github_integration_service.create_issue_from_feedback_async(
            mock_db, background_tasks, integration_id, feedback_id, title, labels
        )

        # Give the asyncio event loop a chance to run any pending tasks
        await asyncio.sleep(0.1)

    # Assert
    assert result['status'] == 'queued'
    assert (
        task_called
    ), 'The _execute_issue_creation_task method should have been called'

    # Check that the correct parameters were passed
    assert task_args is not None
    assert task_args['integration_id'] == integration_id
    assert task_args['feedback_id'] == feedback_id
    assert 'issue_data' in task_args
    assert task_args['issue_data']['title'] == title
    assert task_args['issue_data']['labels'] == labels


@pytest.mark.asyncio
async def test_sync_repository_data_scalability():
    """
    Test synchronizing GitHub repository data using ARQ for scalability.
    This test verifies that:
    1. Integration synchronization tasks are properly queued
    2. The system can handle syncing multiple repos without blocking
    3. The design allows for parallel processing of sync operations
    """
    # Arrange
    mock_db = AsyncMock()
    background_tasks = MagicMock()

    # Set up multiple integrations to test parallel processing
    integration_ids = [
        UUID('00000000-0000-0000-0000-000000000000'),
        UUID('11111111-1111-1111-1111-111111111111'),
        UUID('22222222-2222-2222-2222-222222222222'),
    ]

    # Mock integration repository
    mock_integration = MagicMock()

    # Track task calls and arguments
    task_calls = []

    # Create a patched version of the _execute_sync_task method
    async def mock_execute_sync_task(self, executor, int_id):
        task_calls.append(int_id)
        # We don't need to actually call executor.execute here since we're just tracking calls

    # Act & Assert - Test synchronization for multiple integrations
    with patch('app.services.github_integration_service.task_executor_factory'), patch(
        'app.repositories.integration_repository.integration_repository.get',
        return_value=mock_integration,
    ), patch(
        'app.services.github_integration_service.GitHubIntegrationService._execute_sync_task',
        new=mock_execute_sync_task,
    ):
        # Synchronize multiple repos in sequence (simulating API calls)
        for idx, integration_id in enumerate(integration_ids):
            mock_integration.id = integration_id

            result = await github_integration_service.sync_repository_data_async(
                mock_db, background_tasks, integration_id
            )

            # Verify the task was queued successfully
            assert result['status'] == 'queued'

        # Give the asyncio event loop a chance to run any pending tasks
        await asyncio.sleep(0.1)

        # Verify all integrations were queued (key for scalability)
        assert len(task_calls) == len(integration_ids)

        # Check that all integration IDs were passed to the task executor
        for integration_id in integration_ids:
            assert (
                integration_id in task_calls
            ), f'Integration ID {integration_id} was not queued'

        # In a real scalable system, these would be processed in parallel by multiple worker instances
        # The fact that we queue tasks rather than process synchronously enables this horizontal scaling
