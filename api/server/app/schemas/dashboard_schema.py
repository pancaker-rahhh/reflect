from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class DashboardMetricsResponse(BaseModel):
    totalFeedback: int
    feedbackChange: int
    averageRating: float
    ratingChange: int
    newBugReports: int
    bugReportsChange: int
    newFeatureRequests: int
    featureRequestsChange: int
    pendingFeedbackReview: int
    feedbackConversionRate: int


class RecentActivityResponse(BaseModel):
    id: str
    type: str
    summary: str
    submittedBy: str
    timestamp: datetime
    converted_to_action_item_id: Optional[str] = None
    is_actionable: bool


class FeedbackDataResponse(BaseModel):
    id: str
    type: str
    title: Optional[str] = None
    message: Optional[str] = None
    rating: Optional[int] = None
    status: str
    created_at: datetime
    submitter_name: Optional[str] = None
    submitter_email: Optional[str] = None
    feedback_votes: int
    is_anonymous: bool
    is_actionable: bool
