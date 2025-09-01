from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.exc import IntegrityError
from app.models.feature_vote_model import FeatureVote
from app.repositories.feedback_repository import feedback_repository


class VotingService:
    async def vote_for_feature(
        self, db: AsyncSession, feedback_id: UUID, voter_ip: str, voter_user_agent: str
    ) -> dict:
        voter_hash = FeatureVote.create_voter_hash(voter_ip, voter_user_agent)

        from sqlalchemy import select

        stmt = select(FeatureVote).where(
            FeatureVote.feedback_id == feedback_id, FeatureVote.voter_hash == voter_hash
        )
        result = await db.execute(stmt)
        existing_vote = result.scalar_one_or_none()

        if existing_vote:
            await db.delete(existing_vote)
            await db.commit()

            current_count = await self._get_vote_count(db, feedback_id)
            await feedback_repository.update_votes(db, feedback_id, current_count)

            return {
                'action': 'removed',
                'newVoteCount': current_count,
                'hasUserVoted': False,
            }
        else:
            # Add vote
            try:
                new_vote = FeatureVote(feedback_id=feedback_id, voter_hash=voter_hash)
                db.add(new_vote)
                await db.commit()

                # Update vote count using actual count from database
                current_count = await self._get_vote_count(db, feedback_id)
                await feedback_repository.update_votes(db, feedback_id, current_count)

                return {
                    'action': 'added',
                    'newVoteCount': current_count,
                    'hasUserVoted': True,
                }

            except IntegrityError:
                # Race condition - someone else voted at same time
                await db.rollback()
                current_count = await self._get_vote_count(db, feedback_id)
                return {
                    'action': 'no_change',
                    'newVoteCount': current_count,
                    'hasUserVoted': True,
                }

    async def get_user_vote_status(
        self, db: AsyncSession, feedback_id: UUID, voter_ip: str, voter_user_agent: str
    ) -> bool:
        voter_hash = FeatureVote.create_voter_hash(voter_ip, voter_user_agent)

        from sqlalchemy import select

        stmt = select(FeatureVote).where(
            FeatureVote.feedback_id == feedback_id, FeatureVote.voter_hash == voter_hash
        )
        result = await db.execute(stmt)
        return result.scalar_one_or_none() is not None

    async def _get_vote_count(self, db: AsyncSession, feedback_id: UUID) -> int:
        from sqlalchemy import select, func

        stmt = select(func.count(FeatureVote.id)).where(
            FeatureVote.feedback_id == feedback_id
        )
        result = await db.execute(stmt)
        return result.scalar() or 0


voting_service = VotingService()
