from typing import Any, List, Dict
from uuid import UUID
from fastapi import APIRouter, Depends, status, Response

from sqlalchemy.ext.asyncio import AsyncSession
from app.db import get_db
from app.core.auth import get_current_user
from app.models.user_model import User
from app.schemas.roadmap_schema import (
    RoadmapRead,
    RoadmapUpdate,
    RoadmapColumnCreate,
    RoadmapColumnUpdate,
    RoadmapColumnRead,
    RoadmapFeatureCreate,
    RoadmapFeatureUpdate,
    RoadmapFeatureRead,
)
from app.services.roadmap_service import roadmap_service, RoadmapService

router = APIRouter()
public_router = APIRouter()


@router.put('/roadmaps/{roadmap_id}', response_model=RoadmapRead)
async def update_roadmap(
    roadmap_id: UUID,
    roadmap_in: RoadmapUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
    service: RoadmapService = Depends(lambda: roadmap_service),
) -> Any:
    return await service.update_roadmap(
        db, user=current_user, roadmap_id=roadmap_id, roadmap_in=roadmap_in
    )


# --- Column Endpoints ---
@router.post(
    '/columns', response_model=RoadmapColumnRead, status_code=status.HTTP_201_CREATED
)
async def create_roadmap_column(
    column_in: RoadmapColumnCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
    service: RoadmapService = Depends(lambda: roadmap_service),
) -> Any:
    return await service.create_column(db, user=current_user, column_in=column_in)


@router.put('/columns/{column_id}', response_model=RoadmapColumnRead)
async def update_roadmap_column(
    column_id: UUID,
    column_in: RoadmapColumnUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
    service: RoadmapService = Depends(lambda: roadmap_service),
) -> Any:
    return await service.update_column(
        db, user=current_user, column_id=column_id, column_in=column_in
    )


@router.delete('/columns/{column_id}', status_code=status.HTTP_204_NO_CONTENT)
async def delete_roadmap_column(
    column_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
    service: RoadmapService = Depends(lambda: roadmap_service),
):
    await service.delete_column(db, user=current_user, column_id=column_id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)


# --- Feature Endpoints ---
@router.post(
    '/features', response_model=RoadmapFeatureRead, status_code=status.HTTP_201_CREATED
)
async def create_roadmap_feature(
    feature_in: RoadmapFeatureCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
    service: RoadmapService = Depends(lambda: roadmap_service),
) -> Any:
    return await service.create_feature(db, user=current_user, feature_in=feature_in)


# --- THIS IS THE FIX: The specific route '/features/order' now comes BEFORE the generic '/features/{feature_id}' ---
@router.put('/features/order')
async def update_features_order(
    updates: List[Dict[str, Any]],
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
    service: RoadmapService = Depends(lambda: roadmap_service),
) -> Any:
    return await service.update_features_order(db, user=current_user, updates=updates)


@router.put('/features/{feature_id}', response_model=RoadmapFeatureRead)
async def update_roadmap_feature(
    feature_id: UUID,
    feature_in: RoadmapFeatureUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
    service: RoadmapService = Depends(lambda: roadmap_service),
) -> Any:
    return await service.update_feature(
        db, user=current_user, feature_id=feature_id, feature_in=feature_in
    )


@router.delete('/features/{feature_id}', status_code=status.HTTP_204_NO_CONTENT)
async def delete_roadmap_feature(
    feature_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
    service: RoadmapService = Depends(lambda: roadmap_service),
):
    await service.delete_feature(db, user=current_user, feature_id=feature_id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)


# --- Public Endpoints ---
@public_router.get('/roadmaps/{public_slug}', response_model=RoadmapRead)
async def get_public_roadmap(
    public_slug: str,
    db: AsyncSession = Depends(get_db),
    service: RoadmapService = Depends(lambda: roadmap_service),
) -> Any:
    return await service.get_public_roadmap(db, public_slug=public_slug)


@public_router.post('/features/{feature_id}/vote', response_model=RoadmapFeatureRead)
async def upvote_roadmap_feature(
    feature_id: UUID,
    db: AsyncSession = Depends(get_db),
    service: RoadmapService = Depends(lambda: roadmap_service),
) -> Any:
    return await service.upvote_feature(db, feature_id=feature_id)
