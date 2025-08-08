from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from uuid import UUID
from datetime import datetime
from app.models.widget_model import WidgetType, WidgetPosition, WidgetStatus


class TargetingRule(BaseModel):
    attribute: str = Field(...)
    operator: str = Field(...)
    value: Any = Field(...)


class ThemeConfiguration(BaseModel):
    primary_color: str = Field('#6366F1')
    font_family: str = Field('Inter, sans-serif')
    border_radius: int = Field(8)
    show_branding: bool = Field(True)


class WidgetBase(BaseModel):
    name: str = Field(..., min_length=3, max_length=255)
    description: Optional[str] = Field(None, max_length=1000)
    widget_type: WidgetType
    position: WidgetPosition = WidgetPosition.BOTTOM_RIGHT


class WidgetCreate(WidgetBase):
    project_id: UUID


class WidgetUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=3, max_length=255)
    description: Optional[str] = Field(None, max_length=1000)
    position: Optional[WidgetPosition] = None
    configuration: Optional[Dict[str, Any]] = None
    theme_configuration: Optional[ThemeConfiguration] = None
    targeting_rules: Optional[List[TargetingRule]] = None


class WidgetRead(WidgetBase):
    id: UUID
    project_id: UUID
    status: WidgetStatus
    public_key: str
    embed_code: Optional[str] = None
    configuration: Dict[str, Any]
    theme_configuration: ThemeConfiguration
    targeting_rules: List[TargetingRule]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
