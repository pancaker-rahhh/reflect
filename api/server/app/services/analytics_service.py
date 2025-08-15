from typing import Dict, Any, Optional
from uuid import UUID
from datetime import datetime
from fastapi import BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession

from app.services.tasks.executor_factory import task_executor_factory
from app.repositories.project_repository import project_repository
from app.core.logging import get_logger

logger = get_logger(__name__)


class AnalyticsService:
    """
    Service for handling analytics and reporting.
    Uses ARQ task queue for asynchronous processing.
    """

    async def get_project_metrics(
        self,
        db: AsyncSession,
        background_tasks: BackgroundTasks,
        project_id: UUID,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None,
    ) -> Dict[str, Any]:
        """
        Queue a task to calculate project metrics asynchronously.

        Args:
            db: Database session
            background_tasks: FastAPI background tasks
            project_id: Project ID
            start_date: Optional start date for the analysis period
            end_date: Optional end date for the analysis period

        Returns:
            Dict with task information
        """
        try:
            # Validate that project exists
            project = await project_repository.get(db, project_id)
            if not project:
                return {'status': 'error', 'message': 'Project not found'}

            # Convert dates to ISO format strings for JSON serialization
            start_date_str = start_date.isoformat() if start_date else None
            end_date_str = end_date.isoformat() if end_date else None

            # Use ARQ task queue
            executor = task_executor_factory(background_tasks)
            await executor.execute(
                'calculate_project_metrics',
                {
                    'project_id': project_id,
                    'start_date': start_date_str,
                    'end_date': end_date_str,
                },
            )

            logger.info(
                'analytics.metrics.queued',
                project_id=str(project_id),
                start_date=start_date_str,
                end_date=end_date_str,
            )

            return {
                'status': 'queued',
                'message': 'Analytics calculation has been queued',
            }

        except Exception as e:
            logger.error(
                'analytics.metrics.queue_failed',
                project_id=str(project_id),
                error=str(e),
            )
            return {
                'status': 'error',
                'message': f'Failed to queue analytics calculation: {str(e)}',
            }

    async def generate_report(
        self,
        db: AsyncSession,
        background_tasks: BackgroundTasks,
        project_id: UUID,
        report_type: str,
        params: Dict[str, Any] = None,
    ) -> Dict[str, Any]:
        """
        Queue a task to generate a report asynchronously.

        Args:
            db: Database session
            background_tasks: FastAPI background tasks
            project_id: Project ID
            report_type: Type of report to generate
            params: Optional parameters for report generation

        Returns:
            Dict with task information
        """
        try:
            # Validate that project exists
            project = await project_repository.get(db, project_id)
            if not project:
                return {'status': 'error', 'message': 'Project not found'}

            # Validate report type
            valid_report_types = [
                'weekly_summary',
                'monthly_summary',
                'feedback_distribution',
                'nps_analysis',
            ]
            if report_type not in valid_report_types:
                return {
                    'status': 'error',
                    'message': f"Invalid report type. Must be one of: {', '.join(valid_report_types)}",
                }

            # Use ARQ task queue
            executor = task_executor_factory(background_tasks)
            await executor.execute(
                'generate_feedback_report',
                {
                    'project_id': project_id,
                    'report_type': report_type,
                    'params': params or {},
                },
            )

            logger.info(
                'analytics.report.queued',
                project_id=str(project_id),
                report_type=report_type,
            )

            return {
                'status': 'queued',
                'message': f'{report_type} report generation has been queued',
            }

        except Exception as e:
            logger.error(
                'analytics.report.queue_failed',
                project_id=str(project_id),
                report_type=report_type,
                error=str(e),
            )
            return {
                'status': 'error',
                'message': f'Failed to queue report generation: {str(e)}',
            }

    async def schedule_recurring_report(
        self,
        db: AsyncSession,
        background_tasks: BackgroundTasks,
        project_id: UUID,
        report_type: str,
        schedule: str,
        params: Dict[str, Any] = None,
    ) -> Dict[str, Any]:
        """
        Schedule a recurring report.

        Args:
            db: Database session
            background_tasks: FastAPI background tasks
            project_id: Project ID
            report_type: Type of report to generate
            schedule: Schedule frequency (daily, weekly, monthly)
            params: Optional parameters for report generation

        Returns:
            Dict with schedule information
        """
        try:
            # Validate that project exists
            project = await project_repository.get(db, project_id)
            if not project:
                return {'status': 'error', 'message': 'Project not found'}

            # Validate report type
            valid_report_types = [
                'weekly_summary',
                'monthly_summary',
                'feedback_distribution',
                'nps_analysis',
            ]
            if report_type not in valid_report_types:
                return {
                    'status': 'error',
                    'message': f"Invalid report type. Must be one of: {', '.join(valid_report_types)}",
                }

            # Validate schedule
            valid_schedules = ['daily', 'weekly', 'monthly']
            if schedule not in valid_schedules:
                return {
                    'status': 'error',
                    'message': f"Invalid schedule. Must be one of: {', '.join(valid_schedules)}",
                }

            # For now, just generate the report immediately
            # In a real implementation, you would store the schedule in the database
            # and have a scheduler that triggers the report generation
            executor = task_executor_factory(background_tasks)
            await executor.execute(
                'generate_feedback_report',
                {
                    'project_id': project_id,
                    'report_type': report_type,
                    'params': params or {},
                },
            )

            logger.info(
                'analytics.report.scheduled',
                project_id=str(project_id),
                report_type=report_type,
                schedule=schedule,
            )

            return {
                'status': 'scheduled',
                'message': f'{report_type} report has been scheduled to run {schedule}',
            }

        except Exception as e:
            logger.error(
                'analytics.report.schedule_failed',
                project_id=str(project_id),
                report_type=report_type,
                schedule=schedule,
                error=str(e),
            )
            return {
                'status': 'error',
                'message': f'Failed to schedule report: {str(e)}',
            }


# Service singleton instance
analytics_service = AnalyticsService()
