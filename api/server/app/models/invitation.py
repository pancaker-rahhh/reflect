from datetime import datetime
from sqlalchemy import Column, String, DateTime, ForeignKey, JSON, Integer, Enum as SQLEnum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship, Mapped, mapped_column
import enum
import uuid

from app.models.base_model import BaseModel, TimeStampMixin
from app.db import Base


class InvitationStatus(str, enum.Enum):
    PENDING = "pending"
    ACCEPTED = "accepted"
    EXPIRED = "expired"
    CANCELLED = "cancelled"


class TaskStatus(str, enum.Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"


class Invitation(BaseModel):
    __tablename__ = "invitations"
    
    email = Column(String, nullable=False, index=True)
    role = Column(String, nullable=False)
    organization_id = Column(UUID(as_uuid=True), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=True)
    project_id = Column(UUID(as_uuid=True), ForeignKey("projects.id", ondelete="CASCADE"), nullable=True)
    invited_by = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=False)
    token = Column(String, unique=True, nullable=False, index=True)
    status = Column(SQLEnum(InvitationStatus), default=InvitationStatus.PENDING, nullable=False)
    expires_at = Column(DateTime, nullable=False)
    accepted_at = Column(DateTime, nullable=True)
    accepted_by = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    
    # Relationships
    organization = relationship("Organization", back_populates="invitations")
    project = relationship("Project", back_populates="invitations")
    inviter = relationship("User", foreign_keys=[invited_by], back_populates="sent_invitations")
    accepter = relationship("User", foreign_keys=[accepted_by], back_populates="accepted_invitations")


class PendingMember(BaseModel):
    __tablename__ = "pending_members"
    
    email = Column(String, nullable=False, index=True)
    name = Column(String, nullable=True)
    role = Column(String, nullable=False)
    organization_id = Column(UUID(as_uuid=True), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=True)
    project_id = Column(UUID(as_uuid=True), ForeignKey("projects.id", ondelete="CASCADE"), nullable=True)
    invitation_id = Column(UUID(as_uuid=True), ForeignKey("invitations.id", ondelete="CASCADE"), nullable=False)
    added_by = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=False)
    
    # Relationships
    organization = relationship("Organization", back_populates="pending_members")
    project = relationship("Project", back_populates="pending_members")
    invitation = relationship("Invitation", backref="pending_member", uselist=False)
    adder = relationship("User", back_populates="added_pending_members")


class InvitationTask(Base, TimeStampMixin):
    __tablename__ = "invitation_tasks"
    
    id: Mapped[str] = mapped_column(String, primary_key=True)  # UUID as string for easier tracking
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    organization_id = Column(UUID(as_uuid=True), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=True)
    total_count = Column(Integer, nullable=False)
    processed_count = Column(Integer, default=0)
    success_count = Column(Integer, default=0)
    failed_count = Column(Integer, default=0)
    status = Column(SQLEnum(TaskStatus), default=TaskStatus.PENDING, nullable=False)
    results = Column(JSON, nullable=True)  # Store detailed results as JSON
    error = Column(String, nullable=True)
    completed_at = Column(DateTime, nullable=True)
    
    # Relationships
    user = relationship("User", back_populates="invitation_tasks")
    organization = relationship("Organization", back_populates="invitation_tasks")