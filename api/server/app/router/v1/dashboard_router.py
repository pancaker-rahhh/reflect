from typing import Dict, Any, Optional
from fastapi import APIRouter, Depends, Query, HTTPException
from app.db import get_db
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.logging import get_logger

logger = get_logger(__name__)

dashboard_router = APIRouter(prefix='/dashboard', tags=['dashboard'])


@dashboard_router.get('/metrics')
async def get_dashboard_metrics(
    time_range: Optional[str] = Query(
        default='all', description='Time range for metrics'
    ),
    # No auth for testing
    db: AsyncSession = Depends(get_db),
) -> Dict[str, Any]:
    """Get dashboard metrics."""
    try:
        return {
            'totalFeedback': 0,
            'feedbackChange': 0,
            'averageRating': 0,
            'ratingChange': 0,
            'newBugReports': 0,
            'bugReportsChange': 0,
            'newFeatureRequests': 0,
            'featureRequestsChange': 0,
            'pendingFeedbackReview': 0,
            'feedbackConversionRate': 0,
        }
    except Exception as e:
        logger.error(f'Error getting dashboard metrics: {str(e)}')
        raise HTTPException(status_code=500, detail='Failed to get dashboard metrics')
