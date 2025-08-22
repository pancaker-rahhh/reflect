from fastapi import APIRouter, Depends, status, Request
from sqlalchemy.ext.asyncio import AsyncSession
from app.db import get_db
from app.schemas.widget_schema import WidgetReadPublic
from app.schemas.feedback_schema import FeedbackResponsePayload
from app.services.widget_service import widget_service, WidgetService
from app.services.feedback_service import feedback_service
from app.models.widget_model import WidgetType
from app.models.feedback_model import FeedbackType
from pydantic import BaseModel
from typing import Optional, Dict, Any, Union

public_router = APIRouter()


class PublicFeedbackPayload(BaseModel):
    widgetKey: str
    widgetType: Optional[str] = None

    # General fields
    title: Optional[str] = None
    message: Optional[str] = None
    rating: Optional[int] = None

    # Review specific fields
    overall_rating: Optional[int] = None
    pros: Optional[str] = None
    cons: Optional[str] = None

    # Bug report specific fields
    severity: Optional[str] = None
    steps_to_reproduce: Optional[str] = None
    expected_result: Optional[str] = None
    actual_result: Optional[str] = None
    visual_proof: Optional[Dict[str, Any]] = None

    # Feature request specific fields
    suggested_solution: Optional[str] = None
    benefits: Optional[str] = None
    use_case: Optional[str] = None
    business_value: Optional[str] = None
    effort_estimate: Optional[str] = None
    impact_score: Optional[int] = None

    # Survey specific fields (NPS, CSAT, CES)
    score: Optional[int] = None
    comment: Optional[str] = None

    # Additional context
    submitter_name: Optional[str] = None
    submitter_email: Optional[str] = None
    context: Optional[Dict[str, Any]] = None


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
    request: Request,
    db: AsyncSession = Depends(get_db),
    widget_service: WidgetService = Depends(lambda: widget_service),
):
    # Get widget configuration
    widget = await widget_service.get_public_widget_by_key(db, payload.widgetKey)

    # Determine widget type from payload or widget configuration
    if payload.widgetType:
        try:
            widget_type = WidgetType(payload.widgetType)
        except ValueError:
            # If invalid widget type provided, use the widget's configured type
            widget_type = widget.widget_type
    else:
        widget_type = widget.widget_type

    # Prepare context data
    context = payload.context or {}
    context.update(
        {
            'ip_address': request.client.host if request.client else None,
            'user_agent': request.headers.get('user-agent'),
            'referer': request.headers.get('referer'),
            'submission_timestamp': str(request.headers.get('date', '')),
        }
    )

    # Prepare feedback data based on widget type
    feedback_data = {
        'title': payload.title,
        'message': payload.message,
        'rating': payload.rating,
    }

    # Add type-specific data
    if widget_type == WidgetType.REVIEW:
        feedback_data.update(
            {
                'rating': payload.overall_rating or payload.rating,
                'pros': payload.pros,
                'cons': payload.cons,
            }
        )
    elif widget_type == WidgetType.BUG_REPORT:
        feedback_data.update(
            {
                'severity': payload.severity,
                'steps_to_reproduce': payload.steps_to_reproduce,
                'expected_result': payload.expected_result,
                'actual_result': payload.actual_result,
                'visual_proof': payload.visual_proof,
            }
        )
    elif widget_type == WidgetType.FEATURE_REQUEST:
        feedback_data.update(
            {
                'suggested_solution': payload.suggested_solution,
                'benefits': payload.benefits,
                'use_case': payload.use_case,
            }
        )
    elif widget_type in [WidgetType.NPS, WidgetType.CSAT, WidgetType.CES]:
        feedback_data.update(
            {
                'score': payload.score,
                'comment': payload.comment,
            }
        )

    # Add submitter information if provided
    if payload.submitter_name:
        context['submitter_name'] = payload.submitter_name
    if payload.submitter_email:
        context['submitter_email'] = payload.submitter_email

    # Create feedback using the factory method
    return await feedback_service.create_feedback_from_widget(
        db=db,
        widget_id=widget.id,
        project_id=widget.project_id,
        widget_type=widget_type,
        data=feedback_data,
        context=context,
    )
