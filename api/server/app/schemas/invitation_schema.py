from typing import List, Optional, Literal
from uuid import UUID
from datetime import datetime
from pydantic import BaseModel, EmailStr, Field, validator


class InvitationEntry(BaseModel):
    """Single invitation entry"""
    email: EmailStr
    role: Literal["admin", "member", "viewer"] = "member"
    name: Optional[str] = None


class BulkInvitationRequest(BaseModel):
    """Request model for bulk invitations"""
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
    """Response model for bulk invitation request"""
    task_id: str
    total_count: int
    status: Literal["processing", "completed", "failed"]
    message: str


class InvitationResult(BaseModel):
    """Result of a single invitation"""
    email: EmailStr
    status: Literal["sent", "failed", "duplicate", "invalid"]
    error: Optional[str] = None
    invitation_id: Optional[UUID] = None


class InvitationStatusResponse(BaseModel):
    """Status response for bulk invitation task"""
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
    """Invitation database model representation"""
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
        orm_mode = True


class PendingMemberModel(BaseModel):
    """Pending member model for placeholder members"""
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
        orm_mode = True