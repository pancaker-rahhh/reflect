from typing import Optional, List
from fastapi import APIRouter, Depends, Query, HTTPException
from app.db import get_db
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.logging import get_logger
from app.services.dashboard_service import dashboard_service
from app.schemas.dashboard_schema import (
    DashboardMetricsResponse,
    RecentActivityResponse,
    FeedbackDataResponse,
)

logger = get_logger(__name__)

dashboard_router = APIRouter(prefix='/dashboard', tags=['dashboard'])


@dashboard_router.get('/metrics', response_model=DashboardMetricsResponse)
async def get_dashboard_metrics(
    time_range: Optional[str] = Query(
        default='all',
        description='Time range for metrics (all, week, month, year)',
        alias='time_range',
    ),
    project_id: Optional[str] = Query(
        default=None, description='Project ID for filtering', alias='projectId'
    ),
    db: AsyncSession = Depends(get_db),
) -> DashboardMetricsResponse:
    try:
        valid_time_ranges = ['all', 'week', 'month', 'year']
        if time_range and time_range not in valid_time_ranges:
            raise HTTPException(
                status_code=400,
                detail=f'Invalid time_range. Must be one of: {", ".join(valid_time_ranges)}',
            )

        if project_id:
            try:
                from uuid import UUID

                UUID(project_id)
            except ValueError:
                raise HTTPException(
                    status_code=400,
                    detail='Invalid project_id format. Must be a valid UUID.',
                )

        metrics = await dashboard_service.get_dashboard_metrics(
            db, time_range, project_id
        )
        return DashboardMetricsResponse(**metrics)
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f'Error getting dashboard metrics: {str(e)}')
        raise HTTPException(
            status_code=500,
            detail='Internal server error while fetching dashboard metrics',
        )


@dashboard_router.get('/recent-activity', response_model=List[RecentActivityResponse])
async def get_recent_activity(
    project_id: Optional[str] = Query(
        default=None, description='Project ID for filtering', alias='projectId'
    ),
    limit: int = Query(
        default=10, description='Number of recent activities', ge=1, le=100
    ),
    db: AsyncSession = Depends(get_db),
) -> List[RecentActivityResponse]:
    try:
        if project_id:
            try:
                from uuid import UUID

                UUID(project_id)
            except ValueError:
                raise HTTPException(
                    status_code=400,
                    detail='Invalid project_id format. Must be a valid UUID.',
                )

        activities = await dashboard_service.get_recent_activity(db, project_id, limit)
        return [RecentActivityResponse(**activity) for activity in activities]
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f'Error getting recent activity: {str(e)}')
        raise HTTPException(
            status_code=500,
            detail='Internal server error while fetching recent activity',
        )


@dashboard_router.get('/feedback-data', response_model=List[FeedbackDataResponse])
async def get_feedback_data(
    feedback_type: Optional[str] = Query(
        default=None,
        description='Filter by feedback type (general, survey, review, bug_report, feature_request, NPS, CSAT, CES)',
    ),
    project_id: Optional[str] = Query(
        default=None, description='Project ID for filtering', alias='projectId'
    ),
    time_range: Optional[str] = Query(
        default='all',
        description='Time range for filtering (all, week, month, year)',
        alias='timeRange',
    ),
    limit: int = Query(
        default=100, description='Number of feedback items', ge=1, le=1000
    ),
    offset: int = Query(default=0, description='Offset for pagination', ge=0),
    db: AsyncSession = Depends(get_db),
) -> List[FeedbackDataResponse]:
    try:
        valid_time_ranges = ['all', 'week', 'month', 'year']
        if time_range and time_range not in valid_time_ranges:
            raise HTTPException(
                status_code=400,
                detail=f'Invalid time_range. Must be one of: {", ".join(valid_time_ranges)}',
            )

        if feedback_type:
            valid_types = [
                'general',
                'survey',
                'review',
                'bug_report',
                'feature_request',
                'NPS',
                'CSAT',
                'CES',
            ]
            if feedback_type.lower() not in valid_types:
                raise HTTPException(
                    status_code=400,
                    detail=f'Invalid feedback_type. Must be one of: {", ".join(valid_types)}',
                )

        if project_id:
            try:
                from uuid import UUID

                UUID(project_id)
            except ValueError:
                raise HTTPException(
                    status_code=400,
                    detail='Invalid project_id format. Must be a valid UUID.',
                )

        feedback_data = await dashboard_service.get_feedback_data(
            db, feedback_type, project_id, time_range, limit, offset
        )
        return [FeedbackDataResponse(**item) for item in feedback_data]
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f'Error getting feedback data: {str(e)}')
        raise HTTPException(
            status_code=500, detail='Internal server error while fetching feedback data'
        )
