from typing import Optional
from pydantic import BaseModel, Field, field_validator
from datetime import datetime
from uuid import UUID
import pytz


class WorkspaceResponse(BaseModel):
    id: UUID
    name: str
    slug: str
    description: Optional[str] = None
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


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
    workspace: Optional[WorkspaceResponse] = None

    class Config:
        from_attributes = True
        json_schema_extra = {
            'example': {
                'id': '123e4567-e89b-12d3-a456-426614174000',
                'email': 'user@example.com',
                'name': 'John Doe',
                'company_name': 'Acme Corp',
                'timezone': 'America/New_York',
                'workspace': {
                    'id': '456e7890-e89b-12d3-a456-426614174111',
                    'name': 'My Workspace',
                    'slug': 'my-workspace'
                }
            }
        }


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
        json_schema_extra = {
            'example': {
                'name': 'John Doe',
                'company_name': 'Acme Corp',
                'phone': '+1234567890',
                'timezone': 'America/New_York'
            }
        }


class UserDeleteResponse(BaseModel):
    message: str = Field(default='User account has been soft deleted')
    deleted_at: datetime
    gdpr_note: str = Field(
        default='Your data will be retained for 30 days before permanent deletion'
    )

    class Config:
        json_schema_extra = {
            'example': {
                'message': 'User account has been soft deleted',
                'deleted_at': '2024-01-01T00:00:00Z',
                'gdpr_note': 'Your data will be retained for 30 days before permanent deletion'
            }
        }