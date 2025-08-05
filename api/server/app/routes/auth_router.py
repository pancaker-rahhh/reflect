from app.core.auth import get_current_user
from app.models.schemas.user_schemas import UserProfileUpdate, UserInfo
from app.services.user_service import user_service
from fastapi import APIRouter, Depends

router = APIRouter(tags=['Auth'])


@router.get('/me', response_model=UserInfo)
async def get_current_user_profile(current_user: dict = Depends(get_current_user)):
    return user_service.get_user_info_from_id(current_user['id'])


@router.put('/me', response_model=UserInfo)
async def update_user_profile(
    profile_data: UserProfileUpdate, current_user: dict = Depends(get_current_user)
):
    return user_service.update_own_profile(profile_data, current_user)
