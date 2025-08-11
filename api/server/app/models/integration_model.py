from typing import List, Optional, TYPE_CHECKING
from datetime import datetime
import uuid
from sqlalchemy import String, Boolean, ForeignKey, DateTime, Text
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship, Mapped, mapped_column

from app.models.base_model import BaseModel

if TYPE_CHECKING:
    from app.models.project_model import Project


class Integration(BaseModel):
    __tablename__ = 'integrations'

    project_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey('projects.id', ondelete='CASCADE'),
        nullable=False,
        index=True,
    )

    type: Mapped[str] = mapped_column(String(50), nullable=False)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    config: Mapped[dict] = mapped_column(JSONB, nullable=False)

    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    last_sync_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)

    project: Mapped['Project'] = relationship('Project', back_populates='integrations')
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

    entity_type: Mapped[str] = mapped_column(String(50), nullable=False)
    local_entity_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), nullable=False)
    external_entity_id: Mapped[str] = mapped_column(String(255), nullable=False)
    external_entity_url: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    sync_status: Mapped[str] = mapped_column(String(50), default='synced')
    last_synced_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)

    integration: Mapped['Integration'] = relationship('Integration', back_populates='mappings')

    __table_args__ = (
        {'extend_existing': True},
    )