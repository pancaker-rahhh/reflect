from typing import List, Optional
from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, func
from app.models.feedback_model import FeedbackVote
from app.repositories.base_repository import BaseRepository


class FeedbackVoteRepository(BaseRepository[FeedbackVote]):
    def __init__(self):
        super().__init__(FeedbackVote)

    async def get_by_feedback(
        self, db: AsyncSession, feedback_id: UUID, skip: int = 0, limit: int = 100
    ) -> List[FeedbackVote]:
        stmt = (
            select(FeedbackVote)
            .where(FeedbackVote.feedback_id == feedback_id)
            .offset(skip)
            .limit(limit)
            .order_by(FeedbackVote.created_at.desc())
        )
        result = await db.execute(stmt)
        return list(result.scalars().all())

    async def get_vote_counts(self, db: AsyncSession, feedback_id: UUID) -> dict:
        stmt = (
            select(FeedbackVote.vote_type, func.count(FeedbackVote.id).label('count'))
            .where(FeedbackVote.feedback_id == feedback_id)
            .group_by(FeedbackVote.vote_type)
        )
        result = await db.execute(stmt)
        rows = result.fetchall()
        vote_counts = {}
        for row in rows:
            vote_counts[row.vote_type] = row.count
        
        upvotes = vote_counts.get('up', 0)
        downvotes = vote_counts.get('down', 0)
        return {
            'upvotes': upvotes,
            'downvotes': downvotes,
            'total': upvotes + downvotes
        }

    async def get_user_vote(
        self, db: AsyncSession, feedback_id: UUID, user_id: Optional[UUID] = None, session_id: Optional[str] = None
    ) -> Optional[FeedbackVote]:
        conditions = [FeedbackVote.feedback_id == feedback_id]
        
        if user_id:
            conditions.append(FeedbackVote.user_id == user_id)
        elif session_id:
            conditions.append(FeedbackVote.session_id == session_id)
        else:
            return None

        stmt = select(FeedbackVote).where(and_(*conditions))
        result = await db.execute(stmt)
        return result.scalar_one_or_none()

    async def create_vote(
        self, 
        db: AsyncSession, 
        feedback_id: UUID, 
        vote_type: str, 
        user_id: Optional[UUID] = None, 
        session_id: Optional[str] = None
    ) -> FeedbackVote:
        vote_data = {
            'feedback_id': feedback_id,
            'vote_type': vote_type,
            'user_id': user_id,
            'session_id': session_id
        }
        return await self.create(db, **vote_data)

    async def update_vote(
        self, 
        db: AsyncSession, 
        feedback_id: UUID, 
        vote_type: str, 
        user_id: Optional[UUID] = None, 
        session_id: Optional[str] = None
    ) -> Optional[FeedbackVote]:
        existing_vote = await self.get_user_vote(db, feedback_id, user_id, session_id)
        
        if existing_vote:
            return await self.update(db, existing_vote.id, vote_type=vote_type)
        else:
            return await self.create_vote(db, feedback_id, vote_type, user_id, session_id)

    async def remove_vote(
        self, 
        db: AsyncSession, 
        feedback_id: UUID, 
        user_id: Optional[UUID] = None, 
        session_id: Optional[str] = None
    ) -> bool:
        existing_vote = await self.get_user_vote(db, feedback_id, user_id, session_id)
        
        if existing_vote:
            return await self.delete(db, existing_vote.id)
        return False


feedback_vote_repository = FeedbackVoteRepository()