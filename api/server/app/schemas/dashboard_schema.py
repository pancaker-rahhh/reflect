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

    overall_rating: Optional[int] = None
    is_published: Optional[bool] = None

    severity_level: Optional[str] = None
    steps_to_reproduce: Optional[str] = None
    expected_behavior: Optional[str] = None
    actual_behavior: Optional[str] = None

    use_case: Optional[str] = None
    suggested_solution: Optional[str] = None
    benefits: Optional[str] = None
    implementation_status: Optional[str] = None
