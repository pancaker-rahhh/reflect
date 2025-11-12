from datetime import datetime, timezone
from uuid import UUID
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.settings import get_settings
from app.core.logging import get_logger
from app.models.organization_model import Organization, SubscriptionPlanEnum

logger = get_logger(__name__)
settings = get_settings()


class LifetimeOfferService:
    async def get_lifetime_purchases_count(self, db: AsyncSession) -> int:
        result = await db.execute(
            select(func.count(Organization.id)).where(
                Organization.subscription_plan == SubscriptionPlanEnum.PRO_LIFETIME
            )
        )
        count = result.scalar()
        return count or 0

    async def is_eligible_for_lifetime_offer(
        self, db: AsyncSession, organization_id: UUID
    ) -> dict:
        result = await db.execute(
            select(Organization).where(Organization.id == organization_id)
        )
        organization = result.scalar_one_or_none()

        if not organization:
            return {
                'eligible': False,
                'reason': 'organization_not_found',
                'spots_remaining': 0,
                'expires_at': settings.LIFETIME_OFFER_CUTOFF_DATE,
            }

        if organization.subscription_plan != SubscriptionPlanEnum.FREE:
            return {
                'eligible': False,
                'reason': 'already_paid',
                'spots_remaining': 0,
                'expires_at': settings.LIFETIME_OFFER_CUTOFF_DATE,
            }

        try:
            cutoff_date_str = settings.LIFETIME_OFFER_CUTOFF_DATE
            if 'T' not in cutoff_date_str:
                cutoff_date_str = f'{cutoff_date_str}T23:59:59+00:00'
            cutoff_date = datetime.fromisoformat(cutoff_date_str.replace('Z', '+00:00'))
        except (ValueError, AttributeError):
            cutoff_date = datetime(2026, 2, 1, tzinfo=timezone.utc)

        if datetime.now(timezone.utc) >= cutoff_date:
            return {
                'eligible': False,
                'reason': 'expired',
                'spots_remaining': 0,
                'expires_at': settings.LIFETIME_OFFER_CUTOFF_DATE,
            }

        purchases_count = await self.get_lifetime_purchases_count(db)
        spots_remaining = max(
            0, settings.LIFETIME_OFFER_MAX_PURCHASES - purchases_count
        )

        if purchases_count >= settings.LIFETIME_OFFER_MAX_PURCHASES:
            return {
                'eligible': False,
                'reason': 'sold_out',
                'spots_remaining': 0,
                'expires_at': settings.LIFETIME_OFFER_CUTOFF_DATE,
            }

        return {
            'eligible': True,
            'reason': 'eligible',
            'spots_remaining': spots_remaining,
            'expires_at': settings.LIFETIME_OFFER_CUTOFF_DATE,
        }

    async def dismiss_lifetime_offer(
        self, db: AsyncSession, organization_id: UUID
    ) -> bool:
        result = await db.execute(
            select(Organization).where(Organization.id == organization_id)
        )
        organization = result.scalar_one_or_none()

        if not organization:
            return False

        organization.lifetime_offer_dismissed_at = datetime.now(timezone.utc)
        await db.commit()

        logger.info(
            f'Lifetime offer dismissed for organization {organization_id}',
            extra={'organization_id': str(organization_id)},
        )

        return True


lifetime_offer_service = LifetimeOfferService()
