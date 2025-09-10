from typing import Dict, Any
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.db import get_db
from app.core.auth import get_current_user
from app.models.user_model import User
from app.services.usage_tracking_service import usage_tracking_service
from app.core.subscription_constants import PLAN_LIMITS, FEATURE_FLAGS

router = APIRouter()


@router.get('/usage/limits')
async def get_usage_limits(
    organization_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Dict[str, int]:
    organization = await usage_tracking_service.get_organization_subscription(
        db, organization_id
    )
    if not organization:
        return PLAN_LIMITS['free']

    plan = organization.subscription_plan or 'free'
    return PLAN_LIMITS.get(plan, PLAN_LIMITS['free'])


@router.get('/usage/features')
async def get_usage_features(
    organization_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Dict[str, bool]:
    organization = await usage_tracking_service.get_organization_subscription(
        db, organization_id
    )
    if not organization:
        return FEATURE_FLAGS['free']

    plan = organization.subscription_plan or 'free'
    return FEATURE_FLAGS.get(plan, FEATURE_FLAGS['free'])


@router.get('/usage/current')
async def get_current_usage(
    organization_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Dict[str, int]:
    usage = await usage_tracking_service.get_all_usage(db, organization_id)
    return usage


@router.get('/usage/check/{resource_type}')
async def check_usage_limit(
    resource_type: str,
    organization_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Dict[str, Any]:
    organization = await usage_tracking_service.get_organization_subscription(
        db, organization_id
    )
    if not organization:
        limits = PLAN_LIMITS['free']
    else:
        plan = organization.subscription_plan or 'free'
        limits = PLAN_LIMITS.get(plan, PLAN_LIMITS['free'])

    limit = limits.get(resource_type, 0)
    can_create = (
        limit >= 999
        or await usage_tracking_service.get_current_usage(
            db, organization_id, resource_type
        )
        < limit
    )
    current_usage = await usage_tracking_service.get_current_usage(
        db, organization_id, resource_type
    )

    return {
        'can_create': can_create,
        'current_usage': current_usage,
        'limit': limit,
        'resource_type': resource_type,
    }


@router.get('/usage/feature/{feature_name}')
async def check_feature_access(
    feature_name: str,
    organization_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Dict[str, Any]:
    organization = await usage_tracking_service.get_organization_subscription(
        db, organization_id
    )
    if not organization:
        features = FEATURE_FLAGS['free']
    else:
        plan = organization.subscription_plan or 'free'
        features = FEATURE_FLAGS.get(plan, FEATURE_FLAGS['free'])

    is_enabled = features.get(feature_name, False)

    return {
        'feature': feature_name,
        'enabled': is_enabled,
        'organization_id': str(organization_id),
    }
