from typing import List, Optional, Dict
from uuid import UUID
from datetime import datetime
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


# Request Models
class PaymentLinkRequest(BaseModel):
    plan_id: str = Field(..., description='Subscription plan ID')
    email: str = Field(..., description='Customer email')
    firstName: str = Field(..., description='Customer first name')
    lastName: str = Field(..., description='Customer last name')
    country: str = Field(..., description='Customer country code')


class ChangePlanRequest(BaseModel):
    new_plan_id: str = Field(..., description='Target subscription plan id')
    quantity: int = Field(1, ge=1)


# Response Models
class PaymentLinkResponse(BaseModel):
    payment_link: str
    subscription_id: str
    payment_id: str
    plan_id: str
    organization_id: str
    amount: float
    currency: str


class PaymentStatusResponse(BaseModel):
    payment_id: str
    organization_id: str
    subscription_plan: str
    subscription_status: str
    payment_status: Optional[str]
    last_payment_date: Optional[datetime]
    dodo_subscription_id: Optional[str]


class CancelSubscriptionResponse(BaseModel):
    success: bool
    message: str
    organization_id: str
    subscription_ends_at: Optional[datetime] = None


class ChangePlanResponse(BaseModel):
    success: bool
    message: str
    organization_id: str
    new_plan_id: str


class UndoCancelSubscriptionResponse(BaseModel):
    success: bool
    message: str
    organization_id: str


class PaymentPlan(BaseModel):
    id: str
    name: str
    display_name: str
    dodo_product_id: Optional[str]
    price: float
    currency: str
    interval: Optional[str]
    interval_count: Optional[int]
    trial_days: int
    limits: Dict[str, int]
    features: Dict[str, bool]
    description: str
    is_active: bool


class PaymentPlansResponse(BaseModel):
    plans: List[PaymentPlan]
    total: int


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


@router.get('/payment/status/{payment_id}', response_model=PaymentStatusResponse)
async def get_payment_status(
    payment_id: str,
    organization_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> PaymentStatusResponse:
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

        return PaymentStatusResponse(
            payment_id=payment_id,
            organization_id=str(organization_id),
            subscription_plan=organization.subscription_plan,
            subscription_status=organization.subscription_status,
            payment_status=organization.payment_status,
            last_payment_date=organization.last_payment_date,
            dodo_subscription_id=organization.dodo_subscription_id,
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f'Failed to get payment status: {str(e)}')
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail='Failed to get payment status',
        )


@router.post('/payment/cancel-subscription', response_model=CancelSubscriptionResponse)
async def cancel_subscription(
    organization_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> CancelSubscriptionResponse:
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

        # Request cancel at next billing date in Dodo and update local org
        next_billing_date = await payment_service.request_cancel_at_period_end(
            db=db, organization_id=organization_id
        )

        logger.info(
            'Cancellation at period end requested',
            extra={
                'organization_id': str(organization_id),
                'subscription_ends_at': next_billing_date.isoformat()
                if next_billing_date
                else None,
            },
        )
        return CancelSubscriptionResponse(
            success=True,
            message='Cancellation scheduled at the next billing date',
            organization_id=str(organization_id),
            subscription_ends_at=next_billing_date,
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f'Failed to cancel subscription: {str(e)}')
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail='Failed to cancel subscription',
        )


@router.post('/payment/change-plan', response_model=ChangePlanResponse)
@create_rate_limit_decorator('subscription_change', is_anonymous=False)
async def change_plan(
    request: Request,
    organization_id: UUID,
    payload: ChangePlanRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> ChangePlanResponse:
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

        return ChangePlanResponse(
            success=True,
            message='Plan change initiated successfully',
            organization_id=str(organization_id),
            new_plan_id=payload.new_plan_id,
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f'Failed to change plan: {str(e)}')
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail='Failed to change plan',
        )


@router.post(
    '/payment/cancel-subscription/undo', response_model=UndoCancelSubscriptionResponse
)
async def undo_cancel_subscription(
    organization_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> UndoCancelSubscriptionResponse:
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
        return UndoCancelSubscriptionResponse(
            success=True,
            message='Cancellation has been undone',
            organization_id=str(organization_id),
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f'Failed to undo cancellation: {str(e)}')
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail='Failed to undo cancellation',
        )


@router.get('/payment/plans', response_model=PaymentPlansResponse)
async def get_payment_plans(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> PaymentPlansResponse:
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

        # Convert to PaymentPlan models
        payment_plans = []
        for plan in paid_plans:
            payment_plans.append(
                PaymentPlan(
                    id=plan['id'],
                    name=plan['name'],
                    display_name=plan.get('display_name', plan['name']),
                    dodo_product_id=plan.get('dodo_product_id'),
                    price=plan['price'],
                    currency=plan.get('currency', 'USD'),
                    interval=plan.get('interval'),
                    interval_count=plan.get('interval_count'),
                    trial_days=plan.get('trial_days', 0),
                    limits=plan.get('limits', {}),
                    features=plan.get('features', {}),
                    description=plan.get('description', ''),
                    is_active=plan.get('is_active', True),
                )
            )

        return PaymentPlansResponse(
            plans=payment_plans,
            total=len(payment_plans),
        )

    except Exception as e:
        logger.error(f'Failed to get payment plans: {str(e)}')
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail='Failed to get payment plans',
        )
