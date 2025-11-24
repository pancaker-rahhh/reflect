from typing import Optional
from uuid import UUID
from fastapi import APIRouter, Depends, BackgroundTasks, status, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.db import get_db
from app.core.auth import get_current_token_data, get_current_token_data_optional
from app.schemas.auth_schema import TokenData
from app.schemas.invitation_schema import (
    BulkInvitationRequest,
    BulkInvitationResponse,
    InvitationStatusResponse,
    InvitationAcceptRequest,
    InvitationAcceptResponse,
    InvitationValidateResponse,
)
from app.services.invitation_service import invitation_service
from app.core.logging import get_logger

logger = get_logger(__name__)
router = APIRouter(prefix='/invitations', tags=['Invitations'])


@router.post(
    '/bulk', response_model=BulkInvitationResponse, status_code=status.HTTP_202_ACCEPTED
)
async def send_bulk_invitations(
    request: BulkInvitationRequest,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
    current_user: TokenData = Depends(get_current_token_data),
):
    user_id = UUID(current_user.sub)

    # Validate that user has permission to invite to this organization
    if request.organization_id:
        has_permission = await invitation_service.check_invite_permission(
            user_id, request.organization_id, db
        )
        if not has_permission:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You don't have permission to invite members to this organization",
            )

    # Create invitation task
    task_id = await invitation_service.create_bulk_invitation_task(
        user_id=user_id,
        organization_id=request.organization_id,
        invitations=request.invitations,
        db=db,
    )

    # Process invitations in background
    background_tasks.add_task(
        invitation_service.process_bulk_invitations,
        task_id=task_id,
        user_id=user_id,
        organization_id=request.organization_id,
        invitations=request.invitations,
    )

    return BulkInvitationResponse(
        task_id=task_id,
        total_count=len(request.invitations),
        status='processing',
        message=f'Processing {len(request.invitations)} invitations in background',
    )


@router.get('/bulk/{task_id}/status', response_model=InvitationStatusResponse)
async def get_bulk_invitation_status(
    task_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: TokenData = Depends(get_current_token_data),
):
    user_id = UUID(current_user.sub)

    invitation_status = await invitation_service.get_invitation_task_status(
        task_id=task_id, user_id=user_id, db=db
    )

    if not invitation_status:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail='Invitation task not found'
        )

    return invitation_status


@router.post('/resend/{invitation_id}', status_code=status.HTTP_204_NO_CONTENT)
async def resend_invitation(
    invitation_id: UUID,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
    current_user: TokenData = Depends(get_current_token_data),
):
    user_id = UUID(current_user.sub)

    # Verify permission and resend
    invitation = await invitation_service.get_invitation(invitation_id, user_id, db)
    if not invitation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail='Invitation not found'
        )

    # Resend in background
    background_tasks.add_task(
        invitation_service.resend_invitation, invitation_id=invitation_id
    )

    logger.info(f'Resending invitation {invitation_id} for user {user_id}')


@router.delete('/{invitation_id}', status_code=status.HTTP_204_NO_CONTENT)
async def cancel_invitation(
    invitation_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: TokenData = Depends(get_current_token_data),
):
    user_id = UUID(current_user.sub)

    success = await invitation_service.cancel_invitation(invitation_id, user_id, db)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail='Invitation not found or already accepted',
        )

    logger.info(f'Cancelled invitation {invitation_id} by user {user_id}')


@router.get('/validate/{token}', response_model=InvitationValidateResponse)
async def validate_invitation(token: str, db: AsyncSession = Depends(get_db)):
    invitation_details = await invitation_service.validate_invitation_token(token, db)

    if not invitation_details:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail='Invalid or expired invitation token',
        )

    return invitation_details


@router.post('/accept', response_model=InvitationAcceptResponse)
async def accept_invitation(
    request: InvitationAcceptRequest,
    db: AsyncSession = Depends(get_db),
    current_user: Optional[TokenData] = Depends(get_current_token_data_optional),
):
    user_id = UUID(current_user.sub) if current_user else None

    try:
        acceptance_result = await invitation_service.accept_invitation(
            token=request.token,
            user_id=user_id,
            user_data=request.user_data if not user_id else None,
            db=db,
        )

        if not acceptance_result:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail='Failed to accept invitation',
            )

        return acceptance_result

    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        logger.error(f'Error accepting invitation: {str(e)}')
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail='An error occurred while accepting the invitation',
        )
