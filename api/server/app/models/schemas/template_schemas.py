from pydantic import BaseModel, ConfigDict
from typing import Optional
from uuid import UUID
from app.models.schemas.user_schemas import UserInfo


class TemplateBase(BaseModel):
    name: str
    description: Optional[str] = None
    category: Optional[str] = None


class TemplateRequest(TemplateBase):
    pass


class TemplateEditRequest(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None


class TemplateResponse(TemplateBase):
    model_config = ConfigDict(from_attributes=True)
    id: UUID
    created_by: UserInfo
