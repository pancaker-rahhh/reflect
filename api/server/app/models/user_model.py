from typing import Optional, List, TYPE_CHECKING
from datetime import datetime
import uuid
from sqlalchemy import String, DateTime as DateTimeColumn, Boolean, Enum
from sqlalchemy.dialects.postgresql import UUID, JSON
from sqlalchemy.orm import relationship, Mapped, mapped_column
import enum

from app.models.base_model import BaseModel

if TYPE_CHECKING:
    from app.models.organization_model import OrganizationMember, ProjectMember, Organization
    from app.models.notification_model import Notification
    from app.models.onboarding_model import UserOnboarding
    from app.models.invitation import Invitation, PendingMember, InvitationTask


class UserType(str, enum.Enum):
    SOLO = "solo"
    TEAM = "team"


class User(BaseModel):
    __tablename__ = 'users'

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, nullable=False
    )

    email: Mapped[str] = mapped_column(
        String(255), unique=True, nullable=False, index=True
    )
    name: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    avatar_url: Mapped[Optional[str]] = mapped_column(String, nullable=True)

    company_name: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    phone: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    timezone: Mapped[str] = mapped_column(String(50), default='UTC')

    email_verified_at: Mapped[Optional[datetime]] = mapped_column(
        DateTimeColumn(timezone=True), nullable=True
    )
    last_login_at: Mapped[Optional[datetime]] = mapped_column(
        DateTimeColumn(timezone=True), nullable=True
    )
    first_login_at: Mapped[Optional[datetime]] = mapped_column(
        DateTimeColumn(timezone=True), nullable=True
    )

    onboarding_completed: Mapped[bool] = mapped_column(Boolean, default=False)
    user_type: Mapped[Optional[UserType]] = mapped_column(
        Enum(UserType), nullable=True
    )

    user_metadata: Mapped[dict] = mapped_column(JSON, default=dict)
    app_metadata: Mapped[dict] = mapped_column(JSON, default=dict)
    last_synced_at: Mapped[Optional[datetime]] = mapped_column(
        DateTimeColumn(timezone=True), nullable=True
    )

    organization_memberships: Mapped[List['OrganizationMember']] = relationship(
        'OrganizationMember', back_populates='user', cascade='all, delete-orphan'
    )
    project_memberships: Mapped[List['ProjectMember']] = relationship(
        'ProjectMember', back_populates='user', cascade='all, delete-orphan'
    )
    created_organizations: Mapped[List['Organization']] = relationship(
        'Organization', foreign_keys='Organization.created_by', back_populates='creator', cascade='all, delete-orphan'
    )
    notifications: Mapped[List['Notification']] = relationship(
        'Notification', back_populates='user', cascade='all, delete-orphan'
    )
    onboarding: Mapped[Optional['UserOnboarding']] = relationship(
        'UserOnboarding', back_populates='user', uselist=False, cascade='all, delete-orphan'
    )
    
    # Invitation system relationships
    sent_invitations: Mapped[List['Invitation']] = relationship(
        'Invitation', foreign_keys='Invitation.invited_by', back_populates='inviter', cascade='all, delete-orphan'
    )
    accepted_invitations: Mapped[List['Invitation']] = relationship(
        'Invitation', foreign_keys='Invitation.accepted_by', back_populates='accepter', cascade='all, delete-orphan'
    )
    added_pending_members: Mapped[List['PendingMember']] = relationship(
        'PendingMember', back_populates='adder', cascade='all, delete-orphan'
    )
    invitation_tasks: Mapped[List['InvitationTask']] = relationship(
        'InvitationTask', back_populates='user', cascade='all, delete-orphan'
    )

    def __init__(self, **kwargs):
        if 'id' not in kwargs:
            raise ValueError('User ID must be provided from Supabase Auth')
        super(BaseModel, self).__init__(**kwargs)
