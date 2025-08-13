from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.db import get_db
from app.schemas.widget_schema import WidgetReadPublic
from app.schemas.feedback_schema import FeedbackResponsePayload, GeneralFeedbackCreate
from app.services.widget_service import widget_service, WidgetService
from app.services.feedback_service import feedback_service
from app.models.feedback_model import FeedbackType
from pydantic import BaseModel

public_router = APIRouter()


class PublicFeedbackPayload(BaseModel):
    widgetKey: str
    response: str
    rating: int = None
    feedbackType: str = None


@public_router.get('/widgets/{public_key}', response_model=WidgetReadPublic)
async def get_public_widget_config(
    public_key: str,
    db: AsyncSession = Depends(get_db),
    service: WidgetService = Depends(lambda: widget_service),
):
    return await service.get_public_widget_by_key(db, public_key=public_key)


@public_router.post(
    '/feedback',
    response_model=FeedbackResponsePayload,
    status_code=status.HTTP_201_CREATED,
)
async def submit_public_feedback(
    payload: PublicFeedbackPayload,
    db: AsyncSession = Depends(get_db),
    widget_service: WidgetService = Depends(lambda: widget_service),
):
    widget = await widget_service.get_public_widget_by_key(db, payload.widgetKey)

    feedback_payload = GeneralFeedbackCreate(
        widget_id=widget.id,
        project_id=widget.project_id,
        message=payload.response,
        rating=payload.rating,
        feedback_type=FeedbackType.GENERAL,
        is_anonymous=True,
    )

    return await feedback_service.create_feedback(db, feedback_payload)
