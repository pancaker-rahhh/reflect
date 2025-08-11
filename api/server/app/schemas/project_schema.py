from pydantic import BaseModel, Field, HttpUrl
from typing import Optional, List
from uuid import UUID
from datetime import datetime


class ProjectBase(BaseModel):
    name: str = Field(..., min_length=3, max_length=255)
    description: Optional[str] = Field(None, max_length=1000)
    main_website_url: Optional[str] = Field(None, max_length=2048)

    class Config:
        from_attributes = True


class ProjectCreate(ProjectBase):
    organization_id: UUID


class ProjectUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=3, max_length=255)
    description: Optional[str] = Field(None, max_length=1000)
    main_website_url: Optional[str] = Field(None, max_length=2048)


class ProjectRead(ProjectBase):
    id: UUID
    organization_id: UUID
    slug: str
    created_at: datetime
    updated_at: datetime


class PaginatedProjectRead(BaseModel):
    total: int
    page: int
    size: int
    items: List[ProjectRead]


class ProjectSettings(BaseModel):
    theme_color: Optional[str] = Field('#FFFFFF')
    custom_domain: Optional[HttpUrl] = Field(None)
    is_private: bool = Field(False)

    class Config:
        from_attributes = True


class ProjectSettingsUpdate(BaseModel):
    theme_color: Optional[str] = None
    custom_domain: Optional[HttpUrl] = None
    is_private: Optional[bool] = None
