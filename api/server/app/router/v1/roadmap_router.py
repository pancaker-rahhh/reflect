from typing import Any, List, Dict
from uuid import UUID
from fastapi import APIRouter, Depends, status, Response, HTTPException, Query, Request

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
    RoadmapActionItemCreate,
    RoadmapActionItemUpdate,
    RoadmapActionItemRead,
    RoadmapTagCreate,
    RoadmapTagUpdate,
    RoadmapTagRead,
    RoadmapStats,
)
from app.services.roadmap_service import roadmap_service, RoadmapService
from app.core.logging import get_logger
from app.core.rate_limiting import create_rate_limit_decorator

logger = get_logger(__name__)

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
    try:
        return await service.create_roadmap(
            db, user_id=UUID(current_user.user_id), roadmap_in=roadmap_in
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f'Error creating roadmap: {str(e)}')
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail='An error occurred while creating the roadmap',
        )


@router.put('/roadmaps/{roadmap_id}', response_model=RoadmapRead)
async def update_roadmap(
    roadmap_id: UUID,
    roadmap_in: RoadmapUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: TokenData = Depends(get_current_token_data),
    service: RoadmapService = Depends(lambda: roadmap_service),
) -> Any:
    try:
        return await service.update_roadmap(
            db,
            user_id=UUID(current_user.user_id),
            roadmap_id=roadmap_id,
            roadmap_in=roadmap_in,
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f'Error updating roadmap {roadmap_id}: {str(e)}')
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail='An error occurred while updating the roadmap',
        )


@router.get('/roadmaps/{roadmap_id}/stats', response_model=RoadmapStats)
async def get_roadmap_stats(
    roadmap_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: TokenData = Depends(get_current_token_data),
    service: RoadmapService = Depends(lambda: roadmap_service),
) -> Any:
    try:
        await service.get_roadmap_by_project_id(
            db, user_id=UUID(current_user.user_id), project_id=roadmap_id
        )

        from app.repositories.roadmap_repository import roadmap_repository

        return await roadmap_repository.get_roadmap_stats(db, roadmap_id)
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f'Error getting stats for roadmap {roadmap_id}: {str(e)}')
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail='An error occurred while retrieving roadmap statistics',
        )


@router.post(
    '/columns', response_model=RoadmapColumnRead, status_code=status.HTTP_201_CREATED
)
async def create_roadmap_column(
    column_in: RoadmapColumnCreate,
    db: AsyncSession = Depends(get_db),
    current_user: TokenData = Depends(get_current_token_data),
    service: RoadmapService = Depends(lambda: roadmap_service),
) -> Any:
    try:
        return await service.create_column(
            db, user_id=UUID(current_user.user_id), column_in=column_in
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f'Error creating column: {str(e)}')
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail='An error occurred while creating the column',
        )


@router.put('/columns/{column_id}', response_model=RoadmapColumnRead)
async def update_roadmap_column(
    column_id: UUID,
    column_in: RoadmapColumnUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: TokenData = Depends(get_current_token_data),
    service: RoadmapService = Depends(lambda: roadmap_service),
) -> Any:
    try:
        return await service.update_column(
            db,
            user_id=UUID(current_user.user_id),
            column_id=column_id,
            column_in=column_in,
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f'Error updating column {column_id}: {str(e)}')
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail='An error occurred while updating the column',
        )


@router.delete('/columns/{column_id}', status_code=status.HTTP_204_NO_CONTENT)
async def delete_roadmap_column(
    column_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: TokenData = Depends(get_current_token_data),
    service: RoadmapService = Depends(lambda: roadmap_service),
):
    try:
        await service.delete_column(
            db, user_id=UUID(current_user.user_id), column_id=column_id
        )
        return Response(status_code=status.HTTP_204_NO_CONTENT)
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f'Error deleting column {column_id}: {str(e)}')
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail='An error occurred while deleting the column',
        )


@router.post(
    '/tags', response_model=RoadmapTagRead, status_code=status.HTTP_201_CREATED
)
async def create_roadmap_tag(
    tag_in: RoadmapTagCreate,
    db: AsyncSession = Depends(get_db),
    current_user: TokenData = Depends(get_current_token_data),
    service: RoadmapService = Depends(lambda: roadmap_service),
) -> Any:
    try:
        return await service.create_tag(
            db, user_id=UUID(current_user.user_id), tag_in=tag_in
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f'Error creating tag: {str(e)}')
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail='An error occurred while creating the tag',
        )


@router.get(
    '/roadmaps/{roadmap_id}/tags',
    response_model=List[RoadmapTagRead],
)
async def get_roadmap_tags(
    roadmap_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: TokenData = Depends(get_current_token_data),
    service: RoadmapService = Depends(lambda: roadmap_service),
) -> Any:
    try:
        return await service.get_tags_by_roadmap(
            db, user_id=UUID(current_user.user_id), roadmap_id=roadmap_id
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f'Error getting tags for roadmap {roadmap_id}: {str(e)}')
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail='An error occurred while retrieving roadmap tags',
        )


@router.put(
    '/tags/{tag_id}',
    response_model=RoadmapTagRead,
)
async def update_roadmap_tag(
    tag_id: UUID,
    tag_in: RoadmapTagUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: TokenData = Depends(get_current_token_data),
    service: RoadmapService = Depends(lambda: roadmap_service),
) -> Any:
    try:
        return await service.update_tag(
            db, user_id=UUID(current_user.user_id), tag_id=tag_id, tag_in=tag_in
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f'Error updating tag {tag_id}: {str(e)}')
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail='An error occurred while updating the tag',
        )


@router.delete(
    '/tags/{tag_id}',
    status_code=status.HTTP_204_NO_CONTENT,
)
async def delete_roadmap_tag(
    tag_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: TokenData = Depends(get_current_token_data),
    service: RoadmapService = Depends(lambda: roadmap_service),
):
    try:
        await service.delete_tag(db, user_id=UUID(current_user.user_id), tag_id=tag_id)
        return Response(status_code=status.HTTP_204_NO_CONTENT)
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f'Error deleting tag {tag_id}: {str(e)}')
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail='An error occurred while deleting the tag',
        )


@router.post(
    '/features',
    response_model=RoadmapActionItemRead,
    status_code=status.HTTP_201_CREATED,
)
async def create_roadmap_feature(
    feature_in: RoadmapActionItemCreate,
    db: AsyncSession = Depends(get_db),
    current_user: TokenData = Depends(get_current_token_data),
    service: RoadmapService = Depends(lambda: roadmap_service),
) -> Any:
    try:
        return await service.create_feature(
            db, user_id=UUID(current_user.user_id), feature_in=feature_in
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f'Error creating feature: {str(e)}')
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail='An error occurred while creating the feature',
        )


@router.put('/features/order')
async def update_features_order(
    updates: List[Dict[str, Any]],
    db: AsyncSession = Depends(get_db),
    current_user: TokenData = Depends(get_current_token_data),
    service: RoadmapService = Depends(lambda: roadmap_service),
) -> Any:
    try:
        if not updates:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, detail='No updates provided'
            )

        return await service.update_features_order(
            db, user_id=UUID(current_user.user_id), updates=updates
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f'Error updating feature order: {str(e)}')
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail='An error occurred while updating feature order',
        )


@router.put('/features/{feature_id}', response_model=RoadmapActionItemRead)
async def update_roadmap_feature(
    feature_id: UUID,
    feature_in: RoadmapActionItemUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: TokenData = Depends(get_current_token_data),
    service: RoadmapService = Depends(lambda: roadmap_service),
) -> Any:
    try:
        return await service.update_feature(
            db,
            user_id=UUID(current_user.user_id),
            feature_id=feature_id,
            feature_in=feature_in,
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f'Error updating feature {feature_id}: {str(e)}')
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail='An error occurred while updating the feature',
        )


@router.delete('/features/{feature_id}', status_code=status.HTTP_204_NO_CONTENT)
async def delete_roadmap_feature(
    feature_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: TokenData = Depends(get_current_token_data),
    service: RoadmapService = Depends(lambda: roadmap_service),
):
    try:
        await service.delete_feature(
            db, user_id=UUID(current_user.user_id), feature_id=feature_id
        )
        return Response(status_code=status.HTTP_204_NO_CONTENT)
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f'Error deleting feature {feature_id}: {str(e)}')
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail='An error occurred while deleting the feature',
        )


@router.post('/features/{feature_id}/assignments')
async def assign_user_to_feature(
    feature_id: UUID,
    assignee_user_id: UUID = Query(..., description='ID of the user to assign'),
    role: str = Query('contributor', description='Role for the assignment'),
    db: AsyncSession = Depends(get_db),
    current_user: TokenData = Depends(get_current_token_data),
    service: RoadmapService = Depends(lambda: roadmap_service),
) -> Any:
    try:
        return await service.assign_user_to_feature(
            db,
            user_id=UUID(current_user.user_id),
            feature_id=feature_id,
            assignee_user_id=assignee_user_id,
            role=role,
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(
            f'Error assigning user {assignee_user_id} to feature {feature_id}: {str(e)}'
        )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail='An error occurred while assigning the user to the feature',
        )


@router.delete('/features/{feature_id}/assignments/{assignee_user_id}')
async def remove_user_from_feature(
    feature_id: UUID,
    assignee_user_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: TokenData = Depends(get_current_token_data),
    service: RoadmapService = Depends(lambda: roadmap_service),
):
    try:
        success = await service.remove_user_from_feature(
            db,
            user_id=UUID(current_user.user_id),
            feature_id=feature_id,
            assignee_user_id=assignee_user_id,
        )
        return {'success': success}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(
            f'Error removing user {assignee_user_id} from feature {feature_id}: {str(e)}'
        )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail='An error occurred while removing the user assignment',
        )


@router.get('/features/{feature_id}/assignments')
async def get_feature_assignments(
    feature_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: TokenData = Depends(get_current_token_data),
    service: RoadmapService = Depends(lambda: roadmap_service),
) -> Any:
    try:
        return await service.get_feature_assignments(
            db, user_id=UUID(current_user.user_id), feature_id=feature_id
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f'Error getting assignments for feature {feature_id}: {str(e)}')
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail='An error occurred while retrieving feature assignments',
        )


@public_router.get('/roadmaps/{public_slug}', response_model=RoadmapRead)
@create_rate_limit_decorator('roadmap_access', is_anonymous=True)
async def get_public_roadmap(
    request: Request,
    public_slug: str,
    db: AsyncSession = Depends(get_db),
    service: RoadmapService = Depends(lambda: roadmap_service),
) -> Any:
    try:
        return await service.get_public_roadmap(db, public_slug=public_slug)
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f'Error getting public roadmap by slug {public_slug}: {str(e)}')
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail='An error occurred while retrieving the public roadmap',
        )


@public_router.get('/r/{subdomain}', response_model=RoadmapRead)
@create_rate_limit_decorator('roadmap_access', is_anonymous=True)
async def get_public_roadmap_by_subdomain(
    request: Request,
    subdomain: str,
    db: AsyncSession = Depends(get_db),
    service: RoadmapService = Depends(lambda: roadmap_service),
) -> Any:
    try:
        return await service.get_public_roadmap_by_subdomain(db, subdomain=subdomain)
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f'Error getting public roadmap by subdomain {subdomain}: {str(e)}')
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail='An error occurred while retrieving the public roadmap',
        )


@public_router.get('/roadmaps/{roadmap_id}/tags', response_model=List[RoadmapTagRead])
@create_rate_limit_decorator('roadmap_access', is_anonymous=True)
async def get_public_roadmap_tags(
    request: Request,
    roadmap_id: UUID,
    db: AsyncSession = Depends(get_db),
    service: RoadmapService = Depends(lambda: roadmap_service),
) -> Any:
    try:
        return await service.get_tags_by_roadmap(
            db, user_id=None, roadmap_id=roadmap_id
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f'Error getting public roadmap tags for {roadmap_id}: {str(e)}')
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail='An error occurred while retrieving roadmap tags',
        )


@public_router.post('/features/{feature_id}/vote', response_model=RoadmapActionItemRead)
@create_rate_limit_decorator('voting', is_anonymous=True)
async def upvote_roadmap_feature(
    request: Request,
    feature_id: UUID,
    db: AsyncSession = Depends(get_db),
    service: RoadmapService = Depends(lambda: roadmap_service),
) -> Any:
    try:
        return await service.upvote_feature(db, feature_id=feature_id)
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f'Error upvoting feature {feature_id}: {str(e)}')
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail='An error occurred while upvoting the feature',
        )
