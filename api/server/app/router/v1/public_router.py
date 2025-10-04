from fastapi import APIRouter, Depends, status, Request
from sqlalchemy.ext.asyncio import AsyncSession
from app.db import get_db
from app.core.exceptions import HTTPException
from app.schemas.widget_schema import WidgetReadPublic
from app.schemas.feedback_schema import FeedbackResponsePayload
from app.services.widget_service import widget_service, WidgetService
from app.services.feedback_service import feedback_service
from app.services.voting_service import voting_service
from app.services.roadmap_vote_service import vote_service
from app.models.widget_model import WidgetType
from app.models.feedback_model import FeedbackType
from pydantic import BaseModel
from typing import Optional, Dict, Any, List
from app.repositories.feedback_repository import feedback_repository
from app.core.rate_limiting import create_rate_limit_decorator
from app.core.sanitization import InputSanitizer
from app.core.logging import get_logger
from uuid import UUID

logger = get_logger(__name__)
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


@public_router.get(
    '/widgets/{public_key}/feedback', response_model=List[Dict[str, Any]]
)
@create_rate_limit_decorator('widget_access', is_anonymous=True)
async def get_public_widget_feedback(
    request: Request,
    public_key: str,
    feedback_type: Optional[str] = None,
    limit: int = 50,
    offset: int = 0,
    db: AsyncSession = Depends(get_db),
    service: WidgetService = Depends(lambda: widget_service),
):
    from app.services.voting_service import voting_service

    sanitized_public_key = InputSanitizer.sanitize_widget_key(public_key)
    if not sanitized_public_key:
        raise HTTPException(status_code=400, detail='Invalid widget key')

    widget = await service.get_public_widget_by_key(db, public_key=sanitized_public_key)

    feedback_data = await feedback_repository.get_public_feedback_for_widget(
        db, widget_id=widget.id, feedback_type=feedback_type, limit=limit, offset=offset
    )

    voter_ip = request.client.host if request.client else '127.0.0.1'
    voter_user_agent = request.headers.get('user-agent', '')

    for feedback in feedback_data:
        has_user_voted = await voting_service.get_user_vote_status(
            db, feedback['id'], voter_ip, voter_user_agent
        )
        feedback['hasUserUpvoted'] = has_user_voted

    return feedback_data


@public_router.get('/widgets/{public_key}/reviews', response_model=List[Dict[str, Any]])
@create_rate_limit_decorator('widget_access', is_anonymous=True)
async def get_public_widget_reviews(
    request: Request,
    public_key: str,
    limit: int = 50,
    offset: int = 0,
    db: AsyncSession = Depends(get_db),
    service: WidgetService = Depends(lambda: widget_service),
):
    sanitized_public_key = InputSanitizer.sanitize_widget_key(public_key)
    if not sanitized_public_key:
        raise HTTPException(status_code=400, detail='Invalid widget key')

    widget = await service.get_public_widget_by_key(db, public_key=sanitized_public_key)

    review_data = await feedback_repository.get_public_reviews_for_widget(
        db, widget_id=widget.id, limit=limit, offset=offset
    )

    return review_data


@public_router.get(
    '/widgets/bug-reports/{public_key}', response_model=List[Dict[str, Any]]
)
@create_rate_limit_decorator('widget_access', is_anonymous=True)
async def get_public_widget_bug_reports(
    request: Request,
    public_key: str,
    limit: int = 50,
    offset: int = 0,
    db: AsyncSession = Depends(get_db),
    service: WidgetService = Depends(lambda: widget_service),
):
    from app.services.voting_service import voting_service

    sanitized_public_key = InputSanitizer.sanitize_widget_key(public_key)
    if not sanitized_public_key:
        raise HTTPException(status_code=400, detail='Invalid widget key')

    widget = await service.get_public_widget_by_key(db, public_key=sanitized_public_key)

    bug_data = await feedback_repository.get_public_bug_reports_for_widget(
        db, widget_id=widget.id, limit=limit, offset=offset
    )

    voter_ip = request.client.host if request.client else '127.0.0.1'
    voter_user_agent = request.headers.get('user-agent', '')

    for bug in bug_data:
        has_user_voted = await voting_service.get_user_vote_status(
            db, bug['id'], voter_ip, voter_user_agent
        )
        bug['hasUserUpvoted'] = has_user_voted

    return bug_data


@public_router.post(
    '/feedback',
    response_model=FeedbackResponsePayload,
    status_code=status.HTTP_201_CREATED,
)
@create_rate_limit_decorator('feedback_submission', is_anonymous=True)
async def submit_public_feedback(
    request: Request,
    payload: PublicFeedbackPayload,
    db: AsyncSession = Depends(get_db),
    widget_service: WidgetService = Depends(lambda: widget_service),
):
    sanitized_widget_key = InputSanitizer.sanitize_widget_key(payload.widgetKey)
    if not sanitized_widget_key:
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
        'rating': payload.rating,
    }

    user_message = payload.response or payload.message
    if user_message and user_message.strip():
        import re

        is_only_rating = re.match(
            r'^Rating:\s*\d+(/\d+)?$', user_message.strip(), re.IGNORECASE
        )

        if is_only_rating:
            logger.info(f'🔍 IGNORED auto-generated rating message: {user_message}')
        else:
            cleaned_message = re.sub(
                r'^Rating:\s*\d+(/\d+)?\s*-\s*',
                '',
                user_message.strip(),
                flags=re.IGNORECASE,
            )

            if cleaned_message:
                feedback_data['message'] = cleaned_message
                logger.info(f'🔍 SET message in feedback_data to: {cleaned_message}')
                if cleaned_message != user_message.strip():
                    logger.info(f'🔍 STRIPPED rating prefix from: {user_message}')

    if widget_type == WidgetType.REVIEW:
        review_message = payload.response or ''
        feedback_data.update(
            {
                'rating': payload.overall_rating or payload.rating,
                'pros': payload.pros,
                'cons': payload.cons,
                'response': review_message,
                'message': review_message,
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
                'rating': payload.rating,  # Use rating from frontend
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

    # Convert WidgetType to FeedbackType for database queries
    from app.models.feedback_model import FeedbackType

    feedback_type_mapping = {
        'FEEDBACK': FeedbackType.GENERAL,
        'SURVEY': FeedbackType.SURVEY,
        'REVIEW': FeedbackType.REVIEW,
        'BUG_REPORT': FeedbackType.BUG_REPORT,
        'FEATURE_REQUEST': FeedbackType.FEATURE_REQUEST,
        'NPS': FeedbackType.NPS,
        'CSAT': FeedbackType.CSAT,
        'CES': FeedbackType.CES,
    }
    feedback_type = feedback_type_mapping.get(widget_type.value, FeedbackType.GENERAL)

    # Check for existing feedback from the same user context to prevent duplicates
    # Only apply deduplication for rating-based feedback types (REVIEW, CSAT, CES, NPS)
    rating_based_types = [
        WidgetType.REVIEW,
        WidgetType.CSAT,
        WidgetType.CES,
        WidgetType.NPS,
    ]
    existing_feedback = None

    if widget_type in rating_based_types:
        logger.debug(
            f'🔍 Checking for existing {widget_type.value} feedback - IP: {client_ip}, User-Agent: {user_agent}'
        )
        logger.debug(
            f'🔍 Widget ID: {widget.id}, Widget Type: {widget_type}, Feedback Type: {feedback_type}'
        )
        logger.debug(f'🔍 Sanitized context: {sanitized_context}')
        existing_feedback = await feedback_repository.get_existing_feedback_by_context(
            db,
            widget_id=widget.id,
            context=sanitized_context,
            feedback_type=widget_type,  # Pass widget_type instead of feedback_type
            within_hours=24,  # Check for duplicates within 24 hours
        )
        logger.debug(
            f'🔍 Existing {widget_type.value} feedback found: {existing_feedback is not None}'
        )
        if existing_feedback:
            logger.debug(
                f'🔍 Existing feedback ID: {existing_feedback.id}, Created: {existing_feedback.created_at}'
            )

    try:
        if existing_feedback:
            # Update existing feedback instead of creating new one (only for rating-based types)
            logger.debug(
                f'Updating existing {widget_type.value} feedback with ID: {existing_feedback.id}'
            )
            return await feedback_service.update_feedback_from_widget(
                db=db,
                feedback_id=existing_feedback.id,
                data=sanitized_feedback_data,
                context=sanitized_context,
            )

        logger.debug(
            f'Creating new {widget_type.value} feedback for widget: {widget.id}'
        )
        logger.info(f'🔍 SANITIZED FEEDBACK DATA: {sanitized_feedback_data}')
        logger.info(f'🔍 SANITIZED CONTEXT: {sanitized_context}')

        return await feedback_service.create_feedback_from_widget(
            db=db,
            widget_id=widget.id,
            project_id=widget.project_id,
            widget_type=widget_type,
            data=sanitized_feedback_data,
            context=sanitized_context,
        )
    except ValueError as e:
        # Handle database errors and other validation errors
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        # Handle unexpected errors
        logger.error(f'Unexpected error in submit_public_feedback: {str(e)}')
        raise HTTPException(status_code=500, detail='Internal server error')


class FeatureRequestPublic(BaseModel):
    id: str
    title: str
    description: str
    category: str
    priority: str
    upvotes: int
    hasUserUpvoted: bool = False


class VoteRequest(BaseModel):
    itemId: str
    itemType: str
    widgetKey: Optional[str] = None


@public_router.get(
    '/widgets/features/{public_key}', response_model=List[FeatureRequestPublic]
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
        raise HTTPException(status_code=400, detail='Invalid widget key')

    return await service.get_public_widget_config(db, public_key=sanitized_public_key)


@public_router.post('/vote')
@create_rate_limit_decorator('voting', is_anonymous=True)
async def vote(
    request: Request,
    payload: VoteRequest,
    db: AsyncSession = Depends(get_db),
    widget_service: WidgetService = Depends(lambda: widget_service),
):
    try:
        item_id = UUID(payload.itemId)
    except ValueError:
        raise HTTPException(status_code=400, detail='Invalid item ID format')

    voter_ip = request.client.host if request.client else '127.0.0.1'
    voter_user_agent = request.headers.get('user-agent', '')

    valid_item_types = ['feature_request', 'general_feedback', 'roadmap_feature']
    if payload.itemType not in valid_item_types:
        raise HTTPException(
            status_code=400,
            detail=f'Invalid item type: {payload.itemType}. Must be one of: {", ".join(valid_item_types)}',
        )

    try:
        if payload.itemType == 'roadmap_feature':
            if not payload.widgetKey:
                raise HTTPException(
                    status_code=400, detail='Widget key required for roadmap features'
                )

            sanitized_widget_key = InputSanitizer.sanitize_widget_key(payload.widgetKey)
            if not sanitized_widget_key:
                raise HTTPException(status_code=400, detail='Invalid widget key')

            widget = await widget_service.get_public_widget_by_key(
                db, sanitized_widget_key
            )
            updated_feature = await vote_service.upvote_feature_anonymous(
                db, item_id, request
            )

            return {
                'success': True,
                'newVoteCount': updated_feature.vote_count,
                'hasUserVoted': True,
                'action': 'added',
            }

        elif payload.itemType in ['feature_request', 'general_feedback']:
            if not payload.widgetKey:
                raise HTTPException(
                    status_code=400, detail='Widget key required for feedback voting'
                )

            sanitized_widget_key = InputSanitizer.sanitize_widget_key(payload.widgetKey)
            if not sanitized_widget_key:
                raise HTTPException(status_code=400, detail='Invalid widget key')

            widget = await widget_service.get_public_widget_by_key(
                db, sanitized_widget_key
            )
            feedback = await feedback_repository.get(db, item_id)

            if not feedback or feedback.widget_id != widget.id:
                raise HTTPException(status_code=404, detail='Item not found')

            vote_result = await voting_service.vote_for_feature(
                db, item_id, voter_ip, voter_user_agent
            )

            return {
                'success': True,
                'newVoteCount': vote_result['newVoteCount'],
                'hasUserVoted': vote_result['hasUserVoted'],
                'action': vote_result['action'],
            }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f'Error in unified vote endpoint: {str(e)}')
        raise HTTPException(status_code=500, detail=f'Internal server error: {str(e)}')
