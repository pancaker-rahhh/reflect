from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.auth import get_current_user
from app.core.logging import get_logger
from app.db import get_db
from app.models.user_model import User
from app.services.onboarding_service import onboarding_service
from app.schemas.onboarding_schema import (
    OnboardingStartRequest,
    OnboardingStartResponse,
    OnboardingStatusResponse,
    OnboardingUpdateRequest,
    OnboardingCompleteRequest,
    OnboardingCompleteResponse,
    OnboardingSkipResponse,
)
from app.schemas.organization_schema import OrganizationResponse

logger = get_logger(__name__)

router = APIRouter(
    prefix='/onboarding',
    tags=['Onboarding'],
)


@router.post('/start', response_model=OnboardingStartResponse)
async def start_onboarding(
    request: OnboardingStartRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> OnboardingStartResponse:
    try:
        return await onboarding_service.start_onboarding(user.id, request, db)
    except Exception as e:
        logger.error(f'Failed to start onboarding: {str(e)}')
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail='Failed to start onboarding process',
        )


@router.get('/status', response_model=OnboardingStatusResponse)
async def get_onboarding_status(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> OnboardingStatusResponse:
    try:
        return await onboarding_service.get_onboarding_status(user.id, db)
    except Exception as e:
        logger.error(f'Failed to get onboarding status: {str(e)}')
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail='Failed to retrieve onboarding status',
        )


@router.put('/update', response_model=OnboardingStatusResponse)
async def update_onboarding_progress(
    request: OnboardingUpdateRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> OnboardingStatusResponse:
    try:
        return await onboarding_service.update_onboarding(user.id, request, db)
    except Exception as e:
        logger.error(f'Failed to update onboarding: {str(e)}', exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail='Failed to update onboarding progress',
        )


@router.post('/complete', response_model=OnboardingCompleteResponse)
async def complete_onboarding(
    request: OnboardingCompleteRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> OnboardingCompleteResponse:
    try:
        return await onboarding_service.complete_onboarding(
            user.id, request.feedback, db
        )
    except Exception as e:
        logger.error(f'Failed to complete onboarding: {str(e)}')
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail='Failed to complete onboarding',
        )


@router.post('/skip', response_model=OnboardingSkipResponse)
async def skip_onboarding(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> OnboardingSkipResponse:
    try:
        return await onboarding_service.skip_onboarding(user.id, db)
    except Exception as e:
        logger.error(f'Failed to skip onboarding: {str(e)}')
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail='Failed to skip onboarding',
        )


@router.post('/auto-create-organization', response_model=OrganizationResponse)
async def auto_create_organization(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> OrganizationResponse:
    try:
        organization = await onboarding_service.auto_create_organization(user.id, db)
        return OrganizationResponse.from_orm(organization)
    except Exception as e:
        logger.error(f'Failed to auto-create organization: {str(e)}')
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail='Failed to create organization',
        )


@router.get('/check-first-time')
async def check_first_time_user(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> dict:
    try:
        is_first_time = await onboarding_service.check_first_time_user(user.id, db)
        return {'is_first_time': is_first_time}
    except Exception as e:
        logger.error(f'Failed to check first-time user status: {str(e)}')
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail='Failed to check user status',
        )
