from sqlalchemy import Column, String, Boolean, Text, ForeignKey, Enum as SQLEnum
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
from uuid import uuid4
import enum

from app.models.base_model import BaseModel


class WidgetType(str, enum.Enum):
    FEEDBACK = 'feedback'
    SURVEY = 'survey'
    REVIEW = 'review'
    BUG_REPORT = 'bug_report'
    FEATURE_REQUEST = 'feature_request'
    NPS = 'nps'
    CSAT = 'csat'
    CES = 'ces'


class WidgetPosition(str, enum.Enum):
    BOTTOM_RIGHT = 'bottom_right'
    BOTTOM_LEFT = 'bottom_left'
    TOP_RIGHT = 'top_right'
    TOP_LEFT = 'top_left'
    CENTER = 'center'


class WidgetStatus(str, enum.Enum):
    DRAFT = 'draft'
    ACTIVE = 'active'
    INACTIVE = 'inactive'
    ARCHIVED = 'archived'


class Widget(BaseModel):
    __tablename__ = 'widgets'

    project_id = Column(UUID(as_uuid=True), ForeignKey('projects.id'), nullable=False)

    name = Column(String(255), nullable=False)
    description = Column(Text)
    widget_type = Column(SQLEnum(WidgetType), nullable=False)
    status = Column(SQLEnum(WidgetStatus), default=WidgetStatus.DRAFT)

    configuration = Column(JSONB, default=dict)
    theme_configuration = Column(JSONB, default=dict)
    targeting_rules = Column(JSONB, default=list)

    embed_code = Column(Text)
    public_key = Column(String(255), unique=True, index=True)

    position = Column(SQLEnum(WidgetPosition), default=WidgetPosition.BOTTOM_RIGHT)
    is_active = Column(Boolean, default=False)

    project = relationship('Project', back_populates='widgets')
    feedback = relationship('Feedback', back_populates='widget')

    def __init__(self, **kwargs):
        if 'public_key' not in kwargs or not kwargs.get('public_key'):
            kwargs['public_key'] = f'widget_{str(uuid4()).replace("-", "")[:16]}'
        super().__init__(**kwargs)
