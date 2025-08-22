from typing import List, Optional
from uuid import UUID
from fastapi import APIRouter, Depends, BackgroundTasks, Query, status
from app.db import get_db
from app.core.auth import get_current_token_data
from sqlalchemy.ext.asyncio import AsyncSession
from app.schemas.feedback_schema import (
    FeedbackUpdate,
    FeedbackResponsePayload,
    FeedbackCreatePayload,
    FeedbackCommentCreate,
    FeedbackCommentResponse,
)
from fastapi import HTTPException
from app.schemas.auth_schema import TokenData
from app.services.feedback_service import feedback_service
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


@feedback_router.get('/{feedback_id}', response_model=FeedbackResponsePayload)
async def get_feedback(
    feedback_id: UUID, db: AsyncSession = Depends(get_db)
) -> FeedbackResponsePayload:
    result = await feedback_service.get_feedback(db, feedback_id)
    if not result:
        raise HTTPException(status_code=404, detail='Feedback not found')
    return result


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


# Simple upvote endpoint
@feedback_router.post(
    '/{feedback_id}/upvote',
    status_code=status.HTTP_200_OK,
)
async def upvote_feedback(
    feedback_id: UUID,
    current_user: TokenData = Depends(get_current_token_data),
    db: AsyncSession = Depends(get_db),
) -> dict:
    """Simple upvote - increments the feedback_votes counter"""
    success = await feedback_service.upvote_feedback(db, feedback_id)
    if success:
        # Get the updated feedback to return the new vote count
        feedback = await feedback_service.get_feedback(db, feedback_id)
        return {
            'success': True,
            'feedback_votes': feedback.feedback_votes if feedback else 0,
        }
    return {'success': False}


@feedback_router.post(
    '/{feedback_id}/upvote',
    status_code=status.HTTP_200_OK,
)
async def upvote_feedback(
    feedback_id: UUID,
    current_user: TokenData = Depends(get_current_token_data),
    db: AsyncSession = Depends(get_db),
) -> dict:
    """Simple upvote - increments the feedback_votes counter"""
    success = await feedback_service.upvote_feedback(db, feedback_id)
    if success:
        # Get the updated feedback to return the new vote count
        feedback = await feedback_service.get_feedback(db, feedback_id)
        return {
            'success': True,
            'feedback_votes': feedback.feedback_votes if feedback else 0,
        }
    return {'success': False}
