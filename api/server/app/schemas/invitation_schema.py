from typing import List, Optional, Literal
from uuid import UUID
from datetime import datetime
from pydantic import BaseModel, EmailStr, Field, validator


class InvitationEntry(BaseModel):
    email: EmailStr
    role: Literal["admin", "member", "viewer"] = "member"
    name: Optional[str] = None


class BulkInvitationRequest(BaseModel):
    organization_id: Optional[UUID] = None
    project_id: Optional[UUID] = None
    invitations: List[InvitationEntry] = Field(..., min_items=1, max_items=100)
    send_email: bool = True
    
    @validator('invitations')
    def validate_unique_emails(cls, v):
        emails = [inv.email.lower() for inv in v]
        if len(emails) != len(set(emails)):
            raise ValueError("Duplicate email addresses found")
        return v


class BulkInvitationResponse(BaseModel):
    task_id: str
    total_count: int
    status: Literal["processing", "completed", "failed"]
    message: str


class InvitationResult(BaseModel):
    email: EmailStr
    status: Literal["sent", "failed", "duplicate", "invalid"]
    error: Optional[str] = None
    invitation_id: Optional[UUID] = None


class InvitationStatusResponse(BaseModel):
    task_id: str
    status: Literal["pending", "processing", "completed", "failed"]
    total_count: int
    processed_count: int
    success_count: int
    failed_count: int
    results: List[InvitationResult] = []
    created_at: datetime
    completed_at: Optional[datetime] = None
    error: Optional[str] = None


class InvitationModel(BaseModel):
    id: UUID
    email: EmailStr
    role: str
    organization_id: Optional[UUID]
    project_id: Optional[UUID]
    invited_by: UUID
    status: Literal["pending", "accepted", "expired", "cancelled"]
    token: str
    expires_at: datetime
    created_at: datetime
    accepted_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True


class PendingMemberModel(BaseModel):
    id: UUID
    email: EmailStr
    name: Optional[str]
    role: str
    organization_id: Optional[UUID]
    project_id: Optional[UUID]
    invitation_id: UUID
    added_by: UUID
    created_at: datetime
    
    class Config:
        from_attributes = True


class InvitationValidateResponse(BaseModel):
    invitation_id: UUID
    email: EmailStr
    organization_name: Optional[str]
    project_name: Optional[str]
    role: str
    inviter_name: str
    expires_at: datetime
    is_expired: bool
    user_exists: bool


class NewUserData(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    password: str = Field(..., min_length=8)
    phone: Optional[str] = None
    avatar_url: Optional[str] = None


class InvitationAcceptRequest(BaseModel):
    token: str
    user_data: Optional[NewUserData] = None  # Only for new users


class InvitationAcceptResponse(BaseModel):
    success: bool
    message: str
    user_id: UUID
    organization_id: Optional[UUID]
    project_id: Optional[UUID]
    role: str
    access_token: Optional[str] = None  # For new users
    redirect_url: str