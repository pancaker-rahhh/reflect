from typing import TYPE_CHECKING
from sqlalchemy import Column, String, Boolean, ForeignKey, JSON
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import re

from app.models.base import BaseModel

if TYPE_CHECKING:
    from app.models.workspace import Workspace


class Project(BaseModel):
    __tablename__ = "projects"
    
    # Foreign key to workspace
    workspace_id = Column(
        UUID(as_uuid=True),
        ForeignKey("workspaces.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    
    # Project identification
    name = Column(String(255), nullable=False)
    display_name = Column(String(255), nullable=False)
    slug = Column(String(100), nullable=False, index=True)
    description = Column(String, nullable=True)
    
    # Branding
    logo_url = Column(String, nullable=True)
    main_website_url = Column(String, nullable=True)
    
    # Public review page settings
    public_reviews_enabled = Column(Boolean, default=False)
    public_reviews_url = Column(String(100), nullable=True)
    allow_new_review_submissions = Column(Boolean, default=True)
    default_review_sort_order = Column(String(20), default="newest")
    
    # SEO settings
    seo_page_title_suffix = Column(String(100), nullable=True)
    seo_meta_description = Column(String(160), nullable=True)
    
    # Additional settings as JSON
    settings = Column(JSON, default=dict)
    
    # Relationships
    workspace: "Workspace" = relationship("Workspace", back_populates="projects")
    
    def generate_slug(self, name: str) -> str:
        """Generate URL-friendly slug from name"""
        slug = re.sub(r'[^\w\s-]', '', name.lower())
        slug = re.sub(r'[-\s]+', '-', slug)
        return slug[:100]
    
    def __init__(self, **kwargs):
        if 'display_name' not in kwargs and 'name' in kwargs:
            kwargs['display_name'] = kwargs['name']
        if 'slug' not in kwargs and 'name' in kwargs:
            kwargs['slug'] = self.generate_slug(kwargs['name'])
        super().__init__(**kwargs)
    
    # Unique constraint on workspace_id + slug
    __table_args__ = (
        {'extend_existing': True}
    )