from typing import List, Optional, Dict, Any
from uuid import UUID
from fastapi import APIRouter, Depends, BackgroundTasks, Query, status, Request
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException
from app.db import get_db
from app.core.auth import get_current_token_data
from app.schemas.feedback_schema import (
    FeedbackConversionRequest,
    BulkFeedbackConversionRequest,
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
from app.core.rate_limiting import create_rate_limit_decorator
from app.core.sanitization import InputSanitizer
from app.core.dependencies import get_bulk_conversion_service, get_action_item_service

logger = get_logger(__name__)


feedback_router = APIRouter(prefix='/feedback', tags=['feedback'])


@feedback_router.post(
    '', response_model=FeedbackResponsePayload, status_code=status.HTTP_201_CREATED
)
@create_rate_limit_decorator('feedback_submission', is_anonymous=True)
async def create_feedback(
    request: Request,
    payload: FeedbackCreatePayload,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
) -> FeedbackResponsePayload:
    sanitized_data = InputSanitizer.sanitize_feedback_data(payload.model_dump())
    sanitized_payload = FeedbackCreatePayload(**sanitized_data)

    # executor = FastAPIExecutor(background_tasks)
    # Example: register and execute background tasks if needed
    # executor.register_task('send_webhook', some_async_func)
    # await executor.execute('send_webhook', {"feedback": payload.model_dump()})
    return await feedback_service.create_feedback(db, sanitized_payload)


@feedback_router.get('', response_model=List[FeedbackResponsePayload])
@create_rate_limit_decorator('general_public')
async def list_feedback(
    request: Request,
    project_id: Optional[UUID] = Query(default=None),
    widget_id: Optional[UUID] = Query(default=None),
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=100, ge=1, le=1000),
    current_user: TokenData = Depends(get_current_token_data),
    db: AsyncSession = Depends(get_db),
) -> List[FeedbackResponsePayload]:
    return await feedback_service.list_feedback(
        db,
        user_id=current_user.user_id,
        project_id=project_id,
        widget_id=widget_id,
        skip=skip,
        limit=limit,
    )


@feedback_router.get('/actionable', response_model=List[Dict[str, Any]])
@create_rate_limit_decorator('general_public')
async def get_actionable_feedback(
    request: Request,
    project_id: Optional[UUID] = Query(
        default=None, description='Project ID to filter feedback'
    ),
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=100, ge=1, le=1000),
    current_user: TokenData = Depends(get_current_token_data),
    db: AsyncSession = Depends(get_db),
) -> List[Dict[str, Any]]:
    if not project_id:
        return []

    actionable_feedback = await feedback_service.get_actionable_feedback(
        db, user_id=current_user.user_id, project_id=project_id, skip=skip, limit=limit
    )

    return [
        feedback_service.format_feedback_for_display(item)
        for item in actionable_feedback
    ]


@feedback_router.get('/chart-data', response_model=List[Dict[str, Any]])
@create_rate_limit_decorator('general_public')
async def get_feedback_for_charts(
    request: Request,
    time_range: Optional[str] = Query(default='all'),
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=100, ge=1, le=1000),
    current_user: TokenData = Depends(get_current_token_data),
    db: AsyncSession = Depends(get_db),
) -> List[Dict[str, Any]]:
    """Get feedback data for charts and analytics."""
    try:
        # For now, return empty list until we have data
        return []
    except Exception as e:
        logger.error(f'Error getting feedback chart data: {str(e)}')
        raise HTTPException(status_code=500, detail='Failed to get feedback chart data')


@feedback_router.get('/{feedback_id}/conversion-preview', response_model=Dict[str, Any])
@create_rate_limit_decorator('general_public')
async def get_conversion_preview(
    request: Request,
    feedback_id: UUID,
    current_user: TokenData = Depends(get_current_token_data),
    db: AsyncSession = Depends(get_db),
) -> Dict[str, Any]:
    try:
        preview = await action_item_service.get_conversion_preview(
            db, feedback_id, current_user.user_id
        )
        return preview
    except (NotFoundError, ValidationError) as e:
        raise HTTPException(status_code=400, detail=str(e))


@feedback_router.get('/{feedback_id}', response_model=FeedbackResponsePayload)
@create_rate_limit_decorator('general_public')
async def get_feedback(
    request: Request,
    feedback_id: UUID,
    current_user: TokenData = Depends(get_current_token_data),
    db: AsyncSession = Depends(get_db),
) -> FeedbackResponsePayload:
    result = await feedback_service.get_feedback(db, feedback_id)
    if not result:
        raise HTTPException(status_code=404, detail='Feedback not found')
    return result


@feedback_router.patch('/{feedback_id}', response_model=FeedbackResponsePayload)
@create_rate_limit_decorator('feedback_submission')
async def update_feedback(
    request: Request,
    feedback_id: UUID,
    payload: FeedbackUpdate,
    current_user: TokenData = Depends(get_current_token_data),
    db: AsyncSession = Depends(get_db),
) -> FeedbackResponsePayload:
    sanitized_data = InputSanitizer.sanitize_feedback_data(
        payload.model_dump(exclude_unset=True)
    )

    sanitized_payload = FeedbackUpdate(**sanitized_data)

    result = await feedback_service.update_feedback(db, feedback_id, sanitized_payload)
    if not result:
        raise HTTPException(status_code=404, detail='Feedback not found')
    return result


@feedback_router.delete('/{feedback_id}', status_code=status.HTTP_204_NO_CONTENT)
@create_rate_limit_decorator('feedback_submission', is_anonymous=True)
async def delete_feedback(
    request: Request, feedback_id: UUID, db: AsyncSession = Depends(get_db)
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
@create_rate_limit_decorator('feedback_submission', is_anonymous=True)
async def add_comment(
    request: Request,
    feedback_id: UUID,
    comment_data: FeedbackCommentCreate,
    current_user: TokenData = Depends(get_current_token_data),
    db: AsyncSession = Depends(get_db),
) -> FeedbackCommentResponse:
    sanitized_comment_text = InputSanitizer.sanitize_text(
        comment_data.comment_text, InputSanitizer.MAX_LENGTHS['comment']
    )

    if not sanitized_comment_text:
        raise HTTPException(
            status_code=400, detail='Comment text is required and cannot be empty'
        )

    comment = await feedback_service.add_comment(
        db, feedback_id, UUID(current_user.user_id), sanitized_comment_text
    )
    return FeedbackCommentResponse.model_validate(comment)


@feedback_router.get(
    '/{feedback_id}/comments', response_model=List[FeedbackCommentResponse]
)
@create_rate_limit_decorator('general_public', is_anonymous=True)
async def get_comments(
    request: Request,
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
@create_rate_limit_decorator('voting', is_anonymous=True)
async def upvote_feedback(
    request: Request,
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
@create_rate_limit_decorator('feedback_submission', is_anonymous=True)
async def convert_feedback_to_roadmap_item(
    request: Request,
    feedback_id: UUID,
    conversion_data: FeedbackConversionRequest,
    current_user: TokenData = Depends(get_current_token_data),
    db: AsyncSession = Depends(get_db),
    action_service=Depends(get_action_item_service),
) -> Dict[str, Any]:
    try:
        sanitized_priority = InputSanitizer.sanitize_priority(conversion_data.priority)
        sanitized_notes = InputSanitizer.sanitize_text(
            conversion_data.conversion_notes, InputSanitizer.MAX_LENGTHS['message']
        )
        sanitized_tags = []
        if conversion_data.custom_tags:
            for tag in conversion_data.custom_tags:
                sanitized_tag = InputSanitizer.sanitize_text(tag, 50)
                if sanitized_tag:
                    sanitized_tags.append(sanitized_tag)

        roadmap_item = await action_service.convert_feedback_to_roadmap_item(
            db,
            feedback_id,
            UUID(current_user.user_id),
            sanitized_priority,
            sanitized_notes,
            sanitized_tags,
            conversion_data.column_id,
        )
        return {
            'message': 'Feedback successfully converted to roadmap item',
            'roadmap_item_id': str(roadmap_item.id),
            'feedback_id': str(feedback_id),
        }
    except (NotFoundError, ValidationError) as e:
        raise HTTPException(status_code=400, detail=str(e))


@feedback_router.post(
    '/bulk-convert',
    response_model=Dict[str, Any],
    status_code=status.HTTP_201_CREATED,
)
@create_rate_limit_decorator('feedback_submission', is_anonymous=True)
async def bulk_convert_feedback_to_roadmap_items(
    request: Request,
    bulk_request: BulkFeedbackConversionRequest,
    current_user: TokenData = Depends(get_current_token_data),
    db: AsyncSession = Depends(get_db),
    bulk_service=Depends(get_bulk_conversion_service),
) -> Dict[str, Any]:
    try:
        return await bulk_service.process_bulk_conversion(
            bulk_request, current_user.user_id, db
        )
    except ValidationError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f'Bulk conversion error: {str(e)}')
        raise HTTPException(
            status_code=500, detail='Internal server error during bulk conversion'
        )
