from typing import List, TYPE_CHECKING
from sqlalchemy import Column, String, ForeignKey, JSON
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import re

from app.models.base import BaseModel

if TYPE_CHECKING:
    from app.models.user import User
    from app.models.project import Project


class Workspace(BaseModel):
    __tablename__ = "workspaces"
    
    # One-to-one relationship with User
    user_id = Column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        unique=True,
        nullable=False,
        index=True
    )
    
    # Workspace details
    name = Column(String(255), nullable=False)
    slug = Column(String(100), unique=True, nullable=False, index=True)
    description = Column(String, nullable=True)
    
    # Settings stored as JSON for flexibility
    settings = Column(JSON, default=dict)
    
    # Relationships
    user: "User" = relationship("User", back_populates="workspace")
    projects: List["Project"] = relationship(
        "Project",
        back_populates="workspace",
        cascade="all, delete-orphan"
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