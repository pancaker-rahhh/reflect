from __future__ import annotations
from typing import List, Optional, Any, Dict, Union, Annotated
from typing_extensions import Literal
from uuid import UUID
from datetime import datetime
from pydantic import BaseModel, Field, EmailStr, ConfigDict

# Removed IPv4Address, IPv6Address imports - no longer needed
from app.models.feedback_model import (
    FeedbackType,
    FeedbackPriority,
)


class FeedbackBase(BaseModel):
    widget_id: UUID = Field(...)
    project_id: UUID = Field(...)
    feedback_type: FeedbackType = Field(...)
    message: Optional[str] = None

    feedback_metadata: Dict[str, Any] = Field(default_factory=dict)
    context: Dict[str, Any] = Field(default_factory=dict)

    submitter_name: Optional[str] = None
    submitter_email: Optional[EmailStr] = None
    submitter_id: Optional[str] = None

    is_anonymous: bool = True
    is_internal: bool = False


class FeedbackCreate(FeedbackBase):
    pass


class FeedbackUpdate(BaseModel):
    # Base fields
    message: Optional[str] = None
    feedback_metadata: Optional[Dict[str, Any]] = None
    context: Optional[Dict[str, Any]] = None
    is_internal: Optional[bool] = None
    is_spam: Optional[bool] = None
    is_flagged: Optional[bool] = None

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

    # FeatureRequestFeedback fields
    upvotes_count: Optional[int] = None
    downvotes_count: Optional[int] = None

    # NPSFeedback fields
    nps_score: Optional[int] = None
    promoter_category: Optional[str] = None

    # CSATFeedback fields
    csat_score: Optional[int] = None
    satisfaction_level: Optional[str] = None

    # CESFeedback fields
    ces_score: Optional[int] = None
    ease_level: Optional[str] = None


class FeedbackResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    widget_id: UUID
    project_id: UUID
    feedback_type: FeedbackType
    message: Optional[str]
    feedback_votes: int = 0
    feedback_metadata: Dict[str, Any]
    context: Dict[str, Any]
    submitter_name: Optional[str]
    submitter_email: Optional[EmailStr]
    submitter_id: Optional[str]
    is_anonymous: bool
    is_internal: bool
    is_spam: bool
    is_flagged: bool
    converted_to_action_item_id: Optional[UUID]
    conversion_date: Optional[datetime]
    conversion_notes: Optional[str]
    is_actionable: bool
    created_at: datetime
    updated_at: datetime


# Polymorphic create payloads
class GeneralFeedbackCreate(FeedbackBase):
    feedback_type: Literal[FeedbackType.GENERAL] = FeedbackType.GENERAL


class SurveyFeedbackCreate(FeedbackBase):
    feedback_type: Literal[FeedbackType.SURVEY] = FeedbackType.SURVEY  # type: ignore[assignment]
    survey_type: Optional[str] = None
    score: Optional[int] = None
    response_data: Dict[str, Any] = Field(default_factory=dict)


class ReviewFeedbackCreate(FeedbackBase):
    feedback_type: Literal[FeedbackType.REVIEW] = FeedbackType.REVIEW  # type: ignore[assignment]
    overall_rating: Optional[int] = None


class BugReportFeedbackCreate(FeedbackBase):
    feedback_type: Literal[FeedbackType.BUG_REPORT] = FeedbackType.BUG_REPORT  # type: ignore[assignment]
    severity_level: Optional[FeedbackPriority] = None


class FeatureRequestFeedbackCreate(FeedbackBase):
    feedback_type: Literal[FeedbackType.FEATURE_REQUEST] = FeedbackType.FEATURE_REQUEST  # type: ignore[assignment]


class NPSFeedbackCreate(FeedbackBase):
    feedback_type: Literal[FeedbackType.NPS] = FeedbackType.NPS  # type: ignore[assignment]
    nps_score: int = Field(..., ge=0, le=10)
    promoter_category: Optional[str] = None


class CSATFeedbackCreate(FeedbackBase):
    feedback_type: Literal[FeedbackType.CSAT] = FeedbackType.CSAT  # type: ignore[assignment]
    csat_score: int = Field(..., ge=1, le=5)
    satisfaction_level: Optional[str] = None


class CESFeedbackCreate(FeedbackBase):
    feedback_type: Literal[FeedbackType.CES] = FeedbackType.CES  # type: ignore[assignment]
    ces_score: int = Field(..., ge=1, le=5)
    ease_level: Optional[str] = None


FeedbackCreatePayload = Annotated[
    Union[
        GeneralFeedbackCreate,
        SurveyFeedbackCreate,
        ReviewFeedbackCreate,
        BugReportFeedbackCreate,
        FeatureRequestFeedbackCreate,
        NPSFeedbackCreate,
        CSATFeedbackCreate,
        CESFeedbackCreate,
    ],
    Field(discriminator='feedback_type'),
]


# Polymorphic response payloads
class GeneralFeedbackResponse(FeedbackResponse):
    feedback_type: Literal[FeedbackType.GENERAL]


class SurveyFeedbackResponse(FeedbackResponse):
    feedback_type: Literal[FeedbackType.SURVEY] = FeedbackType.SURVEY  # type: ignore[assignment]
    survey_type: Optional[str] = None
    score: Optional[int] = None
    response_data: Dict[str, Any] = Field(default_factory=dict)


class ReviewFeedbackResponse(FeedbackResponse):
    feedback_type: Literal[FeedbackType.REVIEW] = FeedbackType.REVIEW  # type: ignore[assignment]
    overall_rating: Optional[int] = None


class BugReportFeedbackResponse(FeedbackResponse):
    feedback_type: Literal[FeedbackType.BUG_REPORT] = FeedbackType.BUG_REPORT  # type: ignore[assignment]
    severity_level: Optional[FeedbackPriority] = None


class FeatureRequestFeedbackResponse(FeedbackResponse):
    feedback_type: Literal[FeedbackType.FEATURE_REQUEST] = FeedbackType.FEATURE_REQUEST  # type: ignore[assignment]


class NPSFeedbackResponse(FeedbackResponse):
    feedback_type: Literal[FeedbackType.NPS] = FeedbackType.NPS  # type: ignore[assignment]
    nps_score: int
    promoter_category: Optional[str] = None


class CSATFeedbackResponse(FeedbackResponse):
    feedback_type: Literal[FeedbackType.CSAT] = FeedbackType.CSAT  # type: ignore[assignment]
    csat_score: int
    satisfaction_level: Optional[str] = None


class CESFeedbackResponse(FeedbackResponse):
    feedback_type: Literal[FeedbackType.CES] = FeedbackType.CES  # type: ignore[assignment]
    ces_score: int
    ease_level: Optional[str] = None


FeedbackResponsePayload = Annotated[
    Union[
        GeneralFeedbackResponse,
        SurveyFeedbackResponse,
        ReviewFeedbackResponse,
        BugReportFeedbackResponse,
        FeatureRequestFeedbackResponse,
        NPSFeedbackResponse,
        CSATFeedbackResponse,
        CESFeedbackResponse,
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

    class Config:
        from_attributes = True


class UpvoteResponse(BaseModel):
    """Response model for upvote endpoint"""

    success: bool
    feedback_votes: int
    message: Optional[str] = None

    class Config:
        from_attributes = True


class FeedbackConversionRequest(BaseModel):
    column_id: Optional[str] = None
    priority: Optional[str] = None
    conversion_notes: Optional[str] = None
    custom_tags: Optional[List[str]] = None


class BulkFeedbackConversionRequest(BaseModel):
    feedback_ids: List[str]
    column_id: Optional[str] = None
    priority: Optional[str] = None
    conversion_notes: Optional[str] = None
    custom_tags: Optional[List[str]] = None
