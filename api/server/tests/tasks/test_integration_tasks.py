import pytest
from uuid import UUID
from unittest.mock import AsyncMock, patch, MagicMock

from app.services.tasks.integration_tasks import (
    sync_integration_data,
    create_external_issue,
)
from app.models.integration_model import IntegrationType


@pytest.mark.asyncio
async def test_sync_integration_data_github():
    """Test syncing data with GitHub integration."""
    # Arrange
    ctx = {}
    integration_id = UUID('00000000-0000-0000-0000-000000000000')

    # Mock the integration repository and integration
    mock_integration = MagicMock()
    mock_integration.type = IntegrationType.GITHUB
    mock_integration.id = integration_id

    # Act
    with patch(
        'app.services.tasks.integration_tasks.AsyncSessionLocal'
    ) as mock_db, patch(
        'app.services.tasks.integration_tasks.integration_repository'
    ) as mock_repo, patch(
        'app.services.tasks.integration_tasks.github_integration_service'
    ):
        # Configure mocks
        mock_session = AsyncMock()
        mock_db.return_value.__aenter__.return_value = mock_session

        mock_repo.get.return_value = mock_integration

        # Execute task
        result = await sync_integration_data(ctx, integration_id)

    # Assert
    assert result['status'] == 'success'
    assert 'result' in result


@pytest.mark.asyncio
async def test_sync_integration_data_jira():
    """Test syncing data with JIRA integration."""
    # Arrange
    ctx = {}
    integration_id = UUID('00000000-0000-0000-0000-000000000000')

    # Mock the integration repository and integration
    mock_integration = MagicMock()
    mock_integration.type = IntegrationType.JIRA
    mock_integration.id = integration_id

    # Act
    with patch(
        'app.services.tasks.integration_tasks.AsyncSessionLocal'
    ) as mock_db, patch(
        'app.services.tasks.integration_tasks.integration_repository'
    ) as mock_repo, patch(
        'app.services.tasks.integration_tasks.jira_integration_service'
    ):
        # Configure mocks
        mock_session = AsyncMock()
        mock_db.return_value.__aenter__.return_value = mock_session

        mock_repo.get.return_value = mock_integration

        # Execute task
        result = await sync_integration_data(ctx, integration_id)

    # Assert
    assert result['status'] == 'success'
    assert 'result' in result


@pytest.mark.asyncio
async def test_create_external_issue_github():
    """Test creating an external issue in GitHub."""
    # Arrange
    ctx = {}
    integration_id = UUID('00000000-0000-0000-0000-000000000000')
    feedback_id = UUID('11111111-1111-1111-1111-111111111111')
    issue_data = {
        'title': 'Test Issue',
        'body': 'This is a test issue',
        'labels': ['bug', 'test'],
    }

    # Mock the integration repository and integration
    mock_integration = MagicMock()
    mock_integration.type = IntegrationType.GITHUB
    mock_integration.id = integration_id

    # Mock the feedback repository and feedback
    mock_feedback = MagicMock()
    mock_feedback.id = feedback_id
    mock_feedback.title = 'Test Feedback'
    mock_feedback.message = 'This is test feedback'

    # Act
    with patch(
        'app.services.tasks.integration_tasks.AsyncSessionLocal'
    ) as mock_db, patch(
        'app.services.tasks.integration_tasks.integration_repository'
    ) as mock_integration_repo, patch(
        'app.services.tasks.integration_tasks.feedback_repository'
    ) as mock_feedback_repo:
        # Configure mocks
        mock_session = AsyncMock()
        mock_db.return_value.__aenter__.return_value = mock_session

        mock_integration_repo.get.return_value = mock_integration
        mock_feedback_repo.get.return_value = mock_feedback

        # Execute task
        result = await create_external_issue(
            ctx, integration_id, feedback_id, issue_data
        )

    # Assert
    assert result['status'] == 'success'
    assert 'result' in result


@pytest.mark.asyncio
async def test_create_external_issue_jira():
    """Test creating an external issue in JIRA."""
    # Arrange
    ctx = {}
    integration_id = UUID('00000000-0000-0000-0000-000000000000')
    feedback_id = UUID('11111111-1111-1111-1111-111111111111')
    issue_data = {
        'title': 'Test Issue',
        'body': 'This is a test issue',
        'labels': ['bug', 'test'],
    }

    # Mock the integration repository and integration
    mock_integration = MagicMock()
    mock_integration.type = IntegrationType.JIRA
    mock_integration.id = integration_id

    # Mock the feedback repository and feedback
    mock_feedback = MagicMock()
    mock_feedback.id = feedback_id
    mock_feedback.title = 'Test Feedback'
    mock_feedback.message = 'This is test feedback'

    # Act
    with patch(
        'app.services.tasks.integration_tasks.AsyncSessionLocal'
    ) as mock_db, patch(
        'app.services.tasks.integration_tasks.integration_repository'
    ) as mock_integration_repo, patch(
        'app.services.tasks.integration_tasks.feedback_repository'
    ) as mock_feedback_repo:
        # Configure mocks
        mock_session = AsyncMock()
        mock_db.return_value.__aenter__.return_value = mock_session

        mock_integration_repo.get.return_value = mock_integration
        mock_feedback_repo.get.return_value = mock_feedback

        # Execute task
        result = await create_external_issue(
            ctx, integration_id, feedback_id, issue_data
        )

    # Assert
    assert result['status'] == 'success'
    assert 'result' in result


@pytest.mark.asyncio
async def test_integration_not_found():
    """Test behavior when integration is not found."""
    # Arrange
    ctx = {}
    integration_id = UUID('00000000-0000-0000-0000-000000000000')

    # Act
    with patch(
        'app.services.tasks.integration_tasks.AsyncSessionLocal'
    ) as mock_db, patch(
        'app.services.tasks.integration_tasks.integration_repository'
    ) as mock_repo:
        # Configure mocks
        mock_session = AsyncMock()
        mock_db.return_value.__aenter__.return_value = mock_session

        mock_repo.get.return_value = None

        # Execute task
        result = await sync_integration_data(ctx, integration_id)

    # Assert
    assert result['status'] == 'error'
    assert 'Integration not found' in result['message']
