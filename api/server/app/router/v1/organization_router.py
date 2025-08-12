from typing import Optional, List
from uuid import UUID
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.db import get_db
from app.core.auth import get_current_user, get_current_token_data
from app.schemas.auth_schema import TokenData
from app.schemas.organization_schema import (
    OrganizationCreate,
    OrganizationUpdate,
    OrganizationResponse,
    OrganizationDetailResponse,
    OrganizationListResponse,
    OrganizationInviteRequest,
    OrganizationMemberResponse,
    OrganizationMemberUpdate,
)
from app.services.organization_service import organization_service
from app.core.logging import get_logger

logger = get_logger(__name__)
router = APIRouter(prefix="/organizations", tags=["Organizations"])


@router.post("/", response_model=OrganizationResponse, status_code=status.HTTP_201_CREATED)
async def create_organization(
    org_data: OrganizationCreate,
    db: AsyncSession = Depends(get_db),
    current_user: TokenData = Depends(get_current_token_data)
):
    """Create a new organization."""
    logger.info(f"Creating organization for user {current_user.sub}")
    return await organization_service.create_organization(UUID(current_user.sub), org_data, db)


@router.get("/", response_model=OrganizationListResponse)
async def get_user_organizations(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    current_user: TokenData = Depends(get_current_token_data)
):
    """Get all organizations for the current user."""
    return await organization_service.get_user_organizations(
        UUID(current_user.sub), db, skip, limit
    )


@router.get("/my", response_model=List[OrganizationResponse])
async def get_my_organizations(
    db: AsyncSession = Depends(get_db),
    current_user: TokenData = Depends(get_current_token_data)
):
    """Get all organizations for the current user (simplified endpoint)."""
    result = await organization_service.get_user_organizations(
        UUID(current_user.sub), db, skip=0, limit=100
    )
    return result.organizations


@router.get("/{org_id}", response_model=OrganizationResponse)
async def get_organization(
    org_id: UUID,
    include_members: bool = Query(False),
    db: AsyncSession = Depends(get_db),
    current_user: TokenData = Depends(get_current_token_data)
):
    """Get organization by ID."""
    return await organization_service.get_organization(
        org_id, UUID(current_user.sub), db, include_members
    )


@router.put("/{org_id}", response_model=OrganizationResponse)
async def update_organization(
    org_id: UUID,
    update_data: OrganizationUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: TokenData = Depends(get_current_token_data)
):
    """Update organization (admin/owner only)."""
    return await organization_service.update_organization(
        org_id, UUID(current_user.sub), update_data, db
    )


@router.delete("/{org_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_organization(
    org_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: TokenData = Depends(get_current_token_data)
):
    """Delete organization (owner only)."""
    await organization_service.delete_organization(org_id, UUID(current_user.sub), db)


@router.post("/{org_id}/members", response_model=OrganizationMemberResponse, status_code=status.HTTP_201_CREATED)
async def invite_member(
    org_id: UUID,
    invite_data: OrganizationInviteRequest,
    db: AsyncSession = Depends(get_db),
    current_user: TokenData = Depends(get_current_token_data)
):
    """Invite a member to the organization (admin/owner only)."""
    return await organization_service.invite_member(
        org_id, UUID(current_user.sub), invite_data, db
    )


@router.get("/{org_id}/members", response_model=List[OrganizationMemberResponse])
async def get_organization_members(
    org_id: UUID,
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    current_user: TokenData = Depends(get_current_token_data)
):
    """Get all members of an organization."""
    return await organization_service.get_members(
        org_id, UUID(current_user.sub), db, skip, limit
    )


@router.put("/{org_id}/members/{member_user_id}", response_model=OrganizationMemberResponse)
async def update_member(
    org_id: UUID,
    member_user_id: UUID,
    update_data: OrganizationMemberUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: TokenData = Depends(get_current_token_data)
):
    """Update member role (admin/owner only)."""
    return await organization_service.update_member(
        org_id, member_user_id, UUID(current_user.sub), update_data, db
    )


@router.delete("/{org_id}/members/{member_user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def remove_member(
    org_id: UUID,
    member_user_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: TokenData = Depends(get_current_token_data)
):
    """Remove member from organization (admin/owner only)."""
    await organization_service.remove_member(org_id, member_user_id, UUID(current_user.sub), db)


@router.post("/{org_id}/leave", status_code=status.HTTP_204_NO_CONTENT)
async def leave_organization(
    org_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: TokenData = Depends(get_current_token_data)
):
    """Leave organization (members only, owner must transfer ownership first)."""
    await organization_service.leave_organization(org_id, UUID(current_user.sub), db)