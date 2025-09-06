from typing import Dict, Any
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.db import get_db
from app.core.auth import get_current_user
from app.models.user_model import User
from app.services.subscription_service import subscription_service

router = APIRouter()


@router.get('/subscription/limits')
async def get_subscription_limits(
    organization_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Dict[str, int]:
    limits = await subscription_service.get_plan_limits(db, organization_id)
    return limits


@router.get('/subscription/features')
async def get_subscription_features(
    organization_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Dict[str, bool]:
    features = await subscription_service.get_plan_features(db, organization_id)
    return features


@router.get('/subscription/usage')
async def get_current_usage(
    organization_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Dict[str, int]:
    usage = await subscription_service.get_all_usage(db, organization_id)
    return usage


@router.get('/subscription/info')
async def get_subscription_info(
    organization_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Dict[str, Any]:
    organization = await subscription_service.get_organization_subscription(
        db, organization_id
    )
    if not organization:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail='Organization not found'
        )

    limits = await subscription_service.get_plan_limits(db, organization_id)
    features = await subscription_service.get_plan_features(db, organization_id)
    usage = await subscription_service.get_all_usage(db, organization_id)

    return {
        'plan': organization.subscription_plan,
        'status': organization.subscription_status,
        'limits': limits,
        'features': features,
        'usage': usage,
    }


@router.get('/subscription/check/{resource_type}')
async def check_usage_limit(
    resource_type: str,
    organization_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Dict[str, Any]:
    can_create = await subscription_service.check_usage_limit(
        db, organization_id, resource_type
    )
    current_usage = await subscription_service.get_current_usage(
        db, organization_id, resource_type
    )
    limits = await subscription_service.get_plan_limits(db, organization_id)

    return {
        'can_create': can_create,
        'current_usage': current_usage,
        'limit': limits.get(resource_type, 0),
        'resource_type': resource_type,
    }


@router.get('/subscription/feature/{feature_name}')
async def check_feature_access(
    feature_name: str,
    organization_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Dict[str, Any]:
    is_enabled = await subscription_service.is_feature_enabled(
        db, organization_id, feature_name
    )

    return {
        'feature': feature_name,
        'enabled': is_enabled,
        'organization_id': str(organization_id),
    }
