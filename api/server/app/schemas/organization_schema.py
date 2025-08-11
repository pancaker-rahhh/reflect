from typing import Optional, List
from pydantic import BaseModel, Field, field_validator
from datetime import datetime
from uuid import UUID
from enum import Enum

from app.models.organization_model import OrganizationRole, ProjectRole


class OrganizationCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    slug: Optional[str] = Field(None, max_length=100)
    subscription_tier: str = Field(default='free')
    settings: Optional[dict] = Field(default_factory=dict)

    @field_validator('name')
    @classmethod
    def validate_name(cls, v: str) -> str:
        return v.strip()


class OrganizationUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    subscription_tier: Optional[str] = None
    settings: Optional[dict] = None

    @field_validator('name')
    @classmethod
    def validate_name(cls, v: Optional[str]) -> Optional[str]:
        return v.strip() if v else None


class OrganizationMemberResponse(BaseModel):
    id: UUID
    user_id: UUID
    role: OrganizationRole
    created_at: datetime
    user_name: Optional[str] = None
    user_email: Optional[str] = None

    class Config:
        from_attributes = True


class OrganizationResponse(BaseModel):
    id: UUID
    name: str
    slug: str
    subscription_tier: str
    settings: dict
    created_at: datetime
    updated_at: Optional[datetime] = None
    members_count: Optional[int] = None
    projects_count: Optional[int] = None

    class Config:
        from_attributes = True


class OrganizationDetailResponse(OrganizationResponse):
    members: Optional[List[OrganizationMemberResponse]] = None


class OrganizationInviteRequest(BaseModel):
    email: str = Field(..., max_length=320)
    role: OrganizationRole = Field(default=OrganizationRole.MEMBER)

    @field_validator('email')
    @classmethod
    def validate_email(cls, v: str) -> str:
        import re
        email_pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        if not re.match(email_pattern, v):
            raise ValueError('Invalid email format')
        return v.lower()


class OrganizationMemberUpdate(BaseModel):
    role: OrganizationRole

    class Config:
        use_enum_values = True


class OrganizationListResponse(BaseModel):
    organizations: List[OrganizationResponse]
    total: int
    page: int
    page_size: int
    total_pages: int

    class Config:
        from_attributes = True