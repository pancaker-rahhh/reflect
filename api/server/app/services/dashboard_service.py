from typing import Dict, Any, List, Optional
from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException, status
from app.repositories.feedback_repository import feedback_repository
from app.services.permission_service import permission_service
from app.core.logging import get_logger

logger = get_logger(__name__)


class DashboardService:
    def __init__(self):
        self.feedback_repository = feedback_repository

    async def get_dashboard_metrics(
        self,
        db: AsyncSession,
        user_id: UUID,
        time_range: str = 'all',
        project_id: Optional[str] = None,
    ) -> Dict[str, Any]:
        try:
            valid_time_ranges = ['all', 'week', 'month', 'year']
            if time_range not in valid_time_ranges:
                raise HTTPException(
                    status_code=400,
                    detail=f'Invalid time_range: {time_range}. Must be one of: {", ".join(valid_time_ranges)}',
                )

            from uuid import UUID as UUIDType

            if project_id:
                project_uuid = UUIDType(project_id)
                role = await permission_service.get_user_role_in_project(
                    user_id, project_uuid, db
                )
                if not role:
                    raise HTTPException(
                        status_code=status.HTTP_403_FORBIDDEN,
                        detail='You do not have access to this project',
                    )
                return await self.feedback_repository.get_dashboard_metrics(
                    db, project_id, time_range
                )
            else:
                accessible_projects = await permission_service.get_accessible_projects(
                    user_id, None, db
                )

                if not accessible_projects:
                    return {
                        'totalFeedback': 0,
                        'averageRating': 0,
                        'newBugReports': 0,
                        'newFeatureRequests': 0,
                        'pendingFeedbackReview': 0,
                    }

                combined_metrics = {
                    'totalFeedback': 0,
                    'averageRating': 0,
                    'newBugReports': 0,
                    'newFeatureRequests': 0,
                    'pendingFeedbackReview': 0,
                }

                total_rating_sum = 0
                total_rating_count = 0

                for project in accessible_projects:
                    metrics = await self.feedback_repository.get_dashboard_metrics(
                        db, str(project.id), time_range
                    )
                    combined_metrics['totalFeedback'] += metrics.get('totalFeedback', 0)
                    combined_metrics['newBugReports'] += metrics.get('newBugReports', 0)
                    combined_metrics['newFeatureRequests'] += metrics.get(
                        'newFeatureRequests', 0
                    )
                    combined_metrics['pendingFeedbackReview'] += metrics.get(
                        'pendingFeedbackReview', 0
                    )

                    avg_rating = metrics.get('averageRating', 0)
                    if avg_rating > 0:
                        total_rating_sum += avg_rating * metrics.get('totalFeedback', 0)
                        total_rating_count += metrics.get('totalFeedback', 0)

                if total_rating_count > 0:
                    combined_metrics['averageRating'] = round(
                        total_rating_sum / total_rating_count, 1
                    )

                return combined_metrics
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f'Error getting dashboard metrics: {str(e)}')
            raise HTTPException(
                status_code=500,
                detail='Failed to retrieve dashboard metrics. Please try again later.',
            )

    async def get_recent_activity(
        self,
        db: AsyncSession,
        user_id: UUID,
        project_id: Optional[str] = None,
        limit: int = 10,
    ) -> List[Dict[str, Any]]:
        try:
            if limit < 1 or limit > 100:
                raise HTTPException(
                    status_code=400, detail='Limit must be between 1 and 100'
                )

            from uuid import UUID as UUIDType

            if project_id:
                project_uuid = UUIDType(project_id)
                role = await permission_service.get_user_role_in_project(
                    user_id, project_uuid, db
                )
                if not role:
                    raise HTTPException(
                        status_code=status.HTTP_403_FORBIDDEN,
                        detail='You do not have access to this project',
                    )
                return await self.feedback_repository.get_recent_activities(
                    db, project_id, limit
                )
            else:
                accessible_projects = await permission_service.get_accessible_projects(
                    user_id, None, db
                )
                accessible_project_ids = [str(p.id) for p in accessible_projects]

                all_activities = []
                for accessible_project_id in accessible_project_ids:
                    activities = await self.feedback_repository.get_recent_activities(
                        db, accessible_project_id, limit
                    )
                    all_activities.extend(activities)

                all_activities = sorted(
                    all_activities, key=lambda x: x.get('timestamp', ''), reverse=True
                )
                return all_activities[:limit]
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
        user_id: UUID,
        feedback_type: Optional[str] = None,
        project_id: Optional[str] = None,
        time_range: str = 'all',
        limit: int = 100,
        offset: int = 0,
    ) -> List[Dict[str, Any]]:
        try:
            if limit < 1 or limit > 1000:
                raise HTTPException(
                    status_code=400, detail='Limit must be between 1 and 1000'
                )

            if offset < 0:
                raise HTTPException(
                    status_code=400, detail='Offset must be 0 or greater'
                )

            from uuid import UUID as UUIDType

            accessible_projects = await permission_service.get_accessible_projects(
                user_id, None, db
            )
            accessible_project_ids = [str(p.id) for p in accessible_projects]

            logger.info(
                f'🔍 get_feedback_data: user {user_id} has access to projects: {accessible_project_ids}'
            )

            if project_id:
                project_uuid = UUIDType(project_id)
                role = await permission_service.get_user_role_in_project(
                    user_id, project_uuid, db
                )
                if not role:
                    logger.warning(
                        f'❌ User {user_id} tried to access unauthorized project {project_id}'
                    )
                    raise HTTPException(
                        status_code=status.HTTP_403_FORBIDDEN,
                        detail='You do not have access to this project',
                    )

                all_feedback = (
                    await self.feedback_repository.get_public_feedback_for_widget(
                        db,
                        widget_id=None,
                        project_id=project_id,
                        feedback_type=feedback_type,
                        time_range=time_range,
                        limit=limit,
                        offset=offset,
                    )
                )
            else:
                all_feedback = []
                for accessible_project_id in accessible_project_ids:
                    project_feedback = (
                        await self.feedback_repository.get_public_feedback_for_widget(
                            db,
                            widget_id=None,
                            project_id=accessible_project_id,
                            feedback_type=feedback_type,
                            time_range=time_range,
                            limit=limit,
                            offset=offset,
                        )
                    )
                    all_feedback.extend(project_feedback)

                all_feedback = sorted(
                    all_feedback, key=lambda x: x.get('created_at', ''), reverse=True
                )
                all_feedback = all_feedback[offset : offset + limit]

            logger.info(
                f'✅ Returning {len(all_feedback)} feedback items for user {user_id}'
            )
            return all_feedback
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f'Error getting feedback data: {str(e)}')
            raise HTTPException(
                status_code=500,
                detail='Failed to retrieve feedback data. Please try again later.',
            )


dashboard_service = DashboardService()
