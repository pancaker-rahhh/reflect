from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.db import get_db
from app.core.auth import get_current_user
from app.models.user_model import User
from app.models.organization_model import Organization
from app.services.user_subscription_service import user_subscription_service
from sqlalchemy import update
from app.core.logging import get_logger

logger = get_logger(__name__)
router = APIRouter(prefix='/upgrade', tags=['Upgrade'])


@router.post('/to-pro', status_code=status.HTTP_200_OK)
async def upgrade_to_pro(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    logger.info(f'Upgrading user {current_user.id} to Pro plan')

    org_membership = (
        current_user.organization_memberships[0]
        if current_user.organization_memberships
        else None
    )
    if not org_membership:
        return {'error': 'User not in any organization'}

    organization_id = org_membership.organization_id

    stmt = (
        update(Organization)
        .where(Organization.id == organization_id)
        .values(
            subscription_plan='pro',
            subscription_tier='pro',
            subscription_status='active',
        )
    )
    await db.execute(stmt)
    await db.commit()

    await user_subscription_service.invalidate_organization_cache(db, organization_id)

    logger.info(f'Successfully upgraded organization {organization_id} to Pro plan')

    return {
        'message': 'Successfully upgraded to Pro plan',
        'plan': 'pro',
        'status': 'active',
    }
