from typing import Optional, TYPE_CHECKING
from sqlalchemy import Column, String, DateTime
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.models.base import BaseModel

if TYPE_CHECKING:
    from app.models.workspace import Workspace


class User(BaseModel):
    __tablename__ = "users"
    
    # ID synced from Supabase Auth
    id = Column(UUID(as_uuid=True), primary_key=True, nullable=False)
    
    # Basic info from Supabase
    email = Column(String(255), unique=True, nullable=False, index=True)
    name = Column(String(255), nullable=True)
    avatar_url = Column(String, nullable=True)
    
    # Additional profile fields
    company_name = Column(String(255), nullable=True)
    phone = Column(String(50), nullable=True)
    timezone = Column(String(50), default="UTC")
    
    # Verification and login tracking
    email_verified_at = Column(DateTime(timezone=True), nullable=True)
    last_login_at = Column(DateTime(timezone=True), nullable=True)
    
    # Relationships
    workspace: Optional["Workspace"] = relationship(
        "Workspace",
        back_populates="user",
        uselist=False,
        cascade="all, delete-orphan"
    )
    
    def __init__(self, **kwargs):
        if 'id' not in kwargs:
            raise ValueError("User ID must be provided from Supabase Auth")
        # Don't generate UUID, use the one from Supabase
        super(BaseModel, self).__init__(**kwargs)