from pydantic import BaseModel, Field
from typing import Optional, List
from uuid import UUID
from datetime import datetime


class RoadmapFeatureBase(BaseModel):
    title: str = Field(..., min_length=3, max_length=255)
    description: Optional[str] = None
    feedback_id: Optional[UUID] = None


class RoadmapFeatureCreate(RoadmapFeatureBase):
    column_id: UUID


class RoadmapFeatureUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=3, max_length=255)
    description: Optional[str] = None
    column_id: Optional[UUID] = None
    order: Optional[int] = None


class RoadmapFeatureRead(RoadmapFeatureBase):
    id: UUID
    column_id: UUID
    order: int
    vote_count: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class RoadmapColumnBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    color: str = Field('#FFFFFF', pattern=r'^#[0-9a-fA-F]{6}$')


class RoadmapColumnCreate(RoadmapColumnBase):
    roadmap_id: UUID


class RoadmapColumnUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    color: Optional[str] = Field(None, pattern=r'^#[0-9a-fA-F]{6}$')
    order: Optional[int] = None


class RoadmapColumnRead(RoadmapColumnBase):
    id: UUID
    roadmap_id: UUID
    order: int
    features: List[RoadmapFeatureRead]

    class Config:
        from_attributes = True


class RoadmapRead(BaseModel):
    id: UUID
    project_id: UUID
    name: str
    is_public: bool
    public_slug: str
    columns: List[RoadmapColumnRead]

    class Config:
        from_attributes = True


class RoadmapUpdate(BaseModel):
    name: Optional[str] = None
    is_public: Optional[bool] = None
