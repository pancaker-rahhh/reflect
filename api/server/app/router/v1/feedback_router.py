from typing import List, Optional, Dict, Any
from uuid import UUID
from fastapi import APIRouter, Depends, BackgroundTasks, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException
from app.db import get_db
from app.core.auth import get_current_token_data
from app.schemas.feedback_schema import (
    FeedbackConversionRequest,
    FeedbackUpdate,
    FeedbackResponsePayload,
    FeedbackCreatePayload,
    FeedbackCommentCreate,
    FeedbackCommentResponse,
    UpvoteResponse,
)
from app.schemas.auth_schema import TokenData
from app.services.feedback_service import feedback_service
from app.services.action_item_service import action_item_service
from app.core.exceptions import NotFoundError, ValidationError
from app.core.logging import get_logger

logger = get_logger(__name__)
# from app.services.tasks.executors.fastapi_executor import FastAPIExecutor
# from app.services.tasks.base_executor import TaskPriority


feedback_router = APIRouter(prefix='/feedback', tags=['feedback'])


@feedback_router.post(
    '', response_model=FeedbackResponsePayload, status_code=status.HTTP_201_CREATED
)
async def create_feedback(
    payload: FeedbackCreatePayload,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
) -> FeedbackResponsePayload:
    # executor = FastAPIExecutor(background_tasks)
    # Example: register and execute background tasks if needed
    # executor.register_task('send_webhook', some_async_func)
    # await executor.execute('send_webhook', {"feedback": payload.model_dump()})
    return await feedback_service.create_feedback(db, payload)


@feedback_router.get('', response_model=List[FeedbackResponsePayload])
async def list_feedback(
    project_id: Optional[UUID] = Query(default=None),
    widget_id: Optional[UUID] = Query(default=None),
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=100, ge=1, le=1000),
    db: AsyncSession = Depends(get_db),
) -> List[FeedbackResponsePayload]:
    return await feedback_service.list_feedback(
        db, project_id=project_id, widget_id=widget_id, skip=skip, limit=limit
    )


def _convert_feedback_to_dict(item) -> Dict[str, Any]:
    return {
        'id': str(item.id),
        'type': item.feedback_type.value
        if hasattr(item.feedback_type, 'value')
        else str(item.feedback_type),
        'status': item.status.value
        if hasattr(item.status, 'value')
        else str(item.status),
        'summary': item.title
        or item.message
        or f'Feedback: {item.feedback_type.value}',
        'submittedBy': item.submitter_name or 'Anonymous',
        'timestamp': item.created_at.isoformat() if item.created_at else None,
        'feedback_votes': item.feedback_votes,
        'is_actionable': item.is_actionable,
    }


@feedback_router.get('/actionable', response_model=List[Dict[str, Any]])
async def get_actionable_feedback(
    project_id: Optional[UUID] = Query(
        default=None, description='Project ID to filter feedback'
    ),
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=100, ge=1, le=1000),
    db: AsyncSession = Depends(get_db),
) -> List[Dict[str, Any]]:
    if not project_id:
        return []

    actionable_feedback = await feedback_service.get_actionable_feedback(
        db, project_id, skip, limit
    )

    return [_convert_feedback_to_dict(item) for item in actionable_feedback]


@feedback_router.get('/chart-data', response_model=List[Dict[str, Any]])
async def get_feedback_for_charts(
    time_range: Optional[str] = Query(default='all'),
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=100, ge=1, le=1000),
    db: AsyncSession = Depends(get_db),
) -> List[Dict[str, Any]]:
    """Get feedback data for charts and analytics."""
    try:
        # For now, return empty list until we have data
        # TODO: Implement logic to get feedback data based on time_range
        return []
    except Exception as e:
        logger.error(f'Error getting feedback chart data: {str(e)}')
        raise HTTPException(status_code=500, detail='Failed to get feedback chart data')


@feedback_router.get('/{feedback_id}/conversion-preview', response_model=Dict[str, Any])
async def get_conversion_preview(
    feedback_id: UUID, db: AsyncSession = Depends(get_db)
) -> Dict[str, Any]:
    try:
        preview = await action_item_service.get_conversion_preview(db, feedback_id)
        return preview
    except (NotFoundError, ValidationError) as e:
        raise HTTPException(status_code=400, detail=str(e))


@feedback_router.get('/{feedback_id}', response_model=FeedbackResponsePayload)
async def get_feedback(
    feedback_id: UUID, db: AsyncSession = Depends(get_db)
) -> FeedbackResponsePayload:
    result = await feedback_service.get_feedback(db, feedback_id)
    if not result:
        raise HTTPException(status_code=404, detail='Feedback not found')
    return result


@feedback_router.patch('/{feedback_id}', response_model=FeedbackResponsePayload)
async def update_feedback(
    feedback_id: UUID, payload: FeedbackUpdate, db: AsyncSession = Depends(get_db)
) -> FeedbackResponsePayload:
    result = await feedback_service.update_feedback(db, feedback_id, payload)
    if not result:
        raise HTTPException(status_code=404, detail='Feedback not found')
    return result


@feedback_router.delete('/{feedback_id}', status_code=status.HTTP_204_NO_CONTENT)
async def delete_feedback(
    feedback_id: UUID, db: AsyncSession = Depends(get_db)
) -> None:
    deleted = await feedback_service.delete_feedback(db, feedback_id)
    if not deleted:
        raise HTTPException(status_code=404, detail='Feedback not found')
    return None


# Comment endpoints
@feedback_router.post(
    '/{feedback_id}/comments',
    response_model=FeedbackCommentResponse,
    status_code=status.HTTP_201_CREATED,
)
async def add_comment(
    feedback_id: UUID,
    comment_data: FeedbackCommentCreate,
    current_user: TokenData = Depends(get_current_token_data),
    db: AsyncSession = Depends(get_db),
) -> FeedbackCommentResponse:
    comment = await feedback_service.add_comment(
        db, feedback_id, UUID(current_user.user_id), comment_data.comment_text
    )
    return FeedbackCommentResponse.model_validate(comment)


@feedback_router.get(
    '/{feedback_id}/comments', response_model=List[FeedbackCommentResponse]
)
async def get_comments(
    feedback_id: UUID,
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=50, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
) -> List[FeedbackCommentResponse]:
    comments = await feedback_service.get_comments(db, feedback_id, skip, limit)
    return [FeedbackCommentResponse.model_validate(c) for c in comments]


@feedback_router.post(
    '/{feedback_id}/upvote',
    response_model=UpvoteResponse,
    status_code=status.HTTP_200_OK,
)
async def upvote_feedback(
    feedback_id: UUID,
    current_user: TokenData = Depends(get_current_token_data),
    db: AsyncSession = Depends(get_db),
) -> UpvoteResponse:
    try:
        success = await feedback_service.upvote_feedback(db, feedback_id)
        if success:
            feedback = await feedback_service.get_feedback(db, feedback_id)
            return UpvoteResponse(
                success=True,
                feedback_votes=feedback.feedback_votes if feedback else 0,
                message='Feedback upvoted successfully',
            )
        return UpvoteResponse(
            success=False, feedback_votes=0, message='Failed to upvote feedback'
        )
    except NotFoundError:
        raise HTTPException(status_code=404, detail='Feedback not found')
    except ValidationError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f'Unexpected error during upvote: {str(e)}')
        raise HTTPException(status_code=500, detail='Internal server error')


@feedback_router.post(
    '/{feedback_id}/convert',
    response_model=Dict[str, Any],
    status_code=status.HTTP_201_CREATED,
)
async def convert_feedback_to_roadmap_item(
    feedback_id: UUID,
    conversion_data: FeedbackConversionRequest,
    current_user: TokenData = Depends(get_current_token_data),
    db: AsyncSession = Depends(get_db),
) -> Dict[str, Any]:
    try:
        roadmap_item = await action_item_service.convert_feedback_to_roadmap_item(
            db,
            feedback_id,
            UUID(current_user.user_id),
            conversion_data.priority,
            conversion_data.conversion_notes,
            conversion_data.custom_tags,
        )
        return {
            'message': 'Feedback successfully converted to roadmap item',
            'roadmap_item_id': str(roadmap_item.id),
            'feedback_id': str(feedback_id),
        }
    except (NotFoundError, ValidationError) as e:
        raise HTTPException(status_code=400, detail=str(e))
