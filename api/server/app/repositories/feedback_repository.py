from typing import List, Optional, Any, Dict
from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.feedback_model import (
    Feedback,
    FeedbackStatus,
    FeedbackType,
    SurveyFeedback,
    ReviewFeedback,
    BugReportFeedback,
    FeatureRequestFeedback,
    NPSFeedback,
    CSATFeedback,
    CESFeedback,
)
from app.repositories.base_repository import BaseRepository


class FeedbackRepository(BaseRepository[Feedback]):
    def __init__(self):
        super().__init__(Feedback)

    async def get_by_project(
        self, db: AsyncSession, project_id: UUID, skip: int = 0, limit: int = 100
    ) -> List[Feedback]:
        return await self.get_multi(db, project_id=project_id, skip=skip, limit=limit)

    async def get_by_widget(
        self, db: AsyncSession, widget_id: UUID, skip: int = 0, limit: int = 100
    ) -> List[Feedback]:
        return await self.get_multi(db, widget_id=widget_id, skip=skip, limit=limit)

    async def get_by_status(
        self,
        db: AsyncSession,
        project_id: Optional[UUID] = None,
        status: Optional[FeedbackStatus] = None,
        skip: int = 0,
        limit: int = 100,
    ) -> List[Feedback]:
        filters = {}
        if project_id:
            filters['project_id'] = project_id
        if status:
            filters['status'] = status
        return await self.get_multi(db, skip=skip, limit=limit, **filters)

    async def get_by_type(
        self,
        db: AsyncSession,
        project_id: Optional[UUID] = None,
        feedback_type: Optional[FeedbackType] = None,
        skip: int = 0,
        limit: int = 100,
    ) -> List[Feedback]:
        filters = {}
        if project_id:
            filters['project_id'] = project_id
        if feedback_type:
            filters['feedback_type'] = feedback_type
        return await self.get_multi(db, skip=skip, limit=limit, **filters)

    async def create_polymorphic(self, db: AsyncSession, **obj_data: Any) -> Feedback:
        ftype = obj_data.get('feedback_type')
        if isinstance(ftype, str):
            try:
                ftype = FeedbackType(ftype)
            except Exception:
                ftype = FeedbackType.GENERAL
        model_cls: Any
        if ftype == FeedbackType.SURVEY:
            model_cls = SurveyFeedback
        elif ftype == FeedbackType.REVIEW:
            model_cls = ReviewFeedback
        elif ftype == FeedbackType.BUG_REPORT:
            model_cls = BugReportFeedback
        elif ftype == FeedbackType.FEATURE_REQUEST:
            model_cls = FeatureRequestFeedback
        elif ftype == FeedbackType.NPS:
            model_cls = NPSFeedback
        elif ftype == FeedbackType.CSAT:
            model_cls = CSATFeedback
        elif ftype == FeedbackType.CES:
            model_cls = CESFeedback
        else:
            model_cls = Feedback

        db_obj = model_cls(**obj_data)
        db.add(db_obj)
        await db.commit()
        await db.refresh(db_obj)
        return db_obj

    async def update_polymorphic(
        self, db: AsyncSession, id: UUID, **update_data: Any
    ) -> Optional[Feedback]:
        obj = await self.get(db, id)
        if not obj:
            return None
        for key, value in update_data.items():
            if value is not None and hasattr(obj, key):
                setattr(obj, key, value)
        db.add(obj)
        await db.commit()
        await db.refresh(obj)
        return obj

    async def delete_polymorphic(self, db: AsyncSession, id: UUID) -> bool:
        obj = await self.get(db, id)
        if not obj:
            return False
        await db.delete(obj)
        await db.commit()
        return True

    async def get_by_widget_and_type(
        self, db: AsyncSession, widget_id: UUID, feedback_type: FeedbackType
    ) -> List[Feedback]:
        """Get all feedback for a specific widget and type"""
        from sqlalchemy import select

        # Use the base Feedback model and filter by feedback_type and widget_id
        stmt = select(Feedback).where(
            Feedback.widget_id == widget_id, Feedback.feedback_type == feedback_type
        )
        result = await db.execute(stmt)
        return list(result.scalars().all())

    async def get_existing_feedback_by_context(
        self,
        db: AsyncSession,
        widget_id: UUID,
        context: Dict[str, Any],
        feedback_type: Any,
        within_hours: int = 24,
    ) -> Optional[Feedback]:
        """
        Check for existing feedback from the same user context to prevent duplicates.
        Looks for feedback with matching IP, user agent, and widget within the specified time window.
        """
        from sqlalchemy import and_, select
        from datetime import datetime, timedelta, timezone
        from app.models.feedback_model import FeedbackType

        # Convert WidgetType to FeedbackType if needed
        if hasattr(feedback_type, 'value'):
            # This is a WidgetType enum, convert to FeedbackType
            widget_type_value = feedback_type.value
            if widget_type_value == 'BUG_REPORT':
                feedback_type_enum = FeedbackType.BUG_REPORT
            elif widget_type_value == 'FEATURE_REQUEST':
                feedback_type_enum = FeedbackType.FEATURE_REQUEST
            elif widget_type_value == 'REVIEW':
                feedback_type_enum = FeedbackType.REVIEW
            elif widget_type_value == 'NPS':
                feedback_type_enum = FeedbackType.NPS
            elif widget_type_value == 'CSAT':
                feedback_type_enum = FeedbackType.CSAT
            elif widget_type_value == 'CES':
                feedback_type_enum = FeedbackType.CES
            elif widget_type_value == 'SURVEY':
                feedback_type_enum = FeedbackType.SURVEY
            else:
                feedback_type_enum = FeedbackType.GENERAL
        else:
            # This is already a FeedbackType or string, use as is
            feedback_type_enum = feedback_type

        # Extract IP and user agent from context
        ip_address = context.get('ip_address')
        user_agent = context.get('user_agent')

        if not ip_address and not user_agent:
            return None  # Can't deduplicate without context

        cutoff_time = datetime.now(timezone.utc) - timedelta(hours=within_hours)

        # Build query filters
        filters = [
            Feedback.widget_id == widget_id,
            Feedback.feedback_type == feedback_type_enum,
            Feedback.created_at >= cutoff_time,
        ]

        # Add context filters if available - now using context JSONB field
        if ip_address:
            filters.append(Feedback.context['ip_address'].astext == ip_address)
        if user_agent:
            filters.append(Feedback.context['user_agent'].astext == user_agent)

        # Use SQLAlchemy 2.x async syntax
        stmt = (
            select(Feedback)
            .where(and_(*filters))
            .order_by(Feedback.created_at.desc())
            .limit(1)
        )
        result = await db.execute(stmt)
        return result.scalar_one_or_none()

    async def update_votes(
        self, db: AsyncSession, feedback_id: UUID, new_vote_count: int
    ) -> bool:
        """Update the vote count for a feedback item"""
        obj = await self.get(db, feedback_id)
        if not obj:
            return False

        obj.feedback_votes = new_vote_count  # Use correct field name
        db.add(obj)
        await db.commit()
        return True

    async def get_dashboard_metrics(
        self,
        db: AsyncSession,
        project_id: Optional[UUID] = None,
        time_range: str = 'all',
    ) -> Dict[str, Any]:
        from sqlalchemy import text
        from datetime import datetime, timedelta

        where_conditions = []
        params = {}

        if project_id:
            where_conditions.append('project_id = :project_id')
            params['project_id'] = project_id

        if time_range != 'all':
            now = datetime.utcnow()
            if time_range == 'week':
                cutoff_date = now - timedelta(days=7)
            elif time_range == 'month':
                cutoff_date = now - timedelta(days=30)
            elif time_range == 'year':
                cutoff_date = now - timedelta(days=365)
            else:
                cutoff_date = now - timedelta(days=30)

            where_conditions.append('created_at >= :cutoff_date')
            params['cutoff_date'] = cutoff_date

        where_clause = ' AND '.join(where_conditions) if where_conditions else '1=1'
        base_where = f'WHERE {where_clause}'

        total_result = await db.execute(
            text(f'SELECT COUNT(*) FROM feedback {base_where}'), params
        )
        total_feedback_count = total_result.scalar() or 0

        rating_result = await db.execute(
            text(f'SELECT AVG(rating) FROM feedback {base_where}'), params
        )
        average_rating = float(rating_result.scalar() or 0)

        bug_result = await db.execute(
            text(
                f"SELECT COUNT(*) FROM feedback {base_where} AND feedback_type = 'bug_report'"
            ),
            params,
        )
        new_bug_reports = bug_result.scalar() or 0

        feature_result = await db.execute(
            text(
                f"SELECT COUNT(*) FROM feedback {base_where} AND feedback_type = 'feature_request'"
            ),
            params,
        )
        new_feature_requests = feature_result.scalar() or 0

        pending_result = await db.execute(
            text(f"SELECT COUNT(*) FROM feedback {base_where} AND status = 'NEW'"),
            params,
        )
        pending_feedback_review = pending_result.scalar() or 0

        return {
            'totalFeedback': total_feedback_count,
            'feedbackChange': 0,
            'averageRating': round(average_rating, 1),
            'ratingChange': 0,
            'newBugReports': new_bug_reports,
            'bugReportsChange': 0,
            'newFeatureRequests': new_feature_requests,
            'featureRequestsChange': 0,
            'pendingFeedbackReview': pending_feedback_review,
            'feedbackConversionRate': 0,
        }

    async def get_recent_activities(
        self, db: AsyncSession, project_id: Optional[UUID] = None, limit: int = 10
    ) -> List[Dict[str, Any]]:
        """Get recent feedback activities for dashboard"""
        query = select(Feedback).order_by(Feedback.created_at.desc()).limit(limit)

        if project_id:
            query = query.where(Feedback.project_id == project_id)

        result = await db.execute(query)
        feedback_items = result.scalars().all()

        activities = []
        for item in feedback_items:
            summary = f"New {item.feedback_type.replace('_', ' ').title()}"
            if item.title:
                summary = f'{summary}: {item.title}'
            elif item.message and len(item.message) > 50:
                summary = f'{summary}: {item.message[:50]}...'
            elif item.message:
                summary = f'{summary}: {item.message}'

            activities.append(
                {
                    'id': str(item.id),
                    'type': item.feedback_type,
                    'summary': summary,
                    'submittedBy': item.submitter_name or 'Anonymous',
                    'timestamp': item.created_at,
                    'converted_to_action_item_id': str(item.converted_to_action_item_id)
                    if item.converted_to_action_item_id
                    else None,
                    'is_actionable': item.is_actionable,
                }
            )

        return activities

    async def get_public_feedback_for_widget(
        self,
        db: AsyncSession,
        project_id: Optional[UUID] = None,
        feedback_type: Optional[str] = None,
        limit: int = 100,
        offset: int = 0,
    ) -> List[Dict[str, Any]]:
        """Get public feedback data for dashboard"""
        query = (
            select(Feedback)
            .order_by(Feedback.created_at.desc())
            .limit(limit)
            .offset(offset)
        )

        if project_id:
            query = query.where(Feedback.project_id == project_id)

        if feedback_type:
            try:
                ftype = FeedbackType(feedback_type.lower())
                query = query.where(Feedback.feedback_type == ftype)
            except ValueError:
                pass

        result = await db.execute(query)
        feedback_items = result.scalars().all()

        feedback_data = []
        for item in feedback_items:
            feedback_item = {
                'id': str(item.id),
                'type': item.feedback_type,
                'title': item.title,
                'message': item.message,
                'rating': item.rating,
                'status': item.status,
                'created_at': item.created_at,
                'submitter_name': item.submitter_name,
                'submitter_email': item.submitter_email,
                'feedback_votes': item.feedback_votes,
                'is_anonymous': item.is_anonymous,
                'is_actionable': item.is_actionable,
            }

            if item.feedback_metadata:
                feedback_item.update(item.feedback_metadata)

            feedback_data.append(feedback_item)

        return feedback_data


feedback_repository = FeedbackRepository()
