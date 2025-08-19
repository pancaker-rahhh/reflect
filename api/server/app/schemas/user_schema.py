from typing import Optional
from pydantic import BaseModel, Field, field_validator
from datetime import datetime
from uuid import UUID
import re


class UserProfileResponse(BaseModel):
    id: UUID
    email: str
    name: Optional[str] = None
    avatar_url: Optional[str] = None
    company_name: Optional[str] = None
    country: Optional[str] = None
    email_verified_at: Optional[datetime] = None
    last_login_at: Optional[datetime] = None
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class UserProfileUpdateRequest(BaseModel):
    name: Optional[str] = Field(None, max_length=255)
    company_name: Optional[str] = Field(None, max_length=255)
    country: Optional[str] = Field(None, max_length=2)
    avatar_url: Optional[str] = None

    @field_validator('country')
    @classmethod
    def validate_country(cls, v: Optional[str]) -> Optional[str]:
        if v:
            # Validate ISO 3166-1 alpha-2 country code (2 uppercase letters)
            if not re.match(r'^[A-Z]{2}$', v):
                raise ValueError(
                    'Country must be a valid ISO 3166-1 alpha-2 code (e.g., US, GB, CA)'
                )
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
