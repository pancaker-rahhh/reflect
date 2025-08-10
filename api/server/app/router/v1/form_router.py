from typing import List, Optional
from uuid import UUID

from fastapi import APIRouter, Depends, Query, status
from app.db import get_db
from sqlalchemy.ext.asyncio import AsyncSession

from app.schemas.form_schema import (
    FeedbackFormCreate,
    FeedbackFormUpdate,
    FeedbackFormResponse,
)
from app.services.form_service import feedback_form_service
from app.core.exceptions import NotFoundError


form_router = APIRouter(prefix='/forms', tags=['forms'])


@form_router.post(
    '', response_model=FeedbackFormResponse, status_code=status.HTTP_201_CREATED
)
async def create_form(
    payload: FeedbackFormCreate, db: AsyncSession = Depends(get_db)
) -> FeedbackFormResponse:
    return await feedback_form_service.create_form(db, payload)


@form_router.get('/{form_id}', response_model=FeedbackFormResponse)
async def get_form(
    form_id: UUID, db: AsyncSession = Depends(get_db)
) -> FeedbackFormResponse:
    result = await feedback_form_service.get_form(db, form_id)
    if not result:
        raise NotFoundError(detail='Form not found')
    return result


@form_router.get('', response_model=List[FeedbackFormResponse])
async def list_forms(
    project_id: Optional[UUID] = Query(default=None),
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=100, ge=1, le=1000),
    db: AsyncSession = Depends(get_db),
) -> List[FeedbackFormResponse]:
    return await feedback_form_service.list_forms(
        db, project_id=project_id, skip=skip, limit=limit
    )


@form_router.patch('/{form_id}', response_model=FeedbackFormResponse)
async def update_form(
    form_id: UUID, payload: FeedbackFormUpdate, db: AsyncSession = Depends(get_db)
) -> FeedbackFormResponse:
    result = await feedback_form_service.update_form(db, form_id, payload)
    if not result:
        raise NotFoundError(detail='Form not found')
    return result


@form_router.delete('/{form_id}', status_code=status.HTTP_204_NO_CONTENT)
async def delete_form(form_id: UUID, db: AsyncSession = Depends(get_db)) -> None:
    deleted = await feedback_form_service.delete_form(db, form_id)
    if not deleted:
        raise NotFoundError(detail='Form not found')
    return None
