from typing import Dict, Any, List
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.db import get_db
from app.core.auth import get_current_user
from app.models.user_model import User
from app.services.subscription_service import subscription_service

router = APIRouter()


@router.get('/subscription/plan')
async def get_subscription_plan(
    organization_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Dict[str, Any]:
    plan = await subscription_service.get_subscription_plan(db, organization_id)
    status = await subscription_service.get_subscription_status(db, organization_id)
    organization = await subscription_service.get_organization_subscription(
        db, organization_id
    )

    return {
        'plan': plan,
        'status': status,
        'organization_id': str(organization_id),
        'subscription_ends_at': organization.subscription_ends_at.isoformat()
        if getattr(organization, 'subscription_ends_at', None)
        else None,
        'payment_status': getattr(organization, 'payment_status', None),
    }


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


@router.get('/subscription/plans')
async def get_available_plans(
    current_user: User = Depends(get_current_user),
) -> List[Dict[str, Any]]:
    plans = await subscription_service.get_available_plans()
    return plans


@router.post('/subscription/update-plan')
async def update_subscription_plan(
    organization_id: UUID,
    plan: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Dict[str, Any]:
    success = await subscription_service.update_subscription_plan(
        db, organization_id, plan
    )

    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail='Organization not found'
        )

    return {
        'success': True,
        'plan': plan,
        'organization_id': str(organization_id),
    }


@router.post('/subscription/cancel')
async def cancel_subscription(
    organization_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Dict[str, Any]:
    success = await subscription_service.cancel_subscription(db, organization_id)

    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail='Organization not found'
        )

    return {
        'success': True,
        'plan': 'free',
        'status': 'cancelled',
        'organization_id': str(organization_id),
    }
