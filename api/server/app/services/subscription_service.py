from typing import Dict, Optional
from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_
from datetime import datetime, timezone

from app.models.organization_model import Organization
from app.models.usage_tracking_model import UsageTracking
from app.core.logging import get_logger

logger = get_logger(__name__)


class SubscriptionService:
    PLAN_LIMITS = {
        'free': {
            'projects': 1,
            'widgets': 1,
            'responses': 20,
            'bug_reports': 20,
            'feature_requests': 20,
        },
        'pro': {
            'projects': 999,
            'widgets': 999,
            'responses': 999,
            'bug_reports': 999,
            'feature_requests': 999,
        },
    }

    FEATURE_FLAGS = {
        'free': {
            'advanced_targeting': False,
            'branding_removal': False,
            'priority_support': False,
            'dofollow_backlink': False,
        },
        'pro': {
            'advanced_targeting': True,
            'branding_removal': True,
            'priority_support': True,
            'dofollow_backlink': True,
        },
    }

    async def get_organization_subscription(
        self, db: AsyncSession, organization_id: UUID
    ) -> Optional[Organization]:
        stmt = select(Organization).where(Organization.id == organization_id)
        result = await db.execute(stmt)
        return result.scalar_one_or_none()

    async def get_plan_limits(
        self, db: AsyncSession, organization_id: UUID
    ) -> Dict[str, int]:
        organization = await self.get_organization_subscription(db, organization_id)
        if not organization:
            return self.PLAN_LIMITS['free']

        plan = organization.subscription_plan or 'free'
        return self.PLAN_LIMITS.get(plan, self.PLAN_LIMITS['free'])

    async def get_plan_features(
        self, db: AsyncSession, organization_id: UUID
    ) -> Dict[str, bool]:
        organization = await self.get_organization_subscription(db, organization_id)
        if not organization:
            return self.FEATURE_FLAGS['free']

        plan = organization.subscription_plan or 'free'
        return self.FEATURE_FLAGS.get(plan, self.FEATURE_FLAGS['free'])

    async def is_feature_enabled(
        self, db: AsyncSession, organization_id: UUID, feature: str
    ) -> bool:
        features = await self.get_plan_features(db, organization_id)
        return features.get(feature, False)

    async def check_usage_limit(
        self, db: AsyncSession, organization_id: UUID, resource_type: str
    ) -> bool:
        limits = await self.get_plan_limits(db, organization_id)
        limit = limits.get(resource_type, 0)

        if limit >= 999:
            return True

        current_usage = await self.get_current_usage(db, organization_id, resource_type)
        return current_usage < limit

    async def get_current_usage(
        self, db: AsyncSession, organization_id: UUID, resource_type: str
    ) -> int:
        current_month = datetime.now(timezone.utc).replace(
            day=1, hour=0, minute=0, second=0, microsecond=0
        )

        stmt = select(UsageTracking).where(
            and_(
                UsageTracking.organization_id == organization_id,
                UsageTracking.resource_type == resource_type,
                UsageTracking.period_start == current_month,
            )
        )
        result = await db.execute(stmt)
        usage_record = result.scalar_one_or_none()

        return usage_record.usage_count if usage_record else 0

    async def get_all_usage(
        self, db: AsyncSession, organization_id: UUID
    ) -> Dict[str, int]:
        limits = await self.get_plan_limits(db, organization_id)
        usage_dict = {}

        # Initialize all resources with 0 usage
        for resource_type in limits.keys():
            usage_dict[resource_type] = await self.get_current_usage(
                db, organization_id, resource_type
            )

        return usage_dict

    async def increment_usage(
        self,
        db: AsyncSession,
        organization_id: UUID,
        resource_type: str,
        amount: int = 1,
    ) -> None:
        current_month = datetime.now(timezone.utc).replace(
            day=1, hour=0, minute=0, second=0, microsecond=0
        )

        stmt = select(UsageTracking).where(
            and_(
                UsageTracking.organization_id == organization_id,
                UsageTracking.resource_type == resource_type,
                UsageTracking.period_start == current_month,
            )
        )
        result = await db.execute(stmt)
        usage_record = result.scalar_one_or_none()

        if usage_record:
            usage_record.usage_count += amount
            usage_record.updated_at = datetime.now(timezone.utc)
        else:
            new_record = UsageTracking(
                organization_id=organization_id,
                resource_type=resource_type,
                usage_count=amount,
                period_start=current_month,
            )
            db.add(new_record)

        await db.commit()

    async def decrement_usage(
        self,
        db: AsyncSession,
        organization_id: UUID,
        resource_type: str,
        amount: int = 1,
    ) -> None:
        current_month = datetime.now(timezone.utc).replace(
            day=1, hour=0, minute=0, second=0, microsecond=0
        )

        stmt = select(UsageTracking).where(
            and_(
                UsageTracking.organization_id == organization_id,
                UsageTracking.resource_type == resource_type,
                UsageTracking.period_start == current_month,
            )
        )
        result = await db.execute(stmt)
        usage_record = result.scalar_one_or_none()

        if usage_record and usage_record.usage_count > 0:
            usage_record.usage_count = max(0, usage_record.usage_count - amount)
            usage_record.updated_at = datetime.now(timezone.utc)
            await db.commit()
            logger.info(
                f'Decremented {resource_type} usage for organization {organization_id} to {usage_record.usage_count}'
            )


subscription_service = SubscriptionService()
