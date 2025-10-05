from typing import List, Optional, Any, Dict
from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, text, and_
from sqlalchemy.orm import selectinload
from datetime import datetime, timedelta, timezone
from app.core.logging import get_logger
from app.models.feedback_model import (
    Feedback,
    FeedbackType,
    SurveyFeedback,
    ReviewFeedback,
    BugReportFeedback,
    FeatureRequestFeedback,
    NPSFeedback,
    CSATFeedback,
    CESFeedback,
)
from app.utils.feedback_formatter import FeedbackFormatter
from app.repositories.base_repository import BaseRepository

logger = get_logger(__name__)


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
        skip: int = 0,
        limit: int = 100,
    ) -> List[Feedback]:
        filters = {}
        if project_id:
            filters['project_id'] = project_id
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

        logger.info(
            f'🔍 Deduplication query filters: widget_id={widget_id}, feedback_type={feedback_type_enum}, ip_address={ip_address}, user_agent={user_agent}'
        )
        logger.info(f'🔍 Cutoff time: {cutoff_time}')

        # Use SQLAlchemy 2.x async syntax - select only the ID to avoid lazy loading issues
        stmt = (
            select(Feedback.id)
            .where(and_(*filters))
            .order_by(Feedback.created_at.desc())
            .limit(1)
        )
        result = await db.execute(stmt)
        feedback_id = result.scalar_one_or_none()

        logger.info(f'🔍 Query result - feedback_id found: {feedback_id}')

        if feedback_id:
            # Return the full object if we found an ID
            return await self.get(db, feedback_id)
        return None

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
        where_conditions = []
        params = {}

        if project_id:
            where_conditions.append('f.project_id = :project_id')
            params['project_id'] = str(project_id)

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

            where_conditions.append('f.created_at >= :cutoff_date')
            params['cutoff_date'] = cutoff_date

        where_clause = ' AND '.join(where_conditions) if where_conditions else '1=1'
        base_where = f'WHERE {where_clause}'

        total_result = await db.execute(
            text(f'SELECT COUNT(*) FROM feedback f {base_where}'), params
        )
        total_feedback_count = total_result.scalar() or 0

        rating_query = f"""
        SELECT AVG(rating_value) as avg_rating
        FROM (
            SELECT f.id, f.rating as rating_value FROM feedback f {base_where} AND f.rating IS NOT NULL
            UNION ALL
            SELECT f.id, rf.overall_rating as rating_value FROM feedback f
            JOIN review_feedback rf ON f.id = rf.id {base_where} AND rf.overall_rating IS NOT NULL
            UNION ALL
            SELECT f.id, nf.nps_score as rating_value FROM feedback f
            JOIN nps_feedback nf ON f.id = nf.id {base_where} AND nf.nps_score IS NOT NULL
            UNION ALL
            SELECT f.id, cf.csat_score as rating_value FROM feedback f
            JOIN csat_feedback cf ON f.id = cf.id {base_where} AND cf.csat_score IS NOT NULL
            UNION ALL
            SELECT f.id, ces.ces_score as rating_value FROM feedback f
            JOIN ces_feedback ces ON f.id = ces.id {base_where} AND ces.ces_score IS NOT NULL
        ) all_ratings
        """

        rating_result = await db.execute(text(rating_query), params)
        average_rating = float(rating_result.scalar() or 0)

        bug_result = await db.execute(
            text(
                f'SELECT COUNT(*) FROM feedback f {base_where} AND f.feedback_type = :bug_type'
            ),
            {**params, 'bug_type': 'bug_report'},
        )
        new_bug_reports = bug_result.scalar() or 0

        feature_result = await db.execute(
            text(
                f'SELECT COUNT(*) FROM feedback f {base_where} AND f.feedback_type = :feature_type'
            ),
            {**params, 'feature_type': 'feature_request'},
        )
        new_feature_requests = feature_result.scalar() or 0

        # Since we removed the status column, we'll count all feedback as "pending review"
        pending_feedback_review = total_feedback_count

        return {
            'totalFeedback': total_feedback_count,
            'averageRating': round(average_rating, 1),
            'newBugReports': new_bug_reports,
            'newFeatureRequests': new_feature_requests,
            'pendingFeedbackReview': pending_feedback_review,
        }

    async def get_recent_activities(
        self, db: AsyncSession, project_id: Optional[UUID] = None, limit: int = 10
    ) -> List[Dict[str, Any]]:
        query = (
            select(Feedback)
            .options(selectinload(Feedback.widget))
            .order_by(
                Feedback.updated_at.desc().nullslast(), Feedback.created_at.desc()
            )
            .limit(limit)
        )

        if project_id:
            query = query.where(Feedback.project_id == project_id)

        result = await db.execute(query)
        feedback_items = result.scalars().all()

        activities = []
        for item in feedback_items:
            summary = FeedbackFormatter.format_display_title(item)

            widget_name = item.widget.name if item.widget else None

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
                    'is_actionable': item.is_actionable
                    if item.is_actionable is not None
                    else True,
                    'widget_name': widget_name,
                    'rating': item.rating,
                }
            )

        return activities

    async def get_public_feedback_for_widget(
        self,
        db: AsyncSession,
        widget_id: Optional[UUID] = None,
        project_id: Optional[UUID] = None,
        feedback_type: Optional[str] = None,
        time_range: str = 'all',
        limit: int = 100,
        offset: int = 0,
    ) -> List[Dict[str, Any]]:
        stmt = (
            select(Feedback)
            .options(selectinload(Feedback.widget))
            .order_by(Feedback.created_at.desc())
            .limit(limit)
            .offset(offset)
        )

        if widget_id:
            stmt = stmt.where(Feedback.widget_id == widget_id)

        if project_id:
            stmt = stmt.where(Feedback.project_id == project_id)

        if feedback_type:
            stmt = stmt.where(Feedback.feedback_type == feedback_type)

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

            stmt = stmt.where(Feedback.created_at >= cutoff_date)

        result = await db.execute(stmt)
        feedback_items = result.scalars().all()

        feedback_data = []
        for item in feedback_items:
            display_title = FeedbackFormatter.format_display_title(item)

            feedback_dict = {
                'id': str(item.id),
                'type': item.feedback_type,
                'feedback_type': item.feedback_type,
                'title': display_title,
                'message': item.message,
                'rating': item.rating,
                'created_at': item.created_at,
                'submitter_name': item.submitter_name,
                'submitter_email': item.submitter_email,
                'feedback_votes': item.feedback_votes,
                'is_anonymous': item.is_anonymous
                if item.is_anonymous is not None
                else True,
                'is_actionable': item.is_actionable
                if item.is_actionable is not None
                else True,
                'widget_name': item.widget.name if item.widget else None,
            }

            if item.feedback_metadata:
                feedback_dict.update(item.feedback_metadata)

            if item.feedback_type == 'review':
                review_stmt = select(ReviewFeedback).where(ReviewFeedback.id == item.id)
                review_result = await db.execute(review_stmt)
                review_data = review_result.scalar_one_or_none()
                if review_data:
                    feedback_dict.update(
                        {
                            'overall_rating': review_data.overall_rating,
                        }
                    )

            elif item.feedback_type == 'bug_report':
                bug_stmt = select(BugReportFeedback).where(
                    BugReportFeedback.id == item.id
                )
                bug_result = await db.execute(bug_stmt)
                bug_data = bug_result.scalar_one_or_none()
                if bug_data:
                    feedback_dict.update(
                        {
                            'severity_level': bug_data.severity_level,
                        }
                    )

            elif item.feedback_type == 'feature_request':
                feature_stmt = select(FeatureRequestFeedback).where(
                    FeatureRequestFeedback.id == item.id
                )
                feature_result = await db.execute(feature_stmt)
                feature_data = feature_result.scalar_one_or_none()
                if feature_data:
                    pass

            elif item.feedback_type == 'NPS':
                nps_stmt = select(NPSFeedback).where(NPSFeedback.id == item.id)
                nps_result = await db.execute(nps_stmt)
                nps_data = nps_result.scalar_one_or_none()
                if nps_data:
                    feedback_dict.update(
                        {
                            'nps_score': nps_data.nps_score,
                        }
                    )

            elif item.feedback_type == 'CSAT':
                csat_stmt = select(CSATFeedback).where(CSATFeedback.id == item.id)
                csat_result = await db.execute(csat_stmt)
                csat_data = csat_result.scalar_one_or_none()
                if csat_data:
                    feedback_dict.update(
                        {
                            'csat_score': csat_data.csat_score,
                        }
                    )

            elif item.feedback_type == 'CES':
                ces_stmt = select(CESFeedback).where(CESFeedback.id == item.id)
                ces_result = await db.execute(ces_stmt)
                ces_data = ces_result.scalar_one_or_none()
                if ces_data:
                    feedback_dict.update(
                        {
                            'ces_score': ces_data.ces_score,
                        }
                    )

            feedback_data.append(feedback_dict)

        return feedback_data

    async def get_public_bug_reports_for_widget(
        self,
        db: AsyncSession,
        widget_id: UUID,
        limit: int = 100,
        offset: int = 0,
    ) -> List[Dict[str, Any]]:
        return await self.get_public_feedback_for_widget(
            db=db,
            widget_id=widget_id,
            feedback_type='bug_report',
            limit=limit,
            offset=offset,
        )

    async def get_public_reviews_for_widget(
        self,
        db: AsyncSession,
        widget_id: UUID,
        limit: int = 100,
        offset: int = 0,
    ) -> List[Dict[str, Any]]:
        return await self.get_public_feedback_for_widget(
            db=db,
            widget_id=widget_id,
            feedback_type='review',
            limit=limit,
            offset=offset,
        )

    async def get_widget_metrics(
        self, db: AsyncSession, widget_id: UUID, time_range: str = 'all'
    ) -> Dict[str, Any]:
        time_filter = ''
        params = {'widget_id': str(widget_id)}

        if time_range != 'all':
            if time_range == '7d':
                time_filter = "AND f.created_at >= NOW() - INTERVAL '7 days'"
            elif time_range == '30d':
                time_filter = "AND f.created_at >= NOW() - INTERVAL '30 days'"
            elif time_range == '90d':
                time_filter = "AND f.created_at >= NOW() - INTERVAL '90 days'"

        responses_query = f"""
        SELECT COUNT(*) as total_responses
        FROM feedback f
        WHERE f.widget_id = :widget_id {time_filter}
        """

        responses_result = await db.execute(text(responses_query), params)
        total_responses = responses_result.scalar() or 0

        users_query = f"""
        SELECT COUNT(DISTINCT f.submitter_email) as unique_users
        FROM feedback f
        WHERE f.widget_id = :widget_id 
        AND f.submitter_email IS NOT NULL {time_filter}
        """

        users_result = await db.execute(text(users_query), params)
        unique_users = users_result.scalar() or 0

        last_activity_query = f"""
        SELECT MAX(f.created_at) as last_activity
        FROM feedback f
        WHERE f.widget_id = :widget_id {time_filter}
        """

        last_activity_result = await db.execute(text(last_activity_query), params)
        last_activity = last_activity_result.scalar()

        return {
            'total_responses': total_responses,
            'unique_users': unique_users,
            'last_activity': last_activity.isoformat() if last_activity else None,
            'time_range': time_range,
        }


feedback_repository = FeedbackRepository()
