from typing import Dict, Optional, List
from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from datetime import datetime, timezone
from app.models.organization_model import Organization
from app.core.logging import get_logger
from app.core.subscription_constants import PLAN_LIMITS, FEATURE_FLAGS
from app.core.subscription_plans import get_active_plans

logger = get_logger(__name__)


class SubscriptionService:
    async def get_organization_subscription(
        self, db: AsyncSession, organization_id: UUID
    ) -> Optional[Organization]:
        stmt = select(Organization).where(Organization.id == organization_id)
        result = await db.execute(stmt)
        return result.scalar_one_or_none()

    async def get_subscription_plan(
        self, db: AsyncSession, organization_id: UUID
    ) -> str:
        organization = await self.get_organization_subscription(db, organization_id)
        if not organization:
            return 'free'
        return organization.subscription_plan or 'free'

    async def get_subscription_status(
        self, db: AsyncSession, organization_id: UUID
    ) -> str:
        organization = await self.get_organization_subscription(db, organization_id)
        if not organization:
            return 'inactive'
        return organization.subscription_status or 'inactive'

    async def get_plan_limits(
        self, db: AsyncSession, organization_id: UUID
    ) -> Dict[str, int]:
        plan = await self.get_subscription_plan(db, organization_id)
        return PLAN_LIMITS.get(plan, PLAN_LIMITS['free'])

    async def get_plan_features(
        self, db: AsyncSession, organization_id: UUID
    ) -> Dict[str, bool]:
        plan = await self.get_subscription_plan(db, organization_id)
        return FEATURE_FLAGS.get(plan, FEATURE_FLAGS['free'])

    async def is_feature_enabled(
        self, db: AsyncSession, organization_id: UUID, feature: str
    ) -> bool:
        features = await self.get_plan_features(db, organization_id)
        return features.get(feature, False)

    async def get_available_plans(self) -> List[Dict[str, any]]:
        """Get all available subscription plans."""
        return get_active_plans()

    async def update_subscription_plan(
        self, db: AsyncSession, organization_id: UUID, plan: str, status: str = 'active'
    ) -> bool:
        organization = await self.get_organization_subscription(db, organization_id)
        if not organization:
            return False

        organization.subscription_plan = plan
        organization.subscription_status = status
        organization.updated_at = datetime.now(timezone.utc)

        await db.commit()
        logger.info(
            f'Updated subscription plan for organization {organization_id} to {plan}'
        )
        return True

    async def cancel_subscription(
        self, db: AsyncSession, organization_id: UUID
    ) -> bool:
        return await self.update_subscription_plan(
            db, organization_id, 'free', 'cancelled'
        )


subscription_service = SubscriptionService()
