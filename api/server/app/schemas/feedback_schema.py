from __future__ import annotations
from typing import Optional, Any, Dict, Union, Annotated
from typing_extensions import Literal
from uuid import UUID
from pydantic import BaseModel, Field, EmailStr
from app.models.feedback_model import (
    FeedbackType,
    FeedbackStatus,
    FeedbackPriority,
)


class FeedbackBase(BaseModel):
    widget_id: UUID = Field(...)
    project_id: UUID = Field(...)
    feedback_type: FeedbackType = Field(...)
    title: Optional[str] = None
    message: Optional[str] = None
    rating: Optional[int] = None

    feedback_metadata: Dict[str, Any] = Field(default_factory=dict)
    context: Dict[str, Any] = Field(default_factory=dict)

    submitter_name: Optional[str] = None
    submitter_email: Optional[EmailStr] = None
    submitter_id: Optional[str] = None

    ip_address: Optional[str] = None
    user_agent: Optional[str] = None
    browser_info: Dict[str, Any] = Field(default_factory=dict)

    is_anonymous: bool = True
    is_internal: bool = False


class FeedbackCreate(FeedbackBase):
    pass


class FeedbackUpdate(BaseModel):
    # Base fields
    status: Optional[FeedbackStatus] = None
    priority: Optional[FeedbackPriority] = None
    title: Optional[str] = None
    message: Optional[str] = None
    rating: Optional[int] = None
    feedback_metadata: Optional[Dict[str, Any]] = None
    context: Optional[Dict[str, Any]] = None
    is_internal: Optional[bool] = None
    is_spam: Optional[bool] = None
    is_flagged: Optional[bool] = None
    assigned_to_user_id: Optional[UUID] = None
    resolution_notes: Optional[str] = None

    # SurveyFeedback fields
    survey_type: Optional[str] = None
    score: Optional[int] = None
    response_data: Optional[Dict[str, Any]] = None

    # ReviewFeedback fields
    overall_rating: Optional[int] = None
    review_categories: Optional[Dict[str, Any]] = None
    is_published: Optional[bool] = None
    moderation_status: Optional[str] = None
    reviewer_location: Optional[str] = None

    # BugReportFeedback fields
    severity_level: Optional[str] = None
    steps_to_reproduce: Optional[str] = None
    expected_behavior: Optional[str] = None
    actual_behavior: Optional[str] = None
    environment_info: Optional[Dict[str, Any]] = None
    attachments: Optional[list] = None

    # FeatureRequestFeedback fields
    use_case: Optional[str] = None
    business_value: Optional[str] = None
    upvotes_count: Optional[int] = None
    downvotes_count: Optional[int] = None
    estimated_effort: Optional[str] = None
    implementation_status: Optional[str] = None
    roadmap_position: Optional[int] = None


class FeedbackResponse(BaseModel):
    id: UUID
    widget_id: UUID
    project_id: UUID
    feedback_type: FeedbackType
    status: FeedbackStatus
    priority: FeedbackPriority
    title: Optional[str]
    message: Optional[str]
    rating: Optional[int]
    feedback_metadata: Dict[str, Any]
    context: Dict[str, Any]
    submitter_name: Optional[str]
    submitter_email: Optional[EmailStr]
    submitter_id: Optional[str]
    is_anonymous: bool
    is_internal: bool
    is_spam: bool
    is_flagged: bool
    assigned_to_user_id: Optional[UUID]
    resolution_notes: Optional[str]

    class Config:
        from_attributes = True


# Polymorphic create payloads
class SurveyFeedbackCreate(FeedbackBase):
    feedback_type: Literal[FeedbackType.SURVEY] = FeedbackType.SURVEY  # type: ignore[assignment]
    survey_type: Optional[str] = None
    score: Optional[int] = None
    response_data: Dict[str, Any] = Field(default_factory=dict)


class ReviewFeedbackCreate(FeedbackBase):
    feedback_type: Literal[FeedbackType.REVIEW] = FeedbackType.REVIEW  # type: ignore[assignment]
    overall_rating: Optional[int] = None
    pros: Optional[str] = None
    cons: Optional[str] = None
    is_published: bool = False


class BugReportFeedbackCreate(FeedbackBase):
    feedback_type: Literal[FeedbackType.BUG_REPORT] = FeedbackType.BUG_REPORT  # type: ignore[assignment]
    severity_level: Optional[str] = None
    steps_to_reproduce: Optional[str] = None
    expected_behavior: Optional[str] = None
    actual_behavior: Optional[str] = None
    environment_info: Dict[str, Any] = Field(default_factory=dict)


class FeatureRequestFeedbackCreate(FeedbackBase):
    feedback_type: Literal[FeedbackType.FEATURE_REQUEST] = FeedbackType.FEATURE_REQUEST  # type: ignore[assignment]
    use_case: Optional[str] = None
    business_value: Optional[str] = None
    effort_estimate: Optional[str] = None
    impact_score: Optional[int] = None
    implementation_status: str = 'backlog'


FeedbackCreatePayload = Annotated[
    Union[
        SurveyFeedbackCreate,
        ReviewFeedbackCreate,
        BugReportFeedbackCreate,
        FeatureRequestFeedbackCreate,
    ],
    Field(discriminator='feedback_type'),
]


# Polymorphic response payloads
class SurveyFeedbackResponse(FeedbackResponse):
    feedback_type: Literal[FeedbackType.SURVEY] = FeedbackType.SURVEY  # type: ignore[assignment]


class ReviewFeedbackResponse(FeedbackResponse):
    feedback_type: Literal[FeedbackType.REVIEW] = FeedbackType.REVIEW  # type: ignore[assignment]
    overall_rating: Optional[int] = None
    pros: Optional[str] = None
    cons: Optional[str] = None
    is_published: bool = False


class BugReportFeedbackResponse(FeedbackResponse):
    feedback_type: Literal[FeedbackType.BUG_REPORT] = FeedbackType.BUG_REPORT  # type: ignore[assignment]
    severity_level: Optional[str] = None
    steps_to_reproduce: Optional[str] = None
    expected_behavior: Optional[str] = None
    actual_behavior: Optional[str] = None
    environment_info: Dict[str, Any] = Field(default_factory=dict)


class FeatureRequestFeedbackResponse(FeedbackResponse):
    feedback_type: Literal[FeedbackType.FEATURE_REQUEST] = FeedbackType.FEATURE_REQUEST  # type: ignore[assignment]
    use_case: Optional[str] = None
    business_value: Optional[str] = None
    effort_estimate: Optional[str] = None
    impact_score: Optional[int] = None
    implementation_status: str = 'backlog'


FeedbackResponsePayload = Annotated[
    Union[
        SurveyFeedbackResponse,
        ReviewFeedbackResponse,
        BugReportFeedbackResponse,
        FeatureRequestFeedbackResponse,
    ],
    Field(discriminator='feedback_type'),
]


class FeedbackCommentCreate(BaseModel):
    comment_text: str = Field(..., min_length=1, max_length=2000)


class FeedbackCommentResponse(BaseModel):
    id: UUID
    feedback_id: UUID
    user_id: UUID
    comment_text: str
    created_at: str
    updated_at: Optional[str] = None

    class Config:
        from_attributes = True


class FeedbackVoteCreate(BaseModel):
    vote_type: Literal['up', 'down'] = Field(...)


class FeedbackVoteResponse(BaseModel):
    id: UUID
    feedback_id: UUID
    user_id: Optional[UUID] = None
    session_id: Optional[str] = None
    vote_type: str
    created_at: str

    class Config:
        from_attributes = True


class FeedbackVoteCounts(BaseModel):
    upvotes: int
    downvotes: int
    total: int
