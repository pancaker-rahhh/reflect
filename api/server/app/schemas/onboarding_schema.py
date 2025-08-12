from typing import Optional, Literal
from datetime import datetime
from pydantic import BaseModel, Field
import uuid


class OnboardingStepUpdate(BaseModel):
    step: str = Field(..., description="Current onboarding step")
    completed: bool = Field(default=False, description="Whether step is completed")
    metadata: Optional[dict] = Field(default=None, description="Additional step metadata")


class OnboardingStartRequest(BaseModel):
    user_type: Literal["solo", "team"] = Field(..., description="Type of user account")
    referral_source: Optional[str] = Field(default=None, description="How user found the product")


class OnboardingStartResponse(BaseModel):
    user_id: uuid.UUID
    onboarding_id: uuid.UUID
    current_step: str
    user_type: str
    is_completed: bool
    created_at: datetime
    updated_at: datetime


class OnboardingStatusResponse(BaseModel):
    user_id: uuid.UUID
    onboarding_completed: bool
    user_type: Optional[str]
    current_step: Optional[str]
    has_created_project: bool
    has_created_organization: bool
    completion_percentage: int
    steps_completed: dict
    created_at: Optional[datetime]
    updated_at: Optional[datetime]


class OnboardingUpdateRequest(BaseModel):
    current_step: Optional[str] = Field(default=None, description="Current step in onboarding")
    steps_completed: Optional[dict] = Field(default=None, description="Completed steps tracking")
    has_created_project: Optional[bool] = None
    has_created_organization: Optional[bool] = None
    company_size: Optional[str] = None
    use_case: Optional[str] = None
    metadata: Optional[dict] = None


class OnboardingCompleteRequest(BaseModel):
    feedback: Optional[str] = Field(default=None, description="User feedback about onboarding")
    skipped_steps: Optional[list] = Field(default=None, description="List of skipped steps")


class OnboardingCompleteResponse(BaseModel):
    success: bool
    message: str
    user_id: uuid.UUID
    completed_at: datetime
    total_duration_minutes: Optional[float]


class OnboardingSkipResponse(BaseModel):
    success: bool
    message: str
    user_id: uuid.UUID
    skipped_at: datetime