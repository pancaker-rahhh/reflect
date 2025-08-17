from typing import List, Optional, TYPE_CHECKING
from sqlalchemy import String, ForeignKey, UniqueConstraint, Boolean
from sqlalchemy.dialects.postgresql import UUID, JSON
from sqlalchemy.orm import relationship, Mapped, mapped_column
import re
import uuid
import enum

from app.models.base_model import BaseModel

if TYPE_CHECKING:
    from app.models.user_model import User
    from app.models.project_model import Project
    from app.models.invitation import Invitation, PendingMember, InvitationTask


class OrganizationRole(str, enum.Enum):
    OWNER = "owner"
    ADMIN = "admin"
    MEMBER = "member"


class ProjectRole(str, enum.Enum):
    ADMIN = "admin"
    EDITOR = "editor"
    VIEWER = "viewer"


class Organization(BaseModel):
    __tablename__ = 'organizations'

    name: Mapped[str] = mapped_column(String(255), nullable=False)
    slug: Mapped[str] = mapped_column(
        String(100), unique=True, nullable=False, index=True
    )
    subscription_tier: Mapped[str] = mapped_column(String(50), default='free')
    settings: Mapped[dict] = mapped_column(JSON, default=dict)

    members: Mapped[List['OrganizationMember']] = relationship(
        'OrganizationMember', back_populates='organization', cascade='all, delete-orphan'
    )
    projects: Mapped[List['Project']] = relationship(
        'Project', back_populates='organization', cascade='all, delete-orphan'
    )
    
    # Invitation system relationships
    invitations: Mapped[List['Invitation']] = relationship(
        'Invitation', back_populates='organization', cascade='all, delete-orphan'
    )
    pending_members: Mapped[List['PendingMember']] = relationship(
        'PendingMember', back_populates='organization', cascade='all, delete-orphan'
    )
    invitation_tasks: Mapped[List['InvitationTask']] = relationship(
        'InvitationTask', back_populates='organization', cascade='all, delete-orphan'
    )

    def generate_slug(self, name: str) -> str:
        slug = re.sub(r'[^\w\s-]', '', name.lower())
        slug = re.sub(r'[-\s]+', '-', slug)
        return slug[:100]

    def __init__(self, **kwargs):
        if 'slug' not in kwargs and 'name' in kwargs:
            kwargs['slug'] = self.generate_slug(kwargs['name'])
        super().__init__(**kwargs)


class OrganizationMember(BaseModel):
    __tablename__ = 'organization_members'
    __table_args__ = (
        UniqueConstraint('organization_id', 'user_id', name='uq_organization_member'),
    )

    organization_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey('organizations.id', ondelete='CASCADE'),
        nullable=False,
        index=True,
    )

    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey('users.id', ondelete='CASCADE'),
        nullable=False,
        index=True,
    )

    role: Mapped[OrganizationRole] = mapped_column(nullable=False)

    organization: Mapped['Organization'] = relationship('Organization', back_populates='members')
    user: Mapped['User'] = relationship('User', back_populates='organization_memberships')


class ProjectMember(BaseModel):
    __tablename__ = 'project_members'
    __table_args__ = (
        UniqueConstraint('project_id', 'user_id', name='uq_project_member'),
    )

    project_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey('projects.id', ondelete='CASCADE'),
        nullable=False,
        index=True,
    )

    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey('users.id', ondelete='CASCADE'),
        nullable=False,
        index=True,
    )

    role: Mapped[ProjectRole] = mapped_column(nullable=False)

    project: Mapped['Project'] = relationship('Project', back_populates='members')
    user: Mapped['User'] = relationship('User', back_populates='project_memberships')