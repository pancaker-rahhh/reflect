from typing import Dict, Any, List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from app.repositories.feedback_repository import feedback_repository
from app.core.logging import get_logger
from fastapi import HTTPException

logger = get_logger(__name__)


class DashboardService:
    def __init__(self):
        self.feedback_repository = feedback_repository

    async def get_dashboard_metrics(
        self,
        db: AsyncSession,
        time_range: str = 'all',
        project_id: Optional[str] = None,
    ) -> Dict[str, Any]:
        try:
            # Validate time_range
            valid_time_ranges = ['all', 'week', 'month', 'year']
            if time_range not in valid_time_ranges:
                raise HTTPException(
                    status_code=400,
                    detail=f'Invalid time_range: {time_range}. Must be one of: {", ".join(valid_time_ranges)}',
                )

            return await self.feedback_repository.get_dashboard_metrics(
                db, project_id, time_range
            )
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f'Error getting dashboard metrics: {str(e)}')
            raise HTTPException(
                status_code=500,
                detail='Failed to retrieve dashboard metrics. Please try again later.',
            )

    async def get_recent_activity(
        self, db: AsyncSession, project_id: Optional[str] = None, limit: int = 10
    ) -> List[Dict[str, Any]]:
        try:
            # Validate limit
            if limit < 1 or limit > 100:
                raise HTTPException(
                    status_code=400, detail='Limit must be between 1 and 100'
                )

            return await self.feedback_repository.get_recent_activities(
                db, project_id, limit
            )
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f'Error getting recent activity: {str(e)}')
            raise HTTPException(
                status_code=500,
                detail='Failed to retrieve recent activity. Please try again later.',
            )

    async def get_feedback_data(
        self,
        db: AsyncSession,
        feedback_type: Optional[str] = None,
        project_id: Optional[str] = None,
        time_range: str = 'all',
        limit: int = 100,
        offset: int = 0,
    ) -> List[Dict[str, Any]]:
        try:
            # Validate limit and offset
            if limit < 1 or limit > 1000:
                raise HTTPException(
                    status_code=400, detail='Limit must be between 1 and 1000'
                )

            if offset < 0:
                raise HTTPException(
                    status_code=400, detail='Offset must be 0 or greater'
                )

            return await self.feedback_repository.get_public_feedback_for_widget(
                db,
                widget_id=None,
                project_id=project_id,
                feedback_type=feedback_type,
                time_range=time_range,
                limit=limit,
                offset=offset,
            )
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f'Error getting feedback data: {str(e)}')
            raise HTTPException(
                status_code=500,
                detail='Failed to retrieve feedback data. Please try again later.',
            )


dashboard_service = DashboardService()
