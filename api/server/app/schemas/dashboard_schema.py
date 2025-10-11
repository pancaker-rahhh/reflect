from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class DashboardMetricsResponse(BaseModel):
    totalFeedback: int
    averageRating: float
    newBugReports: int
    newFeatureRequests: int
    pendingFeedbackReview: int


class RecentActivityResponse(BaseModel):
    id: str
    type: str
    summary: str
    submittedBy: str
    timestamp: datetime
    converted_to_action_item_id: Optional[str] = None
    is_actionable: bool
    widget_name: Optional[str] = None
    rating: Optional[int] = None


class FeedbackDataResponse(BaseModel):
    id: str
    type: str
    feedback_type: str
    title: Optional[str] = None
    message: Optional[str] = None
    rating: Optional[int] = None
    created_at: datetime
    submitter_name: Optional[str] = None
    submitter_email: Optional[str] = None
    feedback_votes: int
    is_anonymous: bool
    is_actionable: bool
    widget_name: Optional[str] = None

    overall_rating: Optional[int] = None

    severity_level: Optional[str] = None

    nps_score: Optional[int] = None
    csat_score: Optional[int] = None
    ces_score: Optional[int] = None
