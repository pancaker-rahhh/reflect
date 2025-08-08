from typing import List, TYPE_CHECKING, Optional
from sqlalchemy import String, ForeignKey
from sqlalchemy.dialects.postgresql import UUID, JSON
from sqlalchemy.orm import relationship, Mapped, mapped_column
import re
import uuid

from app.models.base_model import BaseModel

if TYPE_CHECKING:
    from app.models.user_model import User
    from app.models.project_model import Project


class Workspace(BaseModel):
    __tablename__ = 'workspaces'

    # One-to-one relationship with User
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey('users.id', ondelete='CASCADE'),
        unique=True,
        nullable=False,
        index=True,
    )

    name: Mapped[str] = mapped_column(String(255), nullable=False)
    slug: Mapped[str] = mapped_column(
        String(100), unique=True, nullable=False, index=True
    )
    description: Mapped[Optional[str]] = mapped_column(String, nullable=True)

    # Settings stored as JSON for flexibility
    settings: Mapped[dict] = mapped_column(JSON, default=dict)

    user: Mapped['User'] = relationship('User', back_populates='workspace')
    projects: Mapped[List['Project']] = relationship(
        'Project', back_populates='workspace', cascade='all, delete-orphan'
    )

    def generate_slug(self, name: str) -> str:
        """Generate URL-friendly slug from name"""
        slug = re.sub(r'[^\w\s-]', '', name.lower())
        slug = re.sub(r'[-\s]+', '-', slug)
        return slug[:100]

    def __init__(self, **kwargs):
        if 'slug' not in kwargs and 'name' in kwargs:
            kwargs['slug'] = self.generate_slug(kwargs['name'])
        super().__init__(**kwargs)
