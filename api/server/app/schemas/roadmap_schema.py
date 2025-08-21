from uuid import UUID
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime


class RoadmapTagBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=50)
    color: str = Field('#6B7280', pattern=r'^#[0-9a-fA-F]{6}$')


class RoadmapTagCreate(RoadmapTagBase):
    roadmap_id: UUID


class RoadmapTagUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=50)
    color: Optional[str] = Field(None, pattern=r'^#[0-9a-fA-F]{6}$')


class RoadmapTagRead(RoadmapTagBase):
    id: UUID
    roadmap_id: UUID
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class RoadmapFeatureBase(BaseModel):
    title: str = Field(..., min_length=3, max_length=255)
    description: Optional[str] = None
    feedback_id: Optional[UUID] = None
    submitter_name: Optional[str] = None
    submitter_email: Optional[str] = None


class RoadmapFeatureCreate(RoadmapFeatureBase):
    column_id: UUID
    tag_ids: Optional[List[UUID]] = []


class RoadmapFeatureUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=3, max_length=255)
    description: Optional[str] = None
    column_id: Optional[UUID] = None
    order: Optional[int] = None
    tag_ids: Optional[List[UUID]] = None
    submitter_name: Optional[str] = None
    submitter_email: Optional[str] = None


class RoadmapFeatureRead(RoadmapFeatureBase):
    id: UUID
    column_id: UUID
    order: int
    vote_count: int
    tags: List[RoadmapTagRead] = []
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class RoadmapColumnBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    color: str = Field('#FFFFFF', pattern=r'^#[0-9a-fA-F]{6}$')
    status: str = Field('new', min_length=1, max_length=50)


class RoadmapColumnCreate(RoadmapColumnBase):
    roadmap_id: UUID
    order: int


class RoadmapColumnUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    color: Optional[str] = Field(None, pattern=r'^#[0-9a-fA-F]{6}$')
    status: Optional[str] = Field(None, min_length=1, max_length=50)
    order: Optional[int] = None


class RoadmapColumnRead(RoadmapColumnBase):
    id: UUID
    roadmap_id: UUID
    order: int
    features: List[RoadmapFeatureRead] = []

    class Config:
        from_attributes = True


class RoadmapBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    is_public: bool = False
    subdomain: Optional[str] = Field(
        None, min_length=1, max_length=100, pattern=r'^[a-z0-9\-]+$'
    )
    logo_url: Optional[str] = None


class RoadmapCreate(RoadmapBase):
    project_id: UUID


class RoadmapUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    is_public: Optional[bool] = None
    subdomain: Optional[str] = Field(
        None, min_length=1, max_length=100, pattern=r'^[a-z0-9\-]+$'
    )
    logo_url: Optional[str] = None


class RoadmapRead(RoadmapBase):
    id: UUID
    project_id: UUID
    public_slug: str
    columns: List[RoadmapColumnRead] = []
    tags: List[RoadmapTagRead] = []
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class RoadmapAssignmentCreate(BaseModel):
    roadmap_feature_id: UUID
    user_id: UUID
    role: str = Field(default='contributor', max_length=50)
    assigned_by: Optional[UUID] = None


class RoadmapAssignmentUpdate(BaseModel):
    role: Optional[str] = Field(None, max_length=50)


class RoadmapAssignmentResponse(BaseModel):
    id: UUID
    roadmap_feature_id: UUID
    user_id: UUID
    role: str
    assigned_by: Optional[UUID] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class RoadmapFeatureTagCreate(BaseModel):
    feature_id: UUID
    tag_id: UUID


class RoadmapFeatureTagResponse(BaseModel):
    feature_id: UUID
    tag_id: UUID
    created_at: datetime

    class Config:
        from_attributes = True


class RoadmapVoteCreate(BaseModel):
    feature_id: UUID


class RoadmapVoteResponse(BaseModel):
    id: UUID
    feature_id: UUID
    user_id: Optional[UUID] = None
    created_at: datetime

    class Config:
        from_attributes = True
