from typing import Optional, List, TYPE_CHECKING
from sqlalchemy import String, Boolean, ForeignKey, UniqueConstraint, DateTime
from sqlalchemy.dialects.postgresql import UUID, JSON
from sqlalchemy.orm import relationship, Mapped, mapped_column
import re
import uuid
from datetime import datetime

from app.models.base_model import BaseModel

if TYPE_CHECKING:
    from app.models.organization_model import Organization, ProjectMember
    from app.models.roadmap_model import Roadmap
    from app.models.integration_model import Integration
    from app.models.webhook_model import Webhook
    from app.models.invitation import Invitation, PendingMember


class Project(BaseModel):
    __tablename__ = 'projects'

    organization_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey('organizations.id', ondelete='CASCADE'),
        nullable=False,
        index=True,
    )

    name: Mapped[str] = mapped_column(String(255), nullable=False)
    display_name: Mapped[str] = mapped_column(String(255), nullable=False)
    slug: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    description: Mapped[Optional[str]] = mapped_column(String, nullable=True)

    deleted_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)

    logo_url: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    main_website_url: Mapped[Optional[str]] = mapped_column(String, nullable=True)

    public_reviews_enabled: Mapped[bool] = mapped_column(Boolean, default=False)
    public_reviews_url: Mapped[Optional[str]] = mapped_column(
        String(100), nullable=True
    )
    allow_new_review_submissions: Mapped[bool] = mapped_column(Boolean, default=True)
    default_review_sort_order: Mapped[str] = mapped_column(String(20), default='newest')

    seo_page_title_suffix: Mapped[Optional[str]] = mapped_column(
        String(100), nullable=True
    )
    seo_meta_description: Mapped[Optional[str]] = mapped_column(
        String(160), nullable=True
    )

    settings: Mapped[dict] = mapped_column(JSON, default=dict)

    organization: Mapped['Organization'] = relationship(
        'Organization', back_populates='projects'
    )
    members: Mapped[List['ProjectMember']] = relationship(
        'ProjectMember', back_populates='project', cascade='all, delete-orphan'
    )

    widgets = relationship('Widget', back_populates='project')
    forms = relationship('FeedbackForm', back_populates='project')

    roadmap: Mapped[Optional['Roadmap']] = relationship(
        'Roadmap', back_populates='project', cascade='all, delete-orphan', uselist=False
    )
    integrations: Mapped[List['Integration']] = relationship(
        'Integration', back_populates='project', cascade='all, delete-orphan'
    )
    webhooks: Mapped[List['Webhook']] = relationship(
        'Webhook', back_populates='project', cascade='all, delete-orphan'
    )

    # Invitation system relationships
    invitations: Mapped[List['Invitation']] = relationship(
        'Invitation', back_populates='project', cascade='all, delete-orphan'
    )
    pending_members: Mapped[List['PendingMember']] = relationship(
        'PendingMember', back_populates='project', cascade='all, delete-orphan'
    )

    def generate_slug(self, name: str) -> str:
        slug = re.sub(r'[^\w\s-]', '', name.lower())
        slug = re.sub(r'[-\s]+', '-', slug).strip('-')
        return slug[:100]

    def __init__(self, **kwargs):
        if 'display_name' not in kwargs and 'name' in kwargs:
            kwargs['display_name'] = kwargs['name']
        if 'slug' not in kwargs and 'name' in kwargs:
            kwargs['slug'] = self.generate_slug(kwargs['name'])
        super().__init__(**kwargs)

    __table_args__ = (
        UniqueConstraint(
            'organization_id', 'slug', name='uq_project_organization_slug'
        ),
        {'extend_existing': True},
    )
