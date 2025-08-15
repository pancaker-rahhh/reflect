import pytest
from uuid import UUID
from unittest.mock import AsyncMock, MagicMock, patch
from datetime import datetime, timedelta

from app.services.analytics_service import analytics_service


@pytest.mark.asyncio
async def test_get_project_metrics():
    """
    Test getting project metrics using ARQ.
    This tests the actual analytics service that uses ARQ.
    """
    # Arrange
    mock_db = AsyncMock()
    background_tasks = MagicMock()
    project_id = UUID('00000000-0000-0000-0000-000000000000')
    start_date = datetime.now() - timedelta(days=30)
    end_date = datetime.now()

    # Mock project repository
    mock_project = MagicMock()
    mock_project.id = project_id
    mock_project.name = 'Test Project'

    # Mock the task executor
    mock_executor = AsyncMock()
    mock_executor.execute = AsyncMock()

    # Act
    with patch(
        'app.services.tasks.executor_factory.task_executor_factory',
        return_value=mock_executor,
    ), patch(
        'app.repositories.project_repository.project_repository.get',
        return_value=mock_project,
    ):
        result = await analytics_service.get_project_metrics(
            mock_db, background_tasks, project_id, start_date, end_date
        )

    # Assert
    assert result['status'] == 'queued'
    mock_executor.execute.assert_called_once()

    # Check that the correct task and parameters were passed
    args = mock_executor.execute.call_args[0]
    assert args[0] == 'calculate_project_metrics'
    assert args[1]['project_id'] == project_id
    assert args[1]['start_date'] is not None
    assert args[1]['end_date'] is not None


@pytest.mark.asyncio
async def test_generate_report():
    """
    Test generating a report using ARQ.
    This tests the actual analytics service that uses ARQ.
    """
    # Arrange
    mock_db = AsyncMock()
    background_tasks = MagicMock()
    project_id = UUID('00000000-0000-0000-0000-000000000000')
    report_type = 'weekly_summary'
    params = {'include_charts': True}

    # Mock project repository
    mock_project = MagicMock()
    mock_project.id = project_id
    mock_project.name = 'Test Project'

    # Mock the task executor
    mock_executor = AsyncMock()
    mock_executor.execute = AsyncMock()

    # Act
    with patch(
        'app.services.tasks.executor_factory.task_executor_factory',
        return_value=mock_executor,
    ), patch(
        'app.repositories.project_repository.project_repository.get',
        return_value=mock_project,
    ):
        result = await analytics_service.generate_report(
            mock_db, background_tasks, project_id, report_type, params
        )

    # Assert
    assert result['status'] == 'queued'
    mock_executor.execute.assert_called_once()

    # Check that the correct task and parameters were passed
    args = mock_executor.execute.call_args[0]
    assert args[0] == 'generate_feedback_report'
    assert args[1]['project_id'] == project_id
    assert args[1]['report_type'] == report_type
    assert args[1]['params'] == params
