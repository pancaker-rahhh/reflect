from typing import Optional
from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, delete
from fastapi import Request, HTTPException, status
from app.models.roadmap_model import RoadmapVote, RoadmapActionItem
from app.core.logging import get_logger
from slowapi.util import get_remote_address

logger = get_logger(__name__)


class VoteRepository:
    def __init__(self):
        self.model = RoadmapVote

    async def get_vote_by_user(
        self, db: AsyncSession, feature_id: UUID, user_id: UUID
    ) -> Optional[RoadmapVote]:
        try:
            stmt = select(RoadmapVote).where(
                and_(
                    RoadmapVote.feature_id == feature_id, RoadmapVote.user_id == user_id
                )
            )
            result = await db.execute(stmt)
            return result.scalar_one_or_none()
        except Exception as e:
            logger.error(
                f'Error fetching vote by user {user_id} for feature {feature_id}: {str(e)}'
            )
            raise

    async def get_vote_by_ip(
        self, db: AsyncSession, feature_id: UUID, ip_address: str
    ) -> Optional[RoadmapVote]:
        try:
            stmt = select(RoadmapVote).where(
                and_(
                    RoadmapVote.feature_id == feature_id,
                    RoadmapVote.ip_address == ip_address,
                )
            )
            result = await db.execute(stmt)
            return result.scalar_one_or_none()
        except Exception as e:
            logger.error(
                f'Error fetching vote by IP {ip_address} for feature {feature_id}: {str(e)}'
            )
            raise

    async def create(self, db: AsyncSession, **kwargs) -> RoadmapVote:
        try:
            vote = RoadmapVote(**kwargs)
            db.add(vote)
            await db.flush()
            await db.refresh(vote)
            return vote
        except Exception as e:
            logger.error(f'Error creating vote: {str(e)}')
            raise

    async def delete(self, db: AsyncSession, id: UUID) -> None:
        try:
            stmt = delete(RoadmapVote).where(RoadmapVote.id == id)
            await db.execute(stmt)
        except Exception as e:
            logger.error(f'Error deleting vote {id}: {str(e)}')
            raise


vote_repository = VoteRepository()


class VoteService:
    def __init__(self, vote_repo: VoteRepository = vote_repository):
        self.vote_repo = vote_repo

    async def upvote_feature_authenticated(
        self, db: AsyncSession, feature_id: UUID, user_id: UUID
    ) -> RoadmapActionItem:
        existing_vote = await self.vote_repo.get_vote_by_user(db, feature_id, user_id)
        return await self._process_vote(db, feature_id, existing_vote, user_id=user_id)

    async def upvote_feature_anonymous(
        self, db: AsyncSession, feature_id: UUID, request: Request
    ) -> RoadmapActionItem:
        ip_address = get_remote_address(request)
        existing_vote = await self.vote_repo.get_vote_by_ip(db, feature_id, ip_address)
        return await self._process_vote(db, feature_id, existing_vote, request=request)

    async def _process_vote(
        self,
        db: AsyncSession,
        feature_id: UUID,
        existing_vote: Optional[RoadmapVote],
        user_id: Optional[UUID] = None,
        request: Optional[Request] = None,
    ) -> RoadmapActionItem:
        stmt = select(RoadmapActionItem).where(RoadmapActionItem.id == feature_id)
        result = await db.execute(stmt)
        feature = result.scalar_one_or_none()

        if not feature:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail='Feature not found'
            )

        if existing_vote:
            await self.vote_repo.delete(db, id=existing_vote.id)
            feature.vote_count = max(0, feature.vote_count - 1)
        else:
            vote_data = {
                'feature_id': feature_id,
                'user_id': user_id,
                'ip_address': get_remote_address(request) if request else None,
                'user_agent': request.headers.get('user-agent', '')
                if request
                else None,
            }
            await self.vote_repo.create(db, **vote_data)
            feature.vote_count += 1

        await db.commit()
        await db.refresh(feature)
        return feature


vote_service = VoteService()
