from pydantic import BaseModel, ConfigDict, Field
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
    name: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = Field(None, max_length=1000)
    widget_type: WidgetType
    position: WidgetPosition = WidgetPosition.BOTTOM_RIGHT
    configuration: Dict[str, Any] = Field(default_factory=dict)
    theme_configuration: Dict[str, Any] = Field(default_factory=dict)
    targeting_rules: List[Dict[str, Any]] = Field(default_factory=list)

    model_config = ConfigDict(use_enum_values=True)


class WidgetCreate(WidgetBase):
    project_id: UUID


class WidgetUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = Field(None, max_length=1000)
    position: Optional[WidgetPosition] = None
    configuration: Optional[Dict[str, Any]] = None
    theme_configuration: Optional[Dict[str, Any]] = None
    targeting_rules: Optional[List[Dict[str, Any]]] = None


class WidgetRead(WidgetBase):
    id: UUID
    project_id: UUID
    status: WidgetStatus
    public_key: str
    embed_code: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class WidgetReadPublic(BaseModel):
    widget_type: str
    position: str
    configuration: dict
    theme_configuration: dict
    targeting_rules: list

    model_config = ConfigDict(from_attributes=True)

    @classmethod
    def from_widget(cls, widget) -> 'WidgetReadPublic':
        """Transform Widget model to format expected by widget client"""
        # Transform theme_configuration to match widget client expectations
        theme_config = widget.theme_configuration or {}
        transformed_theme = {
            'primary': theme_config.get(
                'primary_color', theme_config.get('primary', '#6366F1')
            ),
            'background': theme_config.get('background', '#ffffff'),
            'text': theme_config.get('text', '#1f2937'),
            'show_branding': theme_config.get('show_branding', True),
        }

        # Transform position enum to string
        position_map = {
            'BOTTOM_RIGHT': 'bottom_right',
            'BOTTOM_LEFT': 'bottom_left',
            'MID_RIGHT': 'mid_right',
            'MID_LEFT': 'mid_left',
        }
        position_str = position_map.get(str(widget.position), 'bottom_right')

        return cls(
            widget_type=str(widget.widget_type),
            position=position_str,
            configuration=widget.configuration or {},
            theme_configuration=transformed_theme,
            targeting_rules=widget.targeting_rules or [],
        )
