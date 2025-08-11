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

    project: Mapped['Project'] = relationship(back_populates='roadmap')
    columns: Mapped[List['RoadmapColumn']] = relationship(
        'RoadmapColumn',
        back_populates='roadmap',
        cascade='all, delete-orphan',
        order_by='RoadmapColumn.order',
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


class RoadmapFeature(BaseModel):
    __tablename__ = 'roadmap_features'

    column_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey('roadmap_columns.id', ondelete='CASCADE'),
        nullable=False,
        index=True,
    )

    feedback_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey('feedback.id', ondelete='SET NULL'),
        nullable=True,
        index=True,
    )

    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str | None] = mapped_column(Text)

    order: Mapped[int] = mapped_column(Integer, nullable=False, default=0)

    vote_count: Mapped[int] = mapped_column(Integer, default=0)

    column: Mapped['RoadmapColumn'] = relationship(back_populates='features')

    feedback: Mapped[Optional['Feedback']] = relationship()
    assignments: Mapped[List['RoadmapItemAssignment']] = relationship(
        'RoadmapItemAssignment', back_populates='roadmap_feature', cascade='all, delete-orphan'
    )


class RoadmapItemAssignment(BaseModel):
    __tablename__ = 'roadmap_item_assignments'

    roadmap_feature_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey('roadmap_features.id', ondelete='CASCADE'),
        nullable=False,
        index=True,
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey('users.id', ondelete='CASCADE'),
        nullable=False
    )

    role: Mapped[str] = mapped_column(String(50), default='contributor')
    assigned_by: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True), ForeignKey('users.id'), nullable=True
    )

    roadmap_feature = relationship('RoadmapFeature', back_populates='assignments')
    user = relationship('User')
    assigner = relationship('User', foreign_keys=[assigned_by])

    __table_args__ = (
        UniqueConstraint('roadmap_feature_id', 'user_id', name='uq_roadmap_assignment'),
        {'extend_existing': True},
    )
