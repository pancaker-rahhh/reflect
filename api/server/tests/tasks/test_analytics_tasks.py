import pytest
from uuid import UUID
from datetime import datetime, timedelta
from unittest.mock import AsyncMock, patch, MagicMock

from app.services.tasks.analytics_tasks import (
    calculate_project_metrics,
    generate_feedback_report,
)
from app.services.analytics_service import analytics_service


@pytest.mark.asyncio
async def test_calculate_project_metrics():
    """Test calculating project metrics."""
    # Arrange
    ctx = {}
    project_id = UUID('00000000-0000-0000-0000-000000000000')
    start_date = (datetime.now() - timedelta(days=30)).isoformat()
    end_date = datetime.now().isoformat()

    # Mock the project repository and project
    mock_project = MagicMock()
    mock_project.id = project_id
    mock_project.name = 'Test Project'

    # Mock feedback data
    mock_feedback_item1 = MagicMock()
    mock_feedback_item1.feedback_type.value = 'feature_request'
    mock_feedback_item1.status.value = 'open'

    mock_feedback_item2 = MagicMock()
    mock_feedback_item2.feedback_type.value = 'bug_report'
    mock_feedback_item2.status.value = 'closed'

    mock_feedback_items = [mock_feedback_item1, mock_feedback_item2]

    # Act
    with patch(
        'app.services.tasks.analytics_tasks.AsyncSessionLocal'
    ) as mock_db, patch(
        'app.services.tasks.analytics_tasks.project_repository'
    ) as mock_project_repo, patch(
        'app.services.tasks.analytics_tasks.feedback_repository'
    ) as mock_feedback_repo:
        # Configure mocks
        mock_session = AsyncMock()
        mock_db.return_value.__aenter__.return_value = mock_session

        mock_project_repo.get.return_value = mock_project
        mock_feedback_repo.get_by_project_and_date_range.return_value = (
            mock_feedback_items
        )

        # Execute task
        result = await calculate_project_metrics(ctx, project_id, start_date, end_date)

    # Assert
    assert result['status'] == 'success'
    assert 'metrics' in result
    assert result['metrics']['total_feedback'] == 2
    assert 'by_type' in result['metrics']
    assert 'by_status' in result['metrics']
    assert result['metrics']['by_type']['feature_request'] == 1
    assert result['metrics']['by_type']['bug_report'] == 1


@pytest.mark.asyncio
async def test_calculate_project_metrics_no_data():
    """Test calculating project metrics with no data."""
    # Arrange
    ctx = {}
    project_id = UUID('00000000-0000-0000-0000-000000000000')

    # Mock the project repository and project
    mock_project = MagicMock()
    mock_project.id = project_id
    mock_project.name = 'Test Project'

    # Act
    with patch(
        'app.services.tasks.analytics_tasks.AsyncSessionLocal'
    ) as mock_db, patch(
        'app.services.tasks.analytics_tasks.project_repository'
    ) as mock_project_repo, patch(
        'app.services.tasks.analytics_tasks.feedback_repository'
    ) as mock_feedback_repo:
        # Configure mocks
        mock_session = AsyncMock()
        mock_db.return_value.__aenter__.return_value = mock_session

        mock_project_repo.get.return_value = mock_project
        mock_feedback_repo.get_by_project_and_date_range.return_value = []

        # Execute task
        result = await calculate_project_metrics(ctx, project_id)

    # Assert
    assert result['status'] == 'success'
    assert 'metrics' in result
    assert result['metrics']['total_feedback'] == 0


@pytest.mark.asyncio
async def test_generate_feedback_report():
    """Test generating a feedback report."""
    # Arrange
    ctx = {}
    project_id = UUID('00000000-0000-0000-0000-000000000000')
    report_type = 'weekly_summary'
    params = {'include_charts': True}

    # Mock the project repository and project
    mock_project = MagicMock()
    mock_project.id = project_id
    mock_project.name = 'Test Project'

    # Mock feedback data
    mock_feedback_items = [MagicMock() for _ in range(10)]

    # Act
    with patch(
        'app.services.tasks.analytics_tasks.AsyncSessionLocal'
    ) as mock_db, patch(
        'app.services.tasks.analytics_tasks.project_repository'
    ) as mock_project_repo, patch(
        'app.services.tasks.analytics_tasks.feedback_repository'
    ) as mock_feedback_repo:
        # Configure mocks
        mock_session = AsyncMock()
        mock_db.return_value.__aenter__.return_value = mock_session

        mock_project_repo.get.return_value = mock_project
        mock_feedback_repo.get_by_project_and_date_range.return_value = (
            mock_feedback_items
        )

        # Execute task
        result = await generate_feedback_report(ctx, project_id, report_type, params)

    # Assert
    assert result['status'] == 'success'
    assert 'report' in result
    assert result['report']['type'] == report_type
    assert 'data' in result['report']
    assert result['report']['data']['total_items'] == len(mock_feedback_items)


@pytest.mark.asyncio
async def test_analytics_service_get_metrics(
    test_db, background_tasks, mock_task_executor
):
    """Test analytics service get metrics method."""
    # Arrange
    project_id = UUID('00000000-0000-0000-0000-000000000000')
    start_date = datetime.now() - timedelta(days=30)
    end_date = datetime.now()

    # Act
    result = await analytics_service.get_project_metrics(
        test_db, background_tasks, project_id, start_date, end_date
    )

    # Assert
    assert result['status'] == 'queued'
    mock_task_executor.execute.assert_called_once()
    args = mock_task_executor.execute.call_args[0]
    assert args[0] == 'calculate_project_metrics'
    assert args[1]['project_id'] == project_id
    assert args[1]['start_date'] is not None
    assert args[1]['end_date'] is not None


@pytest.mark.asyncio
async def test_analytics_service_generate_report(
    test_db, background_tasks, mock_task_executor
):
    """Test analytics service generate report method."""
    # Arrange
    project_id = UUID('00000000-0000-0000-0000-000000000000')
    report_type = 'weekly_summary'
    params = {'include_charts': True}

    # Act
    result = await analytics_service.generate_report(
        test_db, background_tasks, project_id, report_type, params
    )

    # Assert
    assert result['status'] == 'queued'
    mock_task_executor.execute.assert_called_once()
    args = mock_task_executor.execute.call_args[0]
    assert args[0] == 'generate_feedback_report'
    assert args[1]['project_id'] == project_id
    assert args[1]['report_type'] == report_type
    assert args[1]['params'] == params
