from typing import Optional
from pydantic import BaseModel, Field, field_validator
from datetime import datetime
from uuid import UUID
import pytz


class UserProfileResponse(BaseModel):
    id: UUID
    email: str
    name: Optional[str] = None
    avatar_url: Optional[str] = None
    company_name: Optional[str] = None
    phone: Optional[str] = None
    timezone: str = Field(default='UTC')
    email_verified_at: Optional[datetime] = None
    last_login_at: Optional[datetime] = None
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class UserProfileUpdateRequest(BaseModel):
    name: Optional[str] = Field(None, max_length=255)
    company_name: Optional[str] = Field(None, max_length=255)
    phone: Optional[str] = Field(None, max_length=50)
    timezone: Optional[str] = Field(None)
    avatar_url: Optional[str] = None

    @field_validator('timezone')
    @classmethod
    def validate_timezone(cls, v: Optional[str]) -> Optional[str]:
        if v and v not in pytz.all_timezones:
            raise ValueError(f'Invalid timezone: {v}')
        return v

    class Config:
        pass


class UserDeleteResponse(BaseModel):
    message: str = Field(default='User account has been soft deleted')
    deleted_at: datetime
    gdpr_note: str = Field(
        default='Your data will be retained for 30 days before permanent deletion'
    )

    class Config:
        pass
