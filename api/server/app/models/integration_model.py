from typing import List, Optional, TYPE_CHECKING, Dict, Any
from datetime import datetime
import uuid
import enum
from sqlalchemy import String, Boolean, ForeignKey, DateTime, Text, Enum as SQLEnum
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship, Mapped, mapped_column

from app.models.base_model import BaseModel

if TYPE_CHECKING:
    from app.models.project_model import Project
    from app.models.user_model import User


class IntegrationType(str, enum.Enum):
    JIRA = 'jira'
    GITHUB = 'github'
    LINEAR = 'linear'
    SLACK = 'slack'
    DISCORD = 'discord'
    WEBHOOK = 'webhook'


class IntegrationStatus(str, enum.Enum):
    ACTIVE = 'active'
    INACTIVE = 'inactive'
    ERROR = 'error'
    PENDING = 'pending'


class MappingType(str, enum.Enum):
    FEEDBACK_TO_ISSUE = 'feedback_to_issue'
    FEATURE_TO_EPIC = 'feature_to_epic'
    PROJECT_TO_PROJECT = 'project_to_project'


class Integration(BaseModel):
    __tablename__ = 'integrations'

    project_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey('projects.id', ondelete='CASCADE'),
        nullable=False,
        index=True,
    )

    name: Mapped[str] = mapped_column(String(255), nullable=False)
    integration_type: Mapped[IntegrationType] = mapped_column(
        SQLEnum(IntegrationType), nullable=False
    )
    status: Mapped[IntegrationStatus] = mapped_column(
        SQLEnum(IntegrationStatus), default=IntegrationStatus.PENDING
    )
    
    config: Mapped[Dict[str, Any]] = mapped_column(JSONB, default=dict)
    auth_data: Mapped[Dict[str, Any]] = mapped_column(JSONB, default=dict)
    
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    sync_enabled: Mapped[bool] = mapped_column(Boolean, default=False)
    
    last_sync_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    error_message: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    
    created_by: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey('users.id'),
        nullable=False
    )

    project: Mapped['Project'] = relationship('Project', back_populates='integrations')
    creator: Mapped['User'] = relationship()
    mappings: Mapped[List['IntegrationMapping']] = relationship(
        'IntegrationMapping', back_populates='integration', cascade='all, delete-orphan'
    )


class IntegrationMapping(BaseModel):
    __tablename__ = 'integration_mappings'

    integration_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey('integrations.id', ondelete='CASCADE'),
        nullable=False,
        index=True,
    )
    
    mapping_type: Mapped[MappingType] = mapped_column(
        SQLEnum(MappingType), nullable=False
    )
    
    internal_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), nullable=False)
    external_id: Mapped[str] = mapped_column(String(255), nullable=False)
    external_url: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    
    metadata: Mapped[Dict[str, Any]] = mapped_column(JSONB, default=dict)
    
    sync_status: Mapped[str] = mapped_column(String(50), default='synced')
    last_synced_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)

    integration: Mapped['Integration'] = relationship('Integration', back_populates='mappings')

    __table_args__ = (
        {'extend_existing': True},
    )