from typing import Optional, TYPE_CHECKING
from datetime import datetime
import uuid
from sqlalchemy import String, DateTime as DateTimeColumn
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship, Mapped, mapped_column

from app.models.base import BaseModel

if TYPE_CHECKING:
    from app.models.workspace import Workspace


class User(BaseModel):
    __tablename__ = 'users'

    # ID synced from Supabase Auth (override the BaseModel id)
    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, nullable=False
    )

    # Basic info from Supabase
    email: Mapped[str] = mapped_column(
        String(255), unique=True, nullable=False, index=True
    )
    name: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    avatar_url: Mapped[Optional[str]] = mapped_column(String, nullable=True)

    # Additional profile fields
    company_name: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    phone: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    timezone: Mapped[str] = mapped_column(String(50), default='UTC')

    # Verification and login tracking
    email_verified_at: Mapped[Optional[datetime]] = mapped_column(
        DateTimeColumn(timezone=True), nullable=True
    )
    last_login_at: Mapped[Optional[datetime]] = mapped_column(
        DateTimeColumn(timezone=True), nullable=True
    )

    # Relationships
    workspace: Mapped[Optional['Workspace']] = relationship(
        'Workspace', back_populates='user', uselist=False, cascade='all, delete-orphan'
    )

    def __init__(self, **kwargs):
        if 'id' not in kwargs:
            raise ValueError('User ID must be provided from Supabase Auth')
        # Don't generate UUID, use the one from Supabase
        super(BaseModel, self).__init__(**kwargs)
