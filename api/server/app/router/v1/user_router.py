from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.auth import get_current_user
from app.db import get_db
from app.models.user_model import User
from app.services.user_service import user_service
from app.schemas.user_schema import (
    UserProfileResponse,
    UserProfileUpdateRequest,
    UserDeleteResponse
)

user_router = APIRouter(
    prefix="/users",
    tags=["users"],
)


@user_router.get(
    "/me", 
    response_model=UserProfileResponse, 
    status_code=status.HTTP_200_OK,
    summary="Get current user profile",
    description="Returns the current authenticated user's profile with workspace information"
)
async def get_current_user_profile(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
) -> UserProfileResponse:
    profile = await user_service.get_user_profile(user.id, db)
    
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User profile not found"
        )
    
    return profile


@user_router.put(
    "/me",
    response_model=UserProfileResponse,
    status_code=status.HTTP_200_OK,
    summary="Update current user profile",
    description="Updates the current authenticated user's profile fields"
)
async def update_current_user_profile(
    update_data: UserProfileUpdateRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
) -> UserProfileResponse:
    updated_profile = await user_service.update_user_profile(
        user.id, update_data, db
    )
    
    if not updated_profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User profile not found"
        )
    
    return updated_profile


@user_router.delete(
    "/me",
    response_model=UserDeleteResponse,
    status_code=status.HTTP_200_OK,
    summary="Delete current user account",
    description="Soft deletes the current authenticated user's account and associated data"
)
async def delete_current_user_account(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
) -> UserDeleteResponse:
    deletion_response = await user_service.soft_delete_user(user.id, db)
    
    if not deletion_response:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User account not found"
        )
    
    return deletion_response