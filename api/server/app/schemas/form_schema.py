from __future__ import annotations

from typing import Optional, Any, Dict
from uuid import UUID
from pydantic import BaseModel, Field


class FeedbackFormBase(BaseModel):
    project_id: UUID
    name: str
    description: Optional[str] = None
    is_active: bool = True
    config: Dict[str, Any] = Field(default_factory=dict)


class FeedbackFormCreate(FeedbackFormBase):
    pass


class FeedbackFormUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    is_active: Optional[bool] = None
    config: Optional[Dict[str, Any]] = None


class FeedbackFormResponse(BaseModel):
    id: UUID
    project_id: UUID
    name: str
    description: Optional[str]
    is_active: bool
    config: Dict[str, Any]

    class Config:
        from_attributes = True
