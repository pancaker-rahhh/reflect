from typing import Dict, Any
from uuid import UUID
from datetime import datetime, timezone
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update
from app.models.user_model import User
from app.models.organization_model import Organization
from app.core.logging import get_logger

logger = get_logger(__name__)


class UserSubscriptionService:
    PLAN_LIMITS = {
        'free': {
            'projects': 1,
            'widgets': 1,
            'responses': 20,
        },
        'pro': {
            'projects': 999,
            'widgets': 999,
            'responses': 999,
        },
    }

    FEATURE_FLAGS = {
        'free': {
            'advanced_targeting': False,
            'branding_removal': False,
            'priority_support': False,
            'dofollow_backlink': False,
            'jira_integration': False,
        },
        'pro': {
            'advanced_targeting': True,
            'branding_removal': True,
            'priority_support': True,
            'dofollow_backlink': True,
            'jira_integration': True,
        },
    }

    async def get_user_subscription_data(
        self, db: AsyncSession, user_id: UUID
    ) -> Dict[str, Any]:
        stmt = select(User).where(User.id == user_id)
        result = await db.execute(stmt)
        user = result.scalar_one_or_none()

        if not user:
            return self._get_default_subscription_data()

        cached_data = user.user_metadata.get('subscription_cache')
        if cached_data and self._is_cache_valid(cached_data):
            return cached_data

        subscription_data = await self._fetch_and_cache_subscription_data(db, user)
        return subscription_data

    async def _fetch_and_cache_subscription_data(
        self, db: AsyncSession, user: User
    ) -> Dict[str, Any]:
        org_membership = (
            user.organization_memberships[0] if user.organization_memberships else None
        )
        if not org_membership:
            return self._get_default_subscription_data()

        stmt = select(Organization).where(
            Organization.id == org_membership.organization_id
        )
        result = await db.execute(stmt)
        org = result.scalar_one_or_none()

        if not org:
            return self._get_default_subscription_data()

        plan = org.subscription_plan or 'free'
        subscription_data = {
            'plan': plan,
            'status': org.subscription_status or 'active',
            'limits': self.PLAN_LIMITS.get(plan, self.PLAN_LIMITS['free']),
            'features': self.FEATURE_FLAGS.get(plan, self.FEATURE_FLAGS['free']),
            'organization_id': str(org.id),
            'cached_at': datetime.now(timezone.utc).isoformat(),
        }

        await self._cache_user_subscription_data(db, user.id, subscription_data)
        return subscription_data

    async def _cache_user_subscription_data(
        self, db: AsyncSession, user_id: UUID, data: Dict[str, Any]
    ):
        stmt = (
            update(User)
            .where(User.id == user_id)
            .values(
                user_metadata=User.user_metadata.op('||')({'subscription_cache': data})
            )
        )
        await db.execute(stmt)
        await db.commit()

    def _is_cache_valid(self, cached_data: Dict[str, Any]) -> bool:
        cached_at = cached_data.get('cached_at')
        if not cached_at:
            return False

        cache_time = datetime.fromisoformat(cached_at.replace('Z', '+00:00'))
        now = datetime.now(timezone.utc)
        return (now - cache_time).total_seconds() < 300  # 5 minutes cache

    def _get_default_subscription_data(self) -> Dict[str, Any]:
        return {
            'plan': 'free',
            'status': 'active',
            'limits': self.PLAN_LIMITS['free'],
            'features': self.FEATURE_FLAGS['free'],
            'organization_id': None,
            'cached_at': datetime.now(timezone.utc).isoformat(),
        }

    async def invalidate_user_cache(self, db: AsyncSession, user_id: UUID):
        stmt = (
            update(User)
            .where(User.id == user_id)
            .values(user_metadata=User.user_metadata.op('-')('subscription_cache'))
        )
        await db.execute(stmt)
        await db.commit()

    async def invalidate_organization_cache(
        self, db: AsyncSession, organization_id: UUID
    ):
        stmt = (
            select(User)
            .join(User.organization_memberships)
            .where(User.organization_memberships.any(organization_id=organization_id))
        )
        result = await db.execute(stmt)
        users = result.scalars().all()

        for user in users:
            await self.invalidate_user_cache(db, user.id)


user_subscription_service = UserSubscriptionService()
