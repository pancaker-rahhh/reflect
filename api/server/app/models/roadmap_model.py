import uuid
from typing import TYPE_CHECKING, List, Optional, Dict, Any
from datetime import datetime
from sqlalchemy import (
    String,
    Boolean,
    ForeignKey,
    Integer,
    Text,
    UniqueConstraint,
    DateTime,
    Index,
)
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship, Mapped, mapped_column

from app.models.base_model import BaseModel
from app.models.integration_model import Integration, IntegrationType

if TYPE_CHECKING:
    from app.models.project_model import Project
    from app.models.feedback_model import Feedback


class RoadmapTag(BaseModel):
    """Tags that can be applied to roadmap features."""

    __tablename__ = 'roadmap_tags'

    roadmap_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey('roadmaps.id', ondelete='CASCADE'),
        nullable=False,
        index=True,
    )
    name: Mapped[str] = mapped_column(String(50), nullable=False)
    color: Mapped[str] = mapped_column(String(7), default='#6B7280')

    roadmap: Mapped['Roadmap'] = relationship(back_populates='tags')
    action_item_tags: Mapped[List['RoadmapActionItemTag']] = relationship(
        'RoadmapActionItemTag',
        back_populates='tag',
        cascade='all, delete-orphan',
    )

    __table_args__ = (
        UniqueConstraint('roadmap_id', 'name', name='uq_roadmap_tag_name'),
    )


class Roadmap(BaseModel):
    __tablename__ = 'roadmaps'

    project_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey('projects.id', ondelete='CASCADE'),
        unique=True,
        nullable=False,
        index=True,
    )
    name: Mapped[str] = mapped_column(String(255), default='Product Roadmap')

    is_public: Mapped[bool] = mapped_column(Boolean, default=False)
    public_slug: Mapped[str] = mapped_column(
        String(100), nullable=False, unique=True, index=True
    )
    subdomain: Mapped[Optional[str]] = mapped_column(
        String(100), nullable=True, unique=True, index=True
    )

    logo_url: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    project: Mapped['Project'] = relationship(back_populates='roadmap')
    columns: Mapped[List['RoadmapColumn']] = relationship(
        'RoadmapColumn',
        back_populates='roadmap',
        cascade='all, delete-orphan',
        order_by='RoadmapColumn.order',
    )
    tags: Mapped[List['RoadmapTag']] = relationship(
        'RoadmapTag',
        back_populates='roadmap',
        cascade='all, delete-orphan',
    )

    def __init__(self, **kwargs):
        if 'public_slug' not in kwargs and 'project_id' in kwargs:
            kwargs['public_slug'] = f'roadmap_{str(uuid.uuid4())[:12]}'
        super().__init__(**kwargs)


class RoadmapColumn(BaseModel):
    __tablename__ = 'roadmap_columns'

    roadmap_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey('roadmaps.id', ondelete='CASCADE'),
        nullable=False,
        index=True,
    )
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    color: Mapped[str] = mapped_column(String(7), default='#FFFFFF')
    status: Mapped[str] = mapped_column(String(50), default='new')

    order: Mapped[int] = mapped_column(Integer, nullable=False, default=0)

    roadmap: Mapped['Roadmap'] = relationship(back_populates='columns')
    action_items: Mapped[List['RoadmapActionItem']] = relationship(
        'RoadmapActionItem',
        back_populates='column',
        cascade='all, delete-orphan',
        order_by='RoadmapActionItem.order',
    )

    __table_args__ = (
        UniqueConstraint('roadmap_id', 'name', name='uq_roadmap_column_name'),
    )


class RoadmapActionItemTag(BaseModel):
    """Many-to-many relationship between action items and tags."""

    __tablename__ = 'roadmap_action_item_tags'

    action_item_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey('roadmap_action_items.id', ondelete='CASCADE'),
        nullable=False,
        index=True,
    )
    tag_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey('roadmap_tags.id', ondelete='CASCADE'),
        nullable=False,
        index=True,
    )

    action_item: Mapped['RoadmapActionItem'] = relationship(
        back_populates='action_item_tags'
    )
    tag: Mapped['RoadmapTag'] = relationship(back_populates='action_item_tags')
    priority: Mapped[Optional[str]] = mapped_column(String(20), default='medium')

    __table_args__ = (
        UniqueConstraint('action_item_id', 'tag_id', name='uq_action_item_tag'),
    )


class RoadmapActionItemIntegration(BaseModel):
    __tablename__ = 'roadmap_action_item_integrations'

    action_item_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey('roadmap_action_items.id', ondelete='CASCADE'),
        nullable=False,
        index=True,
    )

    integration_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey('integrations.id', ondelete='CASCADE'),
        nullable=False,
        index=True,
    )

    external_id: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    external_url: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    external_status: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)

    integration_metadata: Mapped[Dict[str, Any]] = mapped_column(JSONB, default=dict)

    last_synced_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    sync_status: Mapped[str] = mapped_column(
        String(50), default='synced'
    )  # synced, pending, error

    action_item: Mapped['RoadmapActionItem'] = relationship(
        back_populates='integrations'
    )
    integration: Mapped['Integration'] = relationship()

    __table_args__ = (
        UniqueConstraint(
            'action_item_id', 'integration_id', name='uq_action_item_integration'
        ),
        UniqueConstraint(
            'integration_id', 'external_id', name='uq_integration_external_id'
        ),
        Index('idx_action_item_integration_external_id', 'external_id'),
        Index('idx_action_item_integration_sync_status', 'sync_status'),
        Index('idx_action_item_integration_last_synced', 'last_synced_at'),
    )


class RoadmapActionItem(BaseModel):
    __tablename__ = 'roadmap_action_items'

    column_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey('roadmap_columns.id', ondelete='CASCADE'),
        nullable=False,
        index=True,
    )

    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str | None] = mapped_column(Text)

    order: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    vote_count: Mapped[int] = mapped_column(Integer, default=0)

    submitter_name: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    submitter_email: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)

    integrations: Mapped[List['RoadmapActionItemIntegration']] = relationship(
        'RoadmapActionItemIntegration',
        back_populates='action_item',
        cascade='all, delete-orphan',
    )

    column: Mapped['RoadmapColumn'] = relationship(back_populates='action_items')
    converted_feedback: Mapped[List['Feedback']] = relationship(
        'Feedback',
        foreign_keys='Feedback.converted_to_action_item_id',
        back_populates='converted_to_action_item',
    )
    assignments: Mapped[List['RoadmapItemAssignment']] = relationship(
        'RoadmapItemAssignment',
        back_populates='roadmap_action_item',
        cascade='all, delete-orphan',
    )
    action_item_tags: Mapped[List['RoadmapActionItemTag']] = relationship(
        'RoadmapActionItemTag',
        back_populates='action_item',
        cascade='all, delete-orphan',
    )

    @property
    def tags(self):
        if not hasattr(self, 'action_item_tags') or self.action_item_tags is None:
            return []
        return [
            action_item_tag.tag
            for action_item_tag in self.action_item_tags
            if action_item_tag and action_item_tag.tag
        ]

    @property
    def jira_integration(self) -> Optional['RoadmapActionItemIntegration']:
        for integration in self.integrations:
            if integration.integration.integration_type == IntegrationType.JIRA:
                return integration
        return None

    def get_integration(
        self, integration_type: str
    ) -> Optional['RoadmapActionItemIntegration']:
        for integration in self.integrations:
            if integration.integration.integration_type == integration_type:
                return integration
        return None

    def is_synced_with(self, integration_type: str) -> bool:
        return self.get_integration(integration_type) is not None


class RoadmapItemAssignment(BaseModel):
    __tablename__ = 'roadmap_item_assignments'

    roadmap_action_item_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey('roadmap_action_items.id', ondelete='CASCADE'),
        nullable=False,
        index=True,
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey('users.id', ondelete='CASCADE'), nullable=False
    )

    role: Mapped[str] = mapped_column(String(50), default='contributor')
    assigned_by: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True), ForeignKey('users.id'), nullable=True
    )

    roadmap_action_item = relationship(
        'RoadmapActionItem', back_populates='assignments'
    )
    user = relationship('User', foreign_keys=[user_id])
    assigner = relationship('User', foreign_keys=[assigned_by])

    __table_args__ = (
        UniqueConstraint(
            'roadmap_action_item_id', 'user_id', name='uq_roadmap_assignment'
        ),
        {'extend_existing': True},
    )
