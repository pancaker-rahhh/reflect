from typing import Dict, Optional
from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_
from datetime import datetime, timezone
from app.models.organization_model import Organization
from app.models.usage_tracking_model import UsageTracking, ResourceType
from app.core.logging import get_logger

logger = get_logger(__name__)


class UsageTrackingService:
    """Tracks usage of various resources (projects, widgets, responses) per organization."""

    async def get_organization_subscription(
        self, db: AsyncSession, organization_id: UUID
    ) -> Optional[Organization]:
        stmt = select(Organization).where(Organization.id == organization_id)
        result = await db.execute(stmt)
        return result.scalar_one_or_none()

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
        usage_dict = {}

        for resource_type in ResourceType:
            usage_dict[resource_type.value] = await self.get_current_usage(
                db, organization_id, resource_type.value
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


usage_tracking_service = UsageTrackingService()
