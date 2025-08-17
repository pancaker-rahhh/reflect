from uuid import UUID
from typing import Dict, Any, Optional
from datetime import datetime, timedelta

from app.db import AsyncSessionLocal
from app.core.logging import get_logger

logger = get_logger(__name__)


async def calculate_project_metrics(
    ctx: dict,
    project_id: UUID,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
) -> Dict[str, Any]:
    logger.info(
        'task.analytics.metrics.started',
        project_id=str(project_id),
    )

    try:
        start_dt = (
            datetime.fromisoformat(start_date)
            if start_date
            else datetime.now() - timedelta(days=30)
        )
        end_dt = datetime.fromisoformat(end_date) if end_date else datetime.now()

        async with AsyncSessionLocal() as db:
            from app.repositories.project_repository import project_repository

            project = await project_repository.get(db, project_id)
            if not project:
                return {'status': 'error', 'message': 'Project not found'}

            from app.repositories.feedback_repository import feedback_repository

            feedback_items = await feedback_repository.get_by_project_and_date_range(
                db, project_id, start_dt, end_dt
            )

            total_count = len(feedback_items)
            if total_count == 0:
                logger.info(
                    'task.analytics.metrics.no_data',
                    project_id=str(project_id),
                )
                return {
                    'status': 'success',
                    'metrics': {
                        'total_feedback': 0,
                        'period_start': start_dt.isoformat(),
                        'period_end': end_dt.isoformat(),
                    },
                }

            feedback_types = {}
            feedback_status = {}
            sentiment_scores = []

            for item in feedback_items:
                feedback_type = item.feedback_type.value
                feedback_types[feedback_type] = feedback_types.get(feedback_type, 0) + 1

                status = item.status.value
                feedback_status[status] = feedback_status.get(status, 0) + 1

                if hasattr(item, 'rating') and item.rating is not None:
                    sentiment_scores.append(item.rating)

            avg_sentiment = (
                sum(sentiment_scores) / len(sentiment_scores)
                if sentiment_scores
                else None
            )

            metrics = {
                'total_feedback': total_count,
                'by_type': feedback_types,
                'by_status': feedback_status,
                'average_sentiment': avg_sentiment,
                'period_start': start_dt.isoformat(),
                'period_end': end_dt.isoformat(),
            }

            # Save metrics to cache/database if needed
            # Example: await metrics_repository.save_project_metrics(db, project_id, metrics)

            logger.info(
                'task.analytics.metrics.completed',
                project_id=str(project_id),
                total_count=total_count,
            )

            return {'status': 'success', 'metrics': metrics}

    except Exception as e:
        logger.error(
            'task.analytics.metrics.failed',
            project_id=str(project_id),
            error=str(e),
        )

        raise


async def generate_feedback_report(
    ctx: dict, project_id: UUID, report_type: str, params: Dict[str, Any]
) -> Dict[str, Any]:
    logger.info(
        'task.analytics.report.started',
        project_id=str(project_id),
        report_type=report_type,
    )

    try:
        async with AsyncSessionLocal() as db:
            from app.repositories.project_repository import project_repository

            project = await project_repository.get(db, project_id)
            if not project:
                return {'status': 'error', 'message': 'Project not found'}

            if report_type == 'weekly_summary':
                end_date = datetime.now()
                start_date = end_date - timedelta(days=7)

                from app.repositories.feedback_repository import feedback_repository

                feedback_items = (
                    await feedback_repository.get_by_project_and_date_range(
                        db, project_id, start_date, end_date
                    )
                )

                # Generate summary
                report_data = {
                    'period_start': start_date.isoformat(),
                    'period_end': end_date.isoformat(),
                    'total_items': len(feedback_items),
                    'project_name': project.name,
                    'sections': [],
                }

                # Add different sections to report
                # For example, top feature requests, most critical bugs, etc.

                # Save report (example)
                report_id = f"report-{project_id}-{datetime.now().strftime('%Y%m%d')}"
                # await report_repository.save_report(db, report_id, report_data)

                logger.info(
                    'task.analytics.report.completed',
                    project_id=str(project_id),
                    report_type=report_type,
                    report_id=report_id,
                )

                return {
                    'status': 'success',
                    'report': {
                        'id': report_id,
                        'type': report_type,
                        'data': report_data,
                    },
                }

            else:
                logger.error(
                    'task.analytics.report.unsupported_type',
                    project_id=str(project_id),
                    report_type=report_type,
                )
                return {
                    'status': 'error',
                    'message': f'Unsupported report type: {report_type}',
                }

    except Exception as e:
        logger.error(
            'task.analytics.report.failed',
            project_id=str(project_id),
            report_type=report_type,
            error=str(e),
        )

        raise
