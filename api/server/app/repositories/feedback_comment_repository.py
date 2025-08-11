from typing import List
from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.feedback_model import FeedbackComment
from app.repositories.base_repository import BaseRepository


class FeedbackCommentRepository(BaseRepository[FeedbackComment]):
    def __init__(self):
        super().__init__(FeedbackComment)

    async def get_by_feedback(
        self, db: AsyncSession, feedback_id: UUID, skip: int = 0, limit: int = 100
    ) -> List[FeedbackComment]:
        stmt = (
            select(FeedbackComment)
            .where(FeedbackComment.feedback_id == feedback_id)
            .offset(skip)
            .limit(limit)
            .order_by(FeedbackComment.created_at.asc())
        )
        result = await db.execute(stmt)
        return list(result.scalars().all())

    async def get_by_user(
        self, db: AsyncSession, user_id: UUID, skip: int = 0, limit: int = 100
    ) -> List[FeedbackComment]:
        stmt = (
            select(FeedbackComment)
            .where(FeedbackComment.user_id == user_id)
            .offset(skip)
            .limit(limit)
            .order_by(FeedbackComment.created_at.desc())
        )
        result = await db.execute(stmt)
        return list(result.scalars().all())

    async def create_comment(
        self, db: AsyncSession, feedback_id: UUID, user_id: UUID, comment_text: str
    ) -> FeedbackComment:
        comment_data = {
            'feedback_id': feedback_id,
            'user_id': user_id,
            'comment_text': comment_text
        }
        return await self.create(db, **comment_data)


feedback_comment_repository = FeedbackCommentRepository()