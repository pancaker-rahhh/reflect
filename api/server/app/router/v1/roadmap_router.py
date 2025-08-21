from typing import Any, List, Dict
from uuid import UUID
from fastapi import APIRouter, Depends, status, Response

from sqlalchemy.ext.asyncio import AsyncSession
from app.db import get_db
from app.core.auth import get_current_token_data
from app.schemas.auth_schema import TokenData
from app.schemas.roadmap_schema import (
    RoadmapRead,
    RoadmapUpdate,
    RoadmapCreate,
    RoadmapColumnCreate,
    RoadmapColumnUpdate,
    RoadmapColumnRead,
    RoadmapFeatureCreate,
    RoadmapFeatureUpdate,
    RoadmapFeatureRead,
    RoadmapTagCreate,
    RoadmapTagUpdate,
    RoadmapTagRead,
)
from app.services.roadmap_service import roadmap_service, RoadmapService

router = APIRouter()
public_router = APIRouter()


@router.post(
    '/roadmaps', response_model=RoadmapRead, status_code=status.HTTP_201_CREATED
)
async def create_roadmap(
    roadmap_in: RoadmapCreate,
    db: AsyncSession = Depends(get_db),
    current_user: TokenData = Depends(get_current_token_data),
    service: RoadmapService = Depends(lambda: roadmap_service),
) -> Any:
    return await service.create_roadmap(
        db, user_id=UUID(current_user.user_id), roadmap_in=roadmap_in
    )


@router.put('/roadmaps/{roadmap_id}', response_model=RoadmapRead)
async def update_roadmap(
    roadmap_id: UUID,
    roadmap_in: RoadmapUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: TokenData = Depends(get_current_token_data),
    service: RoadmapService = Depends(lambda: roadmap_service),
) -> Any:
    return await service.update_roadmap(
        db,
        user_id=UUID(current_user.user_id),
        roadmap_id=roadmap_id,
        roadmap_in=roadmap_in,
    )


# --- Column Endpoints ---
@router.post(
    '/columns', response_model=RoadmapColumnRead, status_code=status.HTTP_201_CREATED
)
async def create_roadmap_column(
    column_in: RoadmapColumnCreate,
    db: AsyncSession = Depends(get_db),
    current_user: TokenData = Depends(get_current_token_data),
    service: RoadmapService = Depends(lambda: roadmap_service),
) -> Any:
    return await service.create_column(
        db, user_id=UUID(current_user.user_id), column_in=column_in
    )


@router.put('/columns/{column_id}', response_model=RoadmapColumnRead)
async def update_roadmap_column(
    column_id: UUID,
    column_in: RoadmapColumnUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: TokenData = Depends(get_current_token_data),
    service: RoadmapService = Depends(lambda: roadmap_service),
) -> Any:
    return await service.update_column(
        db, user_id=UUID(current_user.user_id), column_id=column_id, column_in=column_in
    )


@router.delete('/columns/{column_id}', status_code=status.HTTP_204_NO_CONTENT)
async def delete_roadmap_column(
    column_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: TokenData = Depends(get_current_token_data),
    service: RoadmapService = Depends(lambda: roadmap_service),
):
    await service.delete_column(
        db, user_id=UUID(current_user.user_id), column_id=column_id
    )
    return Response(status_code=status.HTTP_204_NO_CONTENT)


# --- Tag Endpoints ---
@router.post(
    '/tags', response_model=RoadmapTagRead, status_code=status.HTTP_201_CREATED
)
async def create_roadmap_tag(
    tag_in: RoadmapTagCreate,
    db: AsyncSession = Depends(get_db),
    current_user: TokenData = Depends(get_current_token_data),
    service: RoadmapService = Depends(lambda: roadmap_service),
) -> Any:
    return await service.create_tag(
        db, user_id=UUID(current_user.user_id), tag_in=tag_in
    )


@router.get('/roadmaps/{roadmap_id}/tags', response_model=List[RoadmapTagRead])
async def get_roadmap_tags(
    roadmap_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: TokenData = Depends(get_current_token_data),
    service: RoadmapService = Depends(lambda: roadmap_service),
) -> Any:
    return await service.get_tags_by_roadmap(
        db, user_id=UUID(current_user.user_id), roadmap_id=roadmap_id
    )


@router.put('/tags/{tag_id}', response_model=RoadmapTagRead)
async def update_roadmap_tag(
    tag_id: UUID,
    tag_in: RoadmapTagUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: TokenData = Depends(get_current_token_data),
    service: RoadmapService = Depends(lambda: roadmap_service),
) -> Any:
    return await service.update_tag(
        db, user_id=UUID(current_user.user_id), tag_id=tag_id, tag_in=tag_in
    )


@router.delete('/tags/{tag_id}', status_code=status.HTTP_204_NO_CONTENT)
async def delete_roadmap_tag(
    tag_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: TokenData = Depends(get_current_token_data),
    service: RoadmapService = Depends(lambda: roadmap_service),
):
    await service.delete_tag(db, user_id=UUID(current_user.user_id), tag_id=tag_id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)


# --- Feature Endpoints ---
@router.post(
    '/features', response_model=RoadmapFeatureRead, status_code=status.HTTP_201_CREATED
)
async def create_roadmap_feature(
    feature_in: RoadmapFeatureCreate,
    db: AsyncSession = Depends(get_db),
    current_user: TokenData = Depends(get_current_token_data),
    service: RoadmapService = Depends(lambda: roadmap_service),
) -> Any:
    return await service.create_feature(
        db, user_id=UUID(current_user.user_id), feature_in=feature_in
    )


# --- THIS IS THE FIX: The specific route '/features/order' now comes BEFORE the generic '/features/{feature_id}' ---
@router.put('/features/order')
async def update_features_order(
    updates: List[Dict[str, Any]],
    db: AsyncSession = Depends(get_db),
    current_user: TokenData = Depends(get_current_token_data),
    service: RoadmapService = Depends(lambda: roadmap_service),
) -> Any:
    return await service.update_features_order(
        db, user_id=UUID(current_user.user_id), updates=updates
    )


@router.put('/features/{feature_id}', response_model=RoadmapFeatureRead)
async def update_roadmap_feature(
    feature_id: UUID,
    feature_in: RoadmapFeatureUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: TokenData = Depends(get_current_token_data),
    service: RoadmapService = Depends(lambda: roadmap_service),
) -> Any:
    return await service.update_feature(
        db,
        user_id=UUID(current_user.user_id),
        feature_id=feature_id,
        feature_in=feature_in,
    )


@router.delete('/features/{feature_id}', status_code=status.HTTP_204_NO_CONTENT)
async def delete_roadmap_feature(
    feature_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: TokenData = Depends(get_current_token_data),
    service: RoadmapService = Depends(lambda: roadmap_service),
):
    await service.delete_feature(
        db, user_id=UUID(current_user.user_id), feature_id=feature_id
    )
    return Response(status_code=status.HTTP_204_NO_CONTENT)


# --- Public Endpoints ---
@public_router.get('/roadmaps/{public_slug}', response_model=RoadmapRead)
async def get_public_roadmap(
    public_slug: str,
    db: AsyncSession = Depends(get_db),
    service: RoadmapService = Depends(lambda: roadmap_service),
) -> Any:
    return await service.get_public_roadmap(db, public_slug=public_slug)


@public_router.get('/r/{subdomain}', response_model=RoadmapRead)
async def get_public_roadmap_by_subdomain(
    subdomain: str,
    db: AsyncSession = Depends(get_db),
    service: RoadmapService = Depends(lambda: roadmap_service),
) -> Any:
    return await service.get_public_roadmap_by_subdomain(db, subdomain=subdomain)


@public_router.get('/roadmaps/{roadmap_id}/tags', response_model=List[RoadmapTagRead])
async def get_public_roadmap_tags(
    roadmap_id: UUID,
    db: AsyncSession = Depends(get_db),
    service: RoadmapService = Depends(lambda: roadmap_service),
) -> Any:
    # For public endpoints, pass None as user_id
    return await service.get_tags_by_roadmap(db, user_id=None, roadmap_id=roadmap_id)


@public_router.post('/features/{feature_id}/vote', response_model=RoadmapFeatureRead)
async def upvote_roadmap_feature(
    feature_id: UUID,
    db: AsyncSession = Depends(get_db),
    service: RoadmapService = Depends(lambda: roadmap_service),
) -> Any:
    return await service.upvote_feature(db, feature_id=feature_id)


# --- Assignment Endpoints ---
@router.post('/features/{feature_id}/assignments')
async def assign_user_to_feature(
    feature_id: UUID,
    assignee_user_id: UUID,
    role: str = 'contributor',
    db: AsyncSession = Depends(get_db),
    current_user: TokenData = Depends(get_current_token_data),
    service: RoadmapService = Depends(lambda: roadmap_service),
) -> Any:
    return await service.assign_user_to_feature(
        db,
        user_id=UUID(current_user.user_id),
        feature_id=feature_id,
        assignee_user_id=assignee_user_id,
        role=role,
    )


@router.delete('/features/{feature_id}/assignments/{assignee_user_id}')
async def remove_user_from_feature(
    feature_id: UUID,
    assignee_user_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: TokenData = Depends(get_current_token_data),
    service: RoadmapService = Depends(lambda: roadmap_service),
) -> Any:
    success = await service.remove_user_from_feature(
        db,
        user_id=UUID(current_user.user_id),
        feature_id=feature_id,
        assignee_user_id=assignee_user_id,
    )
    return {'success': success}


@router.get('/features/{feature_id}/assignments')
async def get_feature_assignments(
    feature_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: TokenData = Depends(get_current_token_data),
    service: RoadmapService = Depends(lambda: roadmap_service),
) -> Any:
    return await service.get_feature_assignments(
        db, user_id=UUID(current_user.user_id), feature_id=feature_id
    )
