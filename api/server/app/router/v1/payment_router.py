from typing import Dict, Any
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel, Field
from app.db import get_db
from app.core.auth import get_current_user
from app.models.user_model import User
from app.services.payment_service import payment_service
from app.core.logging import get_logger
from app.core.rate_limiting import create_rate_limit_decorator
from app.services.permission_service import PermissionService
from app.core.subscription_plans import get_plan_by_id

logger = get_logger(__name__)
router = APIRouter()
permission_service = PermissionService()


class PaymentLinkRequest(BaseModel):
    plan_id: str = Field(..., description='Subscription plan ID')
    email: str = Field(..., description='Customer email')
    firstName: str = Field(..., description='Customer first name')
    lastName: str = Field(..., description='Customer last name')
    country: str = Field(..., description='Customer country code')


class PaymentLinkResponse(BaseModel):
    payment_link: str
    subscription_id: str
    payment_id: str
    plan_id: str
    organization_id: str
    amount: float
    currency: str


@router.post('/payment/create-link', response_model=PaymentLinkResponse)
async def create_payment_link(
    organization_id: UUID,
    request: PaymentLinkRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> PaymentLinkResponse:
    """
    Create a payment link for subscription upgrade.

    This endpoint generates a Dodo Payments checkout link with user details
    for subscription plan upgrades.
    """
    try:
        # Prepare user details
        user_details = {
            'email': request.email,
            'firstName': request.firstName,
            'lastName': request.lastName,
            'country': request.country,
            'userId': str(current_user.id),
        }

        # Create payment link
        result = await payment_service.create_payment_link(
            db=db,
            organization_id=organization_id,
            plan_id=request.plan_id,
            user_details=user_details,
        )

        logger.info(
            f'Created payment link for organization {organization_id}',
            extra={
                'organization_id': str(organization_id),
                'plan_id': request.plan_id,
                'user_id': str(current_user.id),
            },
        )

        return PaymentLinkResponse(**result)

    except ValueError as e:
        logger.warning(f'Invalid payment link request: {str(e)}')
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        logger.error(f'Failed to create payment link: {str(e)}')
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail='Failed to create payment link',
        )


@router.get('/payment/status/{payment_id}')
async def get_payment_status(
    payment_id: str,
    organization_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Dict[str, Any]:
    """
    Get payment status for a specific payment.

    This endpoint returns the current status of a payment and associated
    subscription information.
    """
    try:
        # Get organization subscription details
        from app.services.subscription_service import subscription_service

        organization = await subscription_service.get_organization_subscription(
            db, organization_id
        )

        if not organization:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail='Organization not found'
            )

        return {
            'payment_id': payment_id,
            'organization_id': str(organization_id),
            'subscription_plan': organization.subscription_plan,
            'subscription_status': organization.subscription_status,
            'payment_status': organization.payment_status,
            'last_payment_date': organization.last_payment_date,
            'dodo_subscription_id': organization.dodo_subscription_id,
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f'Failed to get payment status: {str(e)}')
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail='Failed to get payment status',
        )


@router.post('/payment/cancel-subscription')
async def cancel_subscription(
    organization_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Dict[str, Any]:
    """
    Cancel subscription through Dodo Payments.

    This endpoint cancels the active subscription for an organization
    through Dodo Payments and updates the local database.
    """
    try:
        # Authorization: require manage_billing
        has_perm = await permission_service.has_permission(
            user_id=current_user.id,
            permission='manage_billing',
            organization_id=organization_id,
            db=db,
        )
        if not has_perm:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN, detail='Forbidden'
            )

        # Schedule cancellation with grace period; actual cancel can be performed separately
        success = await payment_service.schedule_subscription_cancellation(
            db=db, organization_id=organization_id, grace_period_hours=3
        )

        if success:
            logger.info(f'Subscription cancelled for organization {organization_id}')
            return {
                'success': True,
                'message': 'Cancellation scheduled. You can undo within 3 hours.',
                'organization_id': str(organization_id),
            }
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail='Failed to cancel subscription',
            )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f'Failed to cancel subscription: {str(e)}')
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail='Failed to cancel subscription',
        )


class ChangePlanRequest(BaseModel):
    new_plan_id: str = Field(..., description='Target subscription plan id')
    quantity: int = Field(1, ge=1)


@router.post('/payment/change-plan')
@create_rate_limit_decorator('subscription_change', is_anonymous=False)
async def change_plan(
    request: Request,
    organization_id: UUID,
    payload: ChangePlanRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Dict[str, Any]:
    """Change subscription plan using Dodo Payments.

    Security: requires 'manage_billing' permission (owner only per PermissionService).
    Rate limit: once per 30 days.
    """
    try:
        # Authorization: require manage_billing
        has_perm = await permission_service.has_permission(
            user_id=current_user.id,
            permission='manage_billing',
            organization_id=organization_id,
            db=db,
        )
        if not has_perm:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN, detail='Forbidden'
            )

        # Validate plan exists
        plan = get_plan_by_id(payload.new_plan_id)
        if not plan or not plan.get('dodo_product_id'):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail='Invalid plan',
            )

        success = await payment_service.change_subscription_plan(
            db=db,
            organization_id=organization_id,
            new_plan_id=payload.new_plan_id,
            proration_billing_mode='difference_immediately',
            quantity=payload.quantity,
        )

        if not success:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail='Failed to change plan',
            )

        return {
            'success': True,
            'message': 'Plan change initiated successfully',
            'organization_id': str(organization_id),
            'new_plan_id': payload.new_plan_id,
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f'Failed to change plan: {str(e)}')
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail='Failed to change plan',
        )


@router.post('/payment/cancel-subscription/undo')
async def undo_cancel_subscription(
    organization_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Dict[str, Any]:
    """Undo a scheduled cancellation during grace period."""
    try:
        # Authorization: require manage_billing
        has_perm = await permission_service.has_permission(
            user_id=current_user.id,
            permission='manage_billing',
            organization_id=organization_id,
            db=db,
        )
        if not has_perm:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN, detail='Forbidden'
            )

        success = await payment_service.undo_scheduled_cancellation(
            db=db, organization_id=organization_id
        )
        if not success:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail='Unable to undo cancellation',
            )
        return {
            'success': True,
            'message': 'Cancellation has been undone',
            'organization_id': str(organization_id),
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f'Failed to undo cancellation: {str(e)}')
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail='Failed to undo cancellation',
        )


@router.get('/payment/plans')
async def get_payment_plans(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Dict[str, Any]:
    """
    Get available subscription plans for payment.

    This endpoint returns all available subscription plans that can be
    purchased through Dodo Payments.
    """
    try:
        from app.services.subscription_service import subscription_service

        plans = await subscription_service.get_available_plans()

        # Filter out free plan and return only paid plans
        paid_plans = [plan for plan in plans if plan.get('price', 0) > 0]

        return {
            'plans': paid_plans,
            'total': len(paid_plans),
        }

    except Exception as e:
        logger.error(f'Failed to get payment plans: {str(e)}')
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail='Failed to get payment plans',
        )
