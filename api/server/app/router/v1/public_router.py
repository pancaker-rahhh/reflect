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
from typing import Optional, Dict, Any, List
from app.repositories.feedback_repository import feedback_repository
from app.core.rate_limiting import create_rate_limit_decorator
from app.core.sanitization import InputSanitizer

public_router = APIRouter()


class PublicFeedbackPayload(BaseModel):
    widgetKey: str
    response: Optional[str] = None
    rating: Optional[int] = None
    feedbackType: Optional[str] = None
    widgetType: Optional[str] = None
    title: Optional[str] = None
    message: Optional[str] = None
    overall_rating: Optional[int] = None
    pros: Optional[str] = None
    cons: Optional[str] = None
    severity: Optional[str] = None
    steps_to_reproduce: Optional[str] = None
    expected_result: Optional[str] = None
    actual_result: Optional[str] = None
    visual_proof: Optional[Dict[str, Any]] = None
    suggested_solution: Optional[str] = None
    benefits: Optional[str] = None
    use_case: Optional[str] = None
    business_value: Optional[str] = None
    effort_estimate: Optional[str] = None
    impact_score: Optional[int] = None
    score: Optional[int] = None
    comment: Optional[str] = None
    submitter_name: Optional[str] = None
    submitter_email: Optional[str] = None
    context: Optional[Dict[str, Any]] = None


@public_router.get('/widgets/{public_key}', response_model=WidgetReadPublic)
@create_rate_limit_decorator('widget_access', is_anonymous=True)
async def get_public_widget_config(
    request: Request,
    public_key: str,
    db: AsyncSession = Depends(get_db),
    service: WidgetService = Depends(lambda: widget_service),
):
    sanitized_public_key = InputSanitizer.sanitize_widget_key(public_key)
    if not sanitized_public_key:
        from fastapi import HTTPException

        raise HTTPException(status_code=400, detail='Invalid widget key')

    return await service.get_public_widget_config(db, public_key=sanitized_public_key)


@public_router.post(
    '/feedback',
    response_model=FeedbackResponsePayload,
    status_code=status.HTTP_201_CREATED,
)
# @create_rate_limit_decorator('feedback_submission', is_anonymous=True)
async def submit_public_feedback(
    request: Request,
    payload: PublicFeedbackPayload,
    db: AsyncSession = Depends(get_db),
    widget_service: WidgetService = Depends(lambda: widget_service),
):
    # Sanitize widget key
    sanitized_widget_key = InputSanitizer.sanitize_widget_key(payload.widgetKey)
    if not sanitized_widget_key:
        from fastapi import HTTPException

        raise HTTPException(status_code=400, detail='Invalid widget key')

    widget = await widget_service.get_public_widget_by_key(db, sanitized_widget_key)

    widget_type_str = payload.feedbackType or payload.widgetType
    if widget_type_str:
        try:
            widget_type = WidgetType(widget_type_str.upper())
        except ValueError:
            widget_type = widget.widget_type
    else:
        widget_type = widget.widget_type

    context = payload.context or {}
    sanitized_context = InputSanitizer.sanitize_feedback_data(context)

    # Capture user context for deduplication and analytics
    client_ip = request.client.host if request.client else None
    user_agent = request.headers.get('user-agent')
    referer = request.headers.get('referer')

    sanitized_context.update(
        {
            'ip_address': client_ip,
            'user_agent': user_agent,
            'referer': referer,
            'submission_timestamp': str(request.headers.get('date', '')),
            'browser_info': {
                'user_agent': user_agent,
                'referer': referer,
                'ip_address': client_ip,
            },
        }
    )

    feedback_data = {
        'title': payload.title,
        'message': payload.response or payload.message,
        'rating': payload.rating,
    }

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
                'rating': payload.score,  # Also set rating field for compatibility
                'comment': payload.comment,
            }
        )

    if payload.submitter_name:
        sanitized_context['submitter_name'] = InputSanitizer.sanitize_text(
            payload.submitter_name, InputSanitizer.MAX_LENGTHS['submitter_name']
        )
    if payload.submitter_email:
        sanitized_context['submitter_email'] = InputSanitizer.sanitize_email(
            payload.submitter_email
        )

    sanitized_feedback_data = InputSanitizer.sanitize_feedback_data(feedback_data)

    # Check for existing feedback from the same user context to prevent duplicates
    existing_feedback = await feedback_repository.get_existing_feedback_by_context(
        db,
        widget_id=widget.id,
        ip_address=sanitized_context.get('ip_address'),
        user_agent=sanitized_context.get('user_agent'),
        feedback_type=widget_type,
        within_hours=24,  # Check for duplicates within 24 hours
    )

    if existing_feedback:
        # Update existing feedback instead of creating new one
        return await feedback_service.update_feedback_from_widget(
            db=db,
            feedback_id=existing_feedback.id,
            data=sanitized_feedback_data,
            context=sanitized_context,
        )

    return await feedback_service.create_feedback_from_widget(
        db=db,
        widget_id=widget.id,
        project_id=widget.project_id,
        widget_type=widget_type,
        data=sanitized_feedback_data,
        context=sanitized_context,
    )


class FeatureRequestPublic(BaseModel):
    id: str
    title: str
    description: str
    category: str
    priority: str
    upvotes: int
    hasUserUpvoted: bool = False


class UpvoteRequest(BaseModel):
    widgetKey: str
    featureId: str


@public_router.get(
    '/widgets/{public_key}/features', response_model=List[FeatureRequestPublic]
)
@create_rate_limit_decorator('widget_access', is_anonymous=True)
async def get_widget_feature_requests(
    request: Request,
    public_key: str,
    db: AsyncSession = Depends(get_db),
    widget_service: WidgetService = Depends(lambda: widget_service),
):
    from app.services.voting_service import voting_service

    sanitized_public_key = InputSanitizer.sanitize_widget_key(public_key)
    if not sanitized_public_key:
        from fastapi import HTTPException

        raise HTTPException(status_code=400, detail='Invalid widget key')

    widget = await widget_service.get_public_widget_by_key(db, sanitized_public_key)
    features = await feedback_repository.get_by_widget_and_type(
        db, widget_id=widget.id, feedback_type=FeedbackType.FEATURE_REQUEST
    )

    voter_ip = request.client.host if request.client else '127.0.0.1'
    voter_user_agent = request.headers.get('user-agent', '')

    feature_requests = []
    for feature in features:
        context = feature.context or {}

        has_user_voted = await voting_service.get_user_vote_status(
            db, feature.id, voter_ip, voter_user_agent
        )

        feature_requests.append(
            FeatureRequestPublic(
                id=str(feature.id),
                title=InputSanitizer.sanitize_text(
                    feature.title, InputSanitizer.MAX_LENGTHS['title']
                )
                or 'Untitled Feature',
                description=InputSanitizer.sanitize_text(
                    feature.message, InputSanitizer.MAX_LENGTHS['message']
                )
                or '',
                category=InputSanitizer.sanitize_category(
                    context.get('category', 'other')
                ),
                priority=InputSanitizer.sanitize_priority(
                    context.get('priority', 'medium')
                ),
                upvotes=feature.feedback_votes or 0,
                hasUserUpvoted=has_user_voted,
            )
        )

    feature_requests.sort(key=lambda x: x.upvotes, reverse=True)
    return feature_requests


@public_router.post('/features/upvote')
@create_rate_limit_decorator('voting', is_anonymous=True)
async def upvote_feature_request(
    request: Request,
    payload: UpvoteRequest,
    db: AsyncSession = Depends(get_db),
    widget_service: WidgetService = Depends(lambda: widget_service),
):
    from app.services.voting_service import voting_service

    sanitized_widget_key = InputSanitizer.sanitize_widget_key(payload.widgetKey)
    if not sanitized_widget_key:
        from fastapi import HTTPException

        raise HTTPException(status_code=400, detail='Invalid widget key')

    try:
        from uuid import UUID

        feature_id = UUID(payload.featureId)
    except ValueError:
        from fastapi import HTTPException

        raise HTTPException(status_code=400, detail='Invalid feature ID format')

    widget = await widget_service.get_public_widget_by_key(db, sanitized_widget_key)
    feature = await feedback_repository.get(db, feature_id)

    if not feature or feature.widget_id != widget.id:
        from fastapi import HTTPException

        raise HTTPException(status_code=404, detail='Feature request not found')

    voter_ip = request.client.host if request.client else '127.0.0.1'
    voter_user_agent = request.headers.get('user-agent', '')

    vote_result = await voting_service.vote_for_feature(
        db, feature.id, voter_ip, voter_user_agent
    )

    return {
        'success': True,
        'newVoteCount': vote_result['newVoteCount'],
        'hasUserVoted': vote_result['hasUserVoted'],
        'action': vote_result['action'],
    }
