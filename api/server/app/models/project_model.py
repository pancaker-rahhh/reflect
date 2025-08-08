from typing import TYPE_CHECKING, Optional
from sqlalchemy import String, Boolean, ForeignKey, UniqueConstraint, DateTime
from sqlalchemy.dialects.postgresql import UUID, JSON
from sqlalchemy.orm import relationship, Mapped, mapped_column
import re
import uuid
from datetime import datetime

from app.models.base_model import BaseModel

if TYPE_CHECKING:
    from app.models.workspace_model import Workspace
    from app.models.widget_model import Widget


class Project(BaseModel):
    __tablename__ = 'projects'

    workspace_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey('workspaces.id', ondelete='CASCADE'),
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
    workspace: Mapped['Workspace'] = relationship(
        'Workspace', back_populates='projects'
    )
    widgets: Mapped[list['Widget']] = relationship('Widget', back_populates='project')

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
        UniqueConstraint('workspace_id', 'slug', name='uq_project_workspace_slug'),
        {'extend_existing': True},
    )
