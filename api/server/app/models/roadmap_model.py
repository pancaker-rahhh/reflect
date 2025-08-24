import uuid
from typing import TYPE_CHECKING, List, Optional
from sqlalchemy import (
    String,
    Boolean,
    ForeignKey,
    Integer,
    Text,
    UniqueConstraint,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship, Mapped, mapped_column

from app.models.base_model import BaseModel

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
    feature_tags: Mapped[List['RoadmapFeatureTag']] = relationship(
        'RoadmapFeatureTag',
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
    features: Mapped[List['RoadmapFeature']] = relationship(
        'RoadmapFeature',
        back_populates='column',
        cascade='all, delete-orphan',
        order_by='RoadmapFeature.order',
    )

    __table_args__ = (
        UniqueConstraint('roadmap_id', 'name', name='uq_roadmap_column_name'),
    )


class RoadmapFeatureTag(BaseModel):
    """Many-to-many relationship between features and tags."""

    __tablename__ = 'roadmap_feature_tags'

    feature_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey('roadmap_features.id', ondelete='CASCADE'),
        nullable=False,
        index=True,
    )
    tag_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey('roadmap_tags.id', ondelete='CASCADE'),
        nullable=False,
        index=True,
    )

    feature: Mapped['RoadmapFeature'] = relationship(back_populates='feature_tags')
    tag: Mapped['RoadmapTag'] = relationship(back_populates='feature_tags')
    priority: Mapped[Optional[str]] = mapped_column(String(20), default='medium')

    __table_args__ = (UniqueConstraint('feature_id', 'tag_id', name='uq_feature_tag'),)


class RoadmapFeature(BaseModel):
    __tablename__ = 'roadmap_features'

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

    column: Mapped['RoadmapColumn'] = relationship(back_populates='features')
    converted_feedback: Mapped[List['Feedback']] = relationship(
        'Feedback',
        foreign_keys='Feedback.converted_to_roadmap_id',
        back_populates='converted_to_roadmap_feature',
    )
    assignments: Mapped[List['RoadmapItemAssignment']] = relationship(
        'RoadmapItemAssignment',
        back_populates='roadmap_feature',
        cascade='all, delete-orphan',
    )
    feature_tags: Mapped[List['RoadmapFeatureTag']] = relationship(
        'RoadmapFeatureTag',
        back_populates='feature',
        cascade='all, delete-orphan',
    )

    @property
    def tags(self):
        if not hasattr(self, 'feature_tags') or self.feature_tags is None:
            return []
        return [
            feature_tag.tag
            for feature_tag in self.feature_tags
            if feature_tag and feature_tag.tag
        ]


class RoadmapItemAssignment(BaseModel):
    __tablename__ = 'roadmap_item_assignments'

    roadmap_feature_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey('roadmap_features.id', ondelete='CASCADE'),
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

    roadmap_feature = relationship('RoadmapFeature', back_populates='assignments')
    user = relationship('User', foreign_keys=[user_id])
    assigner = relationship('User', foreign_keys=[assigned_by])

    __table_args__ = (
        UniqueConstraint('roadmap_feature_id', 'user_id', name='uq_roadmap_assignment'),
        {'extend_existing': True},
    )
