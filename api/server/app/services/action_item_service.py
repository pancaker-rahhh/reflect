from __future__ import annotations
from typing import List, Optional, Dict, Any
from uuid import UUID
from datetime import datetime, timezone
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from sqlalchemy import select
from app.models.feedback_model import (
    Feedback,
    FeedbackType,
    FeedbackPriority,
    SurveyFeedback,
    ReviewFeedback,
    BugReportFeedback,
    FeatureRequestFeedback,
    NPSFeedback,
    CSATFeedback,
    CESFeedback,
)
from app.models.roadmap_model import (
    RoadmapActionItem,
    RoadmapColumn,
    RoadmapActionItemTag,
)
from app.repositories.roadmap_repository import (
    roadmap_repository,
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

    FEEDBACK_TYPE_MODELS = {
        FeedbackType.SURVEY: SurveyFeedback,
        FeedbackType.REVIEW: ReviewFeedback,
        FeedbackType.BUG_REPORT: BugReportFeedback,
        FeedbackType.FEATURE_REQUEST: FeatureRequestFeedback,
        FeedbackType.NPS: NPSFeedback,
        FeedbackType.CSAT: CSATFeedback,
        FeedbackType.CES: CESFeedback,
    }

    async def convert_feedback_to_roadmap_item(
        self,
        db: AsyncSession,
        feedback_id: UUID,
        user_id: UUID,
        priority: Optional[str] = None,
        title: Optional[str] = None,
        conversion_notes: Optional[str] = None,
        custom_tags: Optional[List[str]] = None,
        column_id: Optional[str] = None,
    ) -> RoadmapActionItem:
        feedback = await self._get_and_validate_feedback(db, feedback_id)
        typed_feedback = await self._get_typed_feedback(db, feedback)

        from app.repositories.user_repository import user_repository

        current_user = await user_repository.get(db, user_id)
        if not current_user:
            raise ValidationError(f'User {user_id} not found')

        # Use the provided column_id or fall back to the first column
        if column_id:
            try:
                selected_column = await roadmap_column_repository.get(
                    db, UUID(column_id)
                )
                if not selected_column:
                    raise ValidationError(f'Column {column_id} not found')
                # Verify the column belongs to the same project's roadmap
                roadmap = await roadmap_repository.get_by_project_id(
                    db, feedback.project_id
                )
                if not roadmap or selected_column.roadmap_id != roadmap.id:
                    raise ValidationError(
                        f'Column {column_id} does not belong to this project'
                    )
                target_column = selected_column
            except ValueError:
                raise ValidationError(f'Invalid column ID: {column_id}')
        else:
            target_column = await self._ensure_backlog_column_exists(
                db, feedback.project_id, user_id
            )

        # Only use custom tags provided by the user, no automatic tagging
        all_tags = custom_tags or []

        if priority:
            try:
                final_priority = FeedbackPriority(priority.lower())
            except ValueError:
                final_priority = self._suggest_priority(typed_feedback)
        else:
            final_priority = self._suggest_priority(typed_feedback)

        if title and title.strip():
            final_title = title.strip()
        else:
            final_title = (
                feedback.message or f'Feedback: {feedback.feedback_type.value}'
            )
            if len(final_title.strip()) < 3:
                final_title = f'{feedback.feedback_type.value.title()} Feedback'
                if len(final_title) < 3:
                    final_title = 'User Feedback'

        if len(final_title) > 255:
            final_title = final_title[:252] + '...'

        feature_data = {
            'column_id': target_column.id,
            'title': final_title,
            'description': await self._generate_description_from_feedback(
                db, typed_feedback, feedback.submitter_name, conversion_notes
            ),
            'priority': final_priority.value,
            'order': 0,
            'vote_count': feedback.feedback_votes or 0,
            'submitter_name': current_user.name or current_user.email,
            'submitter_email': current_user.email,
        }

        feature = await roadmap_feature_repository.create(db, **feature_data)

        await self._create_and_assign_tags(db, feature.id, all_tags, final_priority)

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

        # Allow re-conversion of feedback (in case the original roadmap item was deleted)
        return feedback

    def _validate_actionable_feedback(self, feedback: Feedback) -> bool:
        is_actionable = (
            feedback.is_actionable if feedback.is_actionable is not None else True
        )

        rating_based_types = [
            FeedbackType.NPS,
            FeedbackType.CSAT,
            FeedbackType.CES,
            FeedbackType.SURVEY,
            FeedbackType.REVIEW,
        ]
        if feedback.feedback_type in rating_based_types:
            has_meaningful_message = (
                feedback.message
                and feedback.message.strip()
                and not feedback.message.startswith('Rating:')
            )
            return is_actionable and has_meaningful_message

        return is_actionable

    async def _ensure_backlog_column_exists(
        self, db: AsyncSession, project_id: UUID, user_id: UUID
    ) -> RoadmapColumn:
        from app.services.roadmap_service import roadmap_service

        roadmap = await roadmap_service.get_or_create_roadmap(db, user_id, project_id)
        if not roadmap:
            raise ValidationError(f'Could not create roadmap for project {project_id}')

        columns = await roadmap_column_repository.get_by_roadmap(db, roadmap.id)

        if not columns:
            # If no columns exist, create a default "New" column
            new_column_data = {
                'roadmap_id': roadmap.id,
                'name': 'New',
                'color': '#94A3B8',
                'order': 0,
            }
            return await roadmap_column_repository.create(db, **new_column_data)

        # Find the column with the lowest order (first position)
        first_column = min(columns, key=lambda col: col.order)
        return first_column

    def _suggest_priority(self, feedback: Feedback) -> FeedbackPriority:
        base_priority = self.PRIORITY_MAPPING.get(
            feedback.feedback_type, FeedbackPriority.MEDIUM
        )

        if feedback.feedback_type == FeedbackType.BUG_REPORT:
            severity_level = getattr(feedback, 'severity_level', None)
            if severity_level == FeedbackPriority.CRITICAL:
                return FeedbackPriority.CRITICAL

        if feedback.feedback_type in [
            FeedbackType.REVIEW,
            FeedbackType.NPS,
            FeedbackType.CSAT,
            FeedbackType.CES,
        ]:
            if (
                feedback.feedback_type == FeedbackType.REVIEW
                and hasattr(feedback, 'overall_rating')
                and feedback.overall_rating
            ):
                rating = feedback.overall_rating
            elif (
                feedback.feedback_type == FeedbackType.NPS
                and hasattr(feedback, 'nps_score')
                and feedback.nps_score
            ):
                rating = feedback.nps_score
            elif (
                feedback.feedback_type == FeedbackType.CSAT
                and hasattr(feedback, 'csat_score')
                and feedback.csat_score
            ):
                rating = feedback.csat_score
            elif (
                feedback.feedback_type == FeedbackType.CES
                and hasattr(feedback, 'ces_score')
                and feedback.ces_score
            ):
                rating = feedback.ces_score
            else:
                rating = None

            if rating:
                if rating <= 2:
                    return FeedbackPriority.HIGH
                elif rating >= 4:
                    return FeedbackPriority.LOW

        return base_priority

    async def _generate_description_from_feedback(
        self,
        db: AsyncSession,
        feedback: Feedback,
        original_submitter_name: Optional[str] = None,
        conversion_notes: Optional[str] = None,
    ) -> str:
        if conversion_notes and conversion_notes.strip():
            return conversion_notes.strip()

        return ''

    async def _create_and_assign_tags(
        self,
        db: AsyncSession,
        feature_id: UUID,
        tag_names: List[str],
        priority: FeedbackPriority,
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

            existing_association = await db.execute(
                select(RoadmapActionItemTag).where(
                    RoadmapActionItemTag.action_item_id == feature_id,
                    RoadmapActionItemTag.tag_id == tag.id,
                )
            )
            if not existing_association.scalar_one_or_none():
                feature_tag_data = {
                    'action_item_id': feature_id,
                    'tag_id': tag.id,
                    'priority': priority.value,
                }
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
            'converted_to_action_item_id': roadmap_item_id,
            'conversion_date': datetime.now(timezone.utc).replace(tzinfo=None),
            'conversion_notes': conversion_notes,
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
                Feedback.converted_to_action_item_id.is_(None),
            )
            .order_by(
                Feedback.updated_at.desc().nullslast(), Feedback.created_at.desc()
            )
            .offset(skip)
            .limit(limit)
        )

        result = await db.execute(query)
        actionable_feedback = result.scalars().all()

        return [
            await self._get_typed_feedback(db, feedback)
            for feedback in actionable_feedback
        ]

    async def _get_typed_feedback(
        self, db: AsyncSession, feedback: Feedback
    ) -> Feedback:
        specific_model = self.FEEDBACK_TYPE_MODELS.get(feedback.feedback_type)

        if specific_model:
            query = select(specific_model).where(specific_model.id == feedback.id)
            result = await db.execute(query)
            specific_feedback = result.scalar_one_or_none()
            return specific_feedback if specific_feedback else feedback

        return feedback

    async def get_conversion_preview(
        self, db: AsyncSession, feedback_id: UUID, user_id: UUID
    ) -> Dict[str, Any]:
        from app.services.permission_service import permission_service
        from fastapi import HTTPException, status

        feedback = await self._get_and_validate_feedback(db, feedback_id)

        role = await permission_service.get_user_role_in_project(
            user_id, feedback.project_id, db
        )
        if not role:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail='You do not have access to this feedback',
            )

        typed_feedback = await self._get_typed_feedback(db, feedback)

        suggested_tags = []

        preview = {
            'suggested_title': feedback.title
            or f'Feedback: {feedback.feedback_type.value}',
            'suggested_description': await self._generate_description_from_feedback(
                db, typed_feedback, feedback.submitter_name
            ),
            'suggested_tags': suggested_tags,
            'suggested_priority': self._suggest_priority(typed_feedback).value,
        }

        return preview


action_item_service = ActionItemService()
