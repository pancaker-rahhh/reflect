from __future__ import annotations
from typing import List, Optional, Dict, Any
from uuid import UUID
from datetime import datetime
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from sqlalchemy import select

from app.models.feedback_model import (
    Feedback,
    FeedbackType,
    FeedbackPriority,
    FeedbackStatus,
    SurveyFeedback,
    ReviewFeedback,
    BugReportFeedback,
    FeatureRequestFeedback,
    NPSFeedback,
    CSATFeedback,
    CESFeedback,
)
from app.models.roadmap_model import RoadmapFeature, RoadmapColumn
from app.repositories.roadmap_repository import (
    roadmap_feature_repository,
    roadmap_column_repository,
    roadmap_tag_repository,
    roadmap_feature_tag_repository,
)
from app.repositories.feedback_repository import feedback_repository
from app.core.exceptions import NotFoundError, ValidationError
from app.core.logging import get_logger

logger = get_logger(__name__)


class ActionItemService:
    FEEDBACK_TYPE_TAGS = {
        FeedbackType.BUG_REPORT: ['bug', 'needs-fix', 'issue'],
        FeedbackType.FEATURE_REQUEST: ['feature-request', 'enhancement', 'new-feature'],
        FeedbackType.REVIEW: ['user-feedback', 'review'],
        FeedbackType.NPS: ['user-satisfaction', 'nps'],
        FeedbackType.CSAT: ['user-experience', 'satisfaction'],
        FeedbackType.CES: ['user-experience', 'effort'],
        FeedbackType.GENERAL: ['general-feedback'],
        FeedbackType.SURVEY: ['survey-feedback'],
    }

    PRIORITY_MAPPING = {
        FeedbackType.BUG_REPORT: FeedbackPriority.HIGH,
        FeedbackType.FEATURE_REQUEST: FeedbackPriority.MEDIUM,
        FeedbackType.REVIEW: FeedbackPriority.MEDIUM,
        FeedbackType.NPS: FeedbackPriority.MEDIUM,
        FeedbackType.CSAT: FeedbackPriority.MEDIUM,
        FeedbackType.CES: FeedbackPriority.MEDIUM,
        FeedbackType.GENERAL: FeedbackPriority.LOW,
        FeedbackType.SURVEY: FeedbackPriority.LOW,
    }

    async def convert_feedback_to_roadmap_item(
        self,
        db: AsyncSession,
        feedback_id: UUID,
        user_id: UUID,
        priority: Optional[FeedbackPriority] = None,
        conversion_notes: Optional[str] = None,
        custom_tags: Optional[List[str]] = None,
    ) -> RoadmapFeature:
        feedback = await self._get_and_validate_feedback(db, feedback_id)

        from app.repositories.user_repository import user_repository

        current_user = await user_repository.get(db, user_id)
        if not current_user:
            raise ValidationError(f'User {user_id} not found')

        backlog_column = await self._ensure_backlog_column_exists(
            db, feedback.project_id, user_id
        )

        auto_tags = self._generate_tags_from_feedback_type(feedback.feedback_type)
        all_tags = auto_tags + (custom_tags or [])

        feature_data = {
            'column_id': backlog_column.id,
            'title': feedback.title or f'Feedback: {feedback.feedback_type.value}',
            'description': self._generate_description_from_feedback(
                feedback, feedback.submitter_name
            ),
            'order': 0,
            'vote_count': feedback.feedback_votes or 0,
            'submitter_name': current_user.name or current_user.email,
            'submitter_email': current_user.email,
        }

        feature = await roadmap_feature_repository.create(db, **feature_data)

        await self._create_and_assign_tags(db, feature.id, all_tags)

        await self._update_feedback_conversion_status(
            db, feedback.id, feature.id, conversion_notes
        )

        logger.info(
            f'Successfully converted feedback {feedback_id} to roadmap item {feature.id}'
        )
        return feature

    async def _get_and_validate_feedback(
        self, db: AsyncSession, feedback_id: UUID
    ) -> Feedback:
        feedback = await feedback_repository.get(db, id=feedback_id)
        if not feedback:
            raise NotFoundError(f'Feedback {feedback_id} not found')

        if not self._validate_actionable_feedback(feedback):
            raise ValidationError(
                f'Feedback {feedback_id} cannot be converted to action item'
            )

        if feedback.converted_to_roadmap_id:
            raise ValidationError(f'Feedback {feedback_id} has already been converted')

        return feedback

    def _validate_actionable_feedback(self, feedback: Feedback) -> bool:
        return feedback.is_actionable and feedback.status != FeedbackStatus.ARCHIVED

    async def _ensure_backlog_column_exists(
        self, db: AsyncSession, project_id: UUID, user_id: UUID
    ) -> RoadmapColumn:
        from app.services.roadmap_service import roadmap_service

        roadmap = await roadmap_service.get_or_create_roadmap(db, user_id, project_id)
        if not roadmap:
            raise ValidationError(f'Could not create roadmap for project {project_id}')

        backlog_column = await roadmap_column_repository.get_by_name_and_roadmap(
            db, roadmap.id, 'Backlog'
        )
        if not backlog_column:
            backlog_data = {
                'roadmap_id': roadmap.id,
                'name': 'Backlog',
                'color': '#6B7280',
                'status': 'new',
                'order': 0,
            }
            backlog_column = await roadmap_column_repository.create(db, **backlog_data)

        return backlog_column

    def _generate_tags_from_feedback_type(
        self, feedback_type: FeedbackType
    ) -> List[str]:
        base_tags = self.FEEDBACK_TYPE_TAGS.get(feedback_type, ['general'])

        if feedback_type == FeedbackType.REVIEW:
            base_tags.extend(['review-feedback'])
        elif feedback_type == FeedbackType.NPS:
            base_tags.extend(['nps-feedback'])
        elif feedback_type == FeedbackType.CSAT:
            base_tags.extend(['csat-feedback'])
        elif feedback_type == FeedbackType.CES:
            base_tags.extend(['ces-feedback'])

        return base_tags

    def _suggest_priority(self, feedback: Feedback) -> FeedbackPriority:
        base_priority = self.PRIORITY_MAPPING.get(
            feedback.feedback_type, FeedbackPriority.MEDIUM
        )

        if feedback.feedback_type == FeedbackType.BUG_REPORT:
            if (
                hasattr(feedback, 'severity_level')
                and feedback.severity_level == FeedbackPriority.CRITICAL
            ):
                return FeedbackPriority.CRITICAL

        if feedback.feedback_type in [
            FeedbackType.REVIEW,
            FeedbackType.NPS,
            FeedbackType.CSAT,
            FeedbackType.CES,
        ]:
            if hasattr(feedback, 'rating') and feedback.rating:
                if feedback.rating <= 2:
                    return FeedbackPriority.HIGH
                elif feedback.rating >= 4:
                    return FeedbackPriority.LOW

        return base_priority

    def _generate_description_from_feedback(
        self, feedback: Feedback, original_submitter_name: Optional[str] = None
    ) -> str:
        description_parts = []

        if feedback.message:
            description_parts.append(feedback.message)

        if feedback.feedback_type == FeedbackType.BUG_REPORT:
            if hasattr(feedback, 'steps_to_reproduce'):
                description_parts.append(
                    f'Steps to reproduce: {feedback.steps_to_reproduce}'
                )
            if hasattr(feedback, 'expected_behavior'):
                description_parts.append(
                    f'Expected behavior: {feedback.expected_behavior}'
                )
            if hasattr(feedback, 'actual_behavior'):
                description_parts.append(f'Actual behavior: {feedback.actual_behavior}')

        elif feedback.feedback_type == FeedbackType.FEATURE_REQUEST:
            if hasattr(feedback, 'use_case'):
                description_parts.append(f'Use case: {feedback.use_case}')
            if hasattr(feedback, 'suggested_solution'):
                description_parts.append(
                    f'Suggested solution: {feedback.suggested_solution}'
                )
            if hasattr(feedback, 'benefits'):
                description_parts.append(f'Benefits: {feedback.benefits}')

        elif feedback.feedback_type == FeedbackType.REVIEW:
            if hasattr(feedback, 'pros'):
                description_parts.append(f'Pros: {feedback.pros}')
            if hasattr(feedback, 'cons'):
                description_parts.append(f'Cons: {feedback.cons}')

        elif feedback.feedback_type in [
            FeedbackType.NPS,
            FeedbackType.CSAT,
            FeedbackType.CES,
        ]:
            if hasattr(feedback, 'follow_up_comment'):
                description_parts.append(f'Follow-up: {feedback.follow_up_comment}')

        if feedback.feedback_metadata:
            description_parts.append(f'Metadata: {feedback.feedback_metadata}')

        if original_submitter_name:
            description_parts.append(f'Original submitter: {original_submitter_name}')

        return (
            '\n\n'.join(description_parts)
            if description_parts
            else 'No description provided'
        )

    async def _create_and_assign_tags(
        self, db: AsyncSession, feature_id: UUID, tag_names: List[str]
    ) -> None:
        feature = await roadmap_feature_repository.get(db, id=feature_id)
        if not feature:
            return

        column = await roadmap_column_repository.get(db, id=feature.column_id)
        if not column:
            return

        for tag_name in tag_names:
            tag = await roadmap_tag_repository.get_by_name(
                db, column.roadmap_id, tag_name
            )
            if not tag:
                tag_data = {
                    'roadmap_id': column.roadmap_id,
                    'name': tag_name,
                    'color': self._get_tag_color(tag_name),
                }
                tag = await roadmap_tag_repository.create(db, **tag_data)

            feature_tag_data = {'feature_id': feature_id, 'tag_id': tag.id}
            await roadmap_feature_tag_repository.create(db, **feature_tag_data)

    def _get_tag_color(self, tag_name: str) -> str:
        colors = [
            '#EF4444',
            '#F59E0B',
            '#10B981',
            '#3B82F6',
            '#8B5CF6',
            '#EC4899',
            '#6B7280',
            '#84CC16',
        ]
        hash_val = hash(tag_name) % len(colors)
        return colors[hash_val]

    async def _update_feedback_conversion_status(
        self,
        db: AsyncSession,
        feedback_id: UUID,
        roadmap_item_id: UUID,
        conversion_notes: Optional[str],
    ) -> None:
        update_data = {
            'converted_to_roadmap_id': roadmap_item_id,
            'conversion_date': datetime.utcnow(),
            'conversion_notes': conversion_notes,
            'status': FeedbackStatus.IN_PROGRESS,
        }

        await feedback_repository.update_polymorphic(db, feedback_id, **update_data)

    async def get_actionable_feedback(
        self, db: AsyncSession, project_id: UUID, skip: int = 0, limit: int = 100
    ) -> List[Feedback]:
        query = (
            select(Feedback)
            .options(selectinload(Feedback.widget), selectinload(Feedback.project))
            .where(
                Feedback.project_id == project_id,
                Feedback.is_actionable.is_(True),
                Feedback.converted_to_roadmap_id.is_(None),
            )
            .order_by(Feedback.created_at.desc())
            .offset(skip)
            .limit(limit)
        )

        result = await db.execute(query)
        actionable_feedback = result.scalars().all()

        reloaded_feedback = []
        for feedback in actionable_feedback:
            if feedback.feedback_type == FeedbackType.SURVEY:
                specific_feedback = await db.get(SurveyFeedback, feedback.id)
            elif feedback.feedback_type == FeedbackType.REVIEW:
                specific_feedback = await db.get(ReviewFeedback, feedback.id)
            elif feedback.feedback_type == FeedbackType.BUG_REPORT:
                specific_feedback = await db.get(BugReportFeedback, feedback.id)
            elif feedback.feedback_type == FeedbackType.FEATURE_REQUEST:
                specific_feedback = await db.get(FeatureRequestFeedback, feedback.id)
            elif feedback.feedback_type == FeedbackType.NPS:
                specific_feedback = await db.get(NPSFeedback, feedback.id)
            elif feedback.feedback_type == FeedbackType.CSAT:
                specific_feedback = await db.get(CSATFeedback, feedback.id)
            elif feedback.feedback_type == FeedbackType.CES:
                specific_feedback = await db.get(CESFeedback, feedback.id)
            else:
                specific_feedback = feedback

            if specific_feedback:
                reloaded_feedback.append(specific_feedback)

        return reloaded_feedback

    async def get_conversion_preview(
        self, db: AsyncSession, feedback_id: UUID
    ) -> Dict[str, Any]:
        feedback = await self._get_and_validate_feedback(db, feedback_id)

        tag_names = self._generate_tags_from_feedback_type(feedback.feedback_type)
        suggested_tags = [
            {'name': name, 'color': self._get_tag_color(name)} for name in tag_names
        ]

        preview = {
            'suggested_title': feedback.title
            or f'Feedback: {feedback.feedback_type.value}',
            'suggested_description': self._generate_description_from_feedback(
                feedback, feedback.submitter_name
            ),
            'suggested_tags': suggested_tags,
            'suggested_priority': self._suggest_priority(feedback).value,
        }

        return preview


action_item_service = ActionItemService()
