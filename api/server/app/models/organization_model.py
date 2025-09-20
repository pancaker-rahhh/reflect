from typing import List, Optional, TYPE_CHECKING
from datetime import datetime
from sqlalchemy import (
    String,
    ForeignKey,
    UniqueConstraint,
    DateTime as DateTimeColumn,
    Enum,
)
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
    OWNER = 'owner'
    ADMIN = 'admin'
    MEMBER = 'member'


class SubscriptionPlanEnum(str, enum.Enum):
    FREE = 'free'
    PRO_MONTHLY = 'pro_monthly'
    PRO_YEARLY = 'pro_yearly'


class PaymentStatusEnum(str, enum.Enum):
    PENDING = 'pending'
    PROCESSING = 'processing'
    SUCCEEDED = 'succeeded'
    FAILED = 'failed'
    CANCELLED = 'cancelled'
    REFUNDED = 'refunded'
    EXPIRED = 'expired'


class ProjectRole(str, enum.Enum):
    ADMIN = 'admin'
    EDITOR = 'editor'
    VIEWER = 'viewer'


class Organization(BaseModel):
    __tablename__ = 'organizations'

    name: Mapped[str] = mapped_column(String(255), nullable=False)
    slug: Mapped[str] = mapped_column(
        String(100), unique=True, nullable=False, index=True
    )
    description: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    subscription_plan: Mapped[SubscriptionPlanEnum] = mapped_column(
        Enum(
            SubscriptionPlanEnum,
            values_callable=lambda e: [m.value for m in e],
            native_enum=False,
        ),
        default=SubscriptionPlanEnum.FREE,
    )
    subscription_status: Mapped[str] = mapped_column(String(20), default='active')
    subscription_ends_at: Mapped[Optional[datetime]] = mapped_column(
        DateTimeColumn(timezone=True), nullable=True
    )

    # Dodo Payments fields
    dodo_subscription_id: Mapped[Optional[str]] = mapped_column(
        String(255), nullable=True, index=True
    )
    dodo_customer_id: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    payment_status: Mapped[Optional[PaymentStatusEnum]] = mapped_column(
        Enum(
            PaymentStatusEnum,
            values_callable=lambda e: [m.value for m in e],
            native_enum=False,
        ),
        nullable=True,
    )
    last_payment_date: Mapped[Optional[datetime]] = mapped_column(
        DateTimeColumn(timezone=True), nullable=True
    )
    payment_metadata: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)
    settings: Mapped[dict] = mapped_column(JSON, default=dict)
    created_by: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey('users.id', ondelete='SET NULL'),
        nullable=True,
        index=True,
    )

    members: Mapped[List['OrganizationMember']] = relationship(
        'OrganizationMember',
        back_populates='organization',
        cascade='all, delete-orphan',
    )
    projects: Mapped[List['Project']] = relationship(
        'Project', back_populates='organization', cascade='all, delete-orphan'
    )
    creator: Mapped[Optional['User']] = relationship(
        'User', foreign_keys=[created_by], back_populates='created_organizations'
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

    organization: Mapped['Organization'] = relationship(
        'Organization', back_populates='members'
    )
    user: Mapped['User'] = relationship(
        'User', back_populates='organization_memberships'
    )


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
