from datetime import datetime
from typing import Optional, Dict, Any, List
from uuid import uuid4
from sqlalchemy import Column, String, Text, JSON, Enum, Index, DateTime, Integer
from sqlalchemy.dialects.postgresql import UUID
import enum

from app.models.base_model import BaseModel


class EmailStatus(str, enum.Enum):
    PENDING = 'pending'
    SENT = 'sent'
    FAILED = 'failed'
    BOUNCED = 'bounced'
    COMPLAINED = 'complained'


class EmailType(str, enum.Enum):
    INVITATION = 'invitation'
    WELCOME = 'welcome'
    REMINDER = 'reminder'
    NOTIFICATION = 'notification'
    CUSTOM = 'custom'


class EmailLog(BaseModel):
    """Model to track all emails sent through the system"""

    __tablename__ = 'email_logs'

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    
    # Email details
    recipient_email = Column(String(255), nullable=False, index=True)
    sender_email = Column(String(255), nullable=False)
    subject = Column(String(500), nullable=False)
    email_type = Column(Enum(EmailType), nullable=False, index=True)
    
    # Provider information
    provider = Column(String(50), nullable=False)  # aws_ses, resend, mock
    provider_message_id = Column(String(255))  # Message ID from provider
    provider_response = Column(JSON)  # Full response from provider
    
    # Status tracking
    status = Column(Enum(EmailStatus), nullable=False, default=EmailStatus.PENDING, index=True)
    attempts = Column(Integer, default=1)
    last_attempt_at = Column(DateTime(timezone=True))
    sent_at = Column(DateTime(timezone=True))
    failed_at = Column(DateTime(timezone=True))
    error_message = Column(Text)
    
    # Optional metadata
    cc_emails = Column(JSON)  # List of CC emails
    bcc_emails = Column(JSON)  # List of BCC emails
    tags = Column(JSON)  # List of tags
    email_metadata = Column(JSON)  # Additional metadata
    
    # Relationships (optional)
    user_id = Column(UUID(as_uuid=True), index=True)  # User who triggered the email
    organization_id = Column(UUID(as_uuid=True), index=True)  # Related organization
    invitation_id = Column(UUID(as_uuid=True))  # Related invitation if applicable
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    
    # Indexes for common queries
    __table_args__ = (
        Index('idx_email_logs_recipient_status', 'recipient_email', 'status'),
        Index('idx_email_logs_type_status', 'email_type', 'status'),
        Index('idx_email_logs_created_at', 'created_at'),
        Index('idx_email_logs_organization', 'organization_id', 'status'),
    )
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert email log to dictionary"""
        return {
            'id': str(self.id),
            'recipient_email': self.recipient_email,
            'sender_email': self.sender_email,
            'subject': self.subject,
            'email_type': self.email_type.value if self.email_type else None,
            'provider': self.provider,
            'provider_message_id': self.provider_message_id,
            'status': self.status.value if self.status else None,
            'attempts': self.attempts,
            'sent_at': self.sent_at.isoformat() if self.sent_at else None,
            'failed_at': self.failed_at.isoformat() if self.failed_at else None,
            'error_message': self.error_message,
            'tags': self.tags,
            'email_metadata': self.email_metadata,
            'created_at': self.created_at.isoformat() if self.created_at else None,
        }