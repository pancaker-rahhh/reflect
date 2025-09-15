from typing import Dict, Any
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel, Field
from app.db import get_db
from app.core.auth import get_current_user
from app.models.user_model import User
from app.services.payment_service import payment_service
from app.core.logging import get_logger

logger = get_logger(__name__)
router = APIRouter()


class PaymentLinkRequest(BaseModel):
    """Request model for creating payment links."""

    plan_id: str = Field(..., description='Subscription plan ID')
    email: str = Field(..., description='Customer email')
    firstName: str = Field(..., description='Customer first name')
    lastName: str = Field(..., description='Customer last name')
    country: str = Field(..., description='Customer country code')
    city: str = Field(..., description='Customer city')
    state: str = Field(..., description='Customer state/province')
    street: str = Field(..., description='Customer street address')
    zipcode: str = Field(..., description='Customer ZIP/postal code')


class PaymentLinkResponse(BaseModel):
    """Response model for payment link creation."""

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
            'city': request.city,
            'state': request.state,
            'street': request.street,
            'zipcode': request.zipcode,
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
        success = await payment_service.cancel_subscription(
            db=db,
            organization_id=organization_id,
        )

        if success:
            logger.info(f'Subscription cancelled for organization {organization_id}')
            return {
                'success': True,
                'message': 'Subscription cancelled successfully',
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
