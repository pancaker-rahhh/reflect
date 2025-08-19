from typing import TYPE_CHECKING, List, Dict, Optional
import uuid
import enum
from sqlalchemy import String, ForeignKey, Text, Integer, Enum as SQLEnum
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship, Mapped, mapped_column

from app.models.base_model import BaseModel

if TYPE_CHECKING:
    from app.models.project_model import Project
    from app.models.user_model import User


class WebhookEventType(str, enum.Enum):
    FEEDBACK_CREATED = 'feedback.created'
    FEEDBACK_UPDATED = 'feedback.updated'
    FEATURE_CREATED = 'feature.created'
    FEATURE_UPDATED = 'feature.updated'
    PROJECT_UPDATED = 'project.updated'


class WebhookStatus(str, enum.Enum):
    ACTIVE = 'active'
    INACTIVE = 'inactive'
    FAILED = 'failed'


class Webhook(BaseModel):
    __tablename__ = 'webhooks'

    project_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey('projects.id', ondelete='CASCADE'),
        nullable=False,
        index=True,
    )

    name: Mapped[str] = mapped_column(String(255), nullable=False)
    url: Mapped[str] = mapped_column(String(500), nullable=False)

    events: Mapped[List[WebhookEventType]] = mapped_column(JSONB, default=list)
    headers: Mapped[Dict[str, str]] = mapped_column(JSONB, default=dict)

    status: Mapped[WebhookStatus] = mapped_column(
        SQLEnum(WebhookStatus), default=WebhookStatus.ACTIVE
    )

    secret: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    retry_count: Mapped[int] = mapped_column(Integer, default=3)
    timeout_seconds: Mapped[int] = mapped_column(Integer, default=30)

    last_triggered_at: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    last_response_code: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    error_message: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    created_by: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey('users.id'), nullable=False
    )

    project: Mapped['Project'] = relationship('Project', back_populates='webhooks')
    creator: Mapped['User'] = relationship()
