from uuid import UUID
from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import datetime
from .user_schemas import UserInfo


class ActionItemResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: UUID
    title: str
    description: Optional[str]
    category: Optional[str]
    priority: Optional[int]
    status: Optional[str]
    due_date: Optional[datetime]
    is_completed: Optional[bool]
    submission_id: UUID
    assignee: UserInfo


class ActionItemUpdateRequest(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    priority: Optional[int] = None
    status: Optional[str] = None
    due_date: Optional[datetime] = None
    is_completed: Optional[bool] = None


class GenerateActionItemsResponse(BaseModel):
    status: str
    message: str
