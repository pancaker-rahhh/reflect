from abc import ABC, abstractmethod
from typing import List, Optional, Dict, Any
from dataclasses import dataclass
from datetime import datetime


@dataclass
class EmailAttachment:
    filename: str
    content: bytes
    content_type: str = 'application/octet-stream'


@dataclass
class EmailMessage:
    to_emails: List[str]
    subject: str
    html_content: str
    text_content: Optional[str] = None
    from_email: Optional[str] = None
    from_name: Optional[str] = None
    reply_to: Optional[str] = None
    cc_emails: Optional[List[str]] = None
    bcc_emails: Optional[List[str]] = None
    attachments: Optional[List[EmailAttachment]] = None
    headers: Optional[Dict[str, str]] = None
    tags: Optional[List[str]] = None
    email_metadata: Optional[Dict[str, Any]] = None


@dataclass
class EmailResponse:
    success: bool
    message_id: Optional[str] = None
    provider_response: Optional[Dict[str, Any]] = None
    error_message: Optional[str] = None
    timestamp: datetime = None

    def __post_init__(self):
        if self.timestamp is None:
            self.timestamp = datetime.utcnow()


class EmailProvider(ABC):
    """Abstract base class for email providers"""

    @abstractmethod
    async def send_email(self, message: EmailMessage) -> EmailResponse:
        pass

    @abstractmethod
    async def send_bulk_emails(
        self, messages: List[EmailMessage]
    ) -> List[EmailResponse]:
        pass

    @abstractmethod
    async def verify_email_address(self, email: str) -> bool:
        pass

    @abstractmethod
    async def get_send_quota(self) -> Dict[str, Any]:
        pass

    async def validate_message(self, message: EmailMessage) -> bool:
        if not message.to_emails:
            raise ValueError('At least one recipient email is required')

        if not message.subject:
            raise ValueError('Email subject is required')

        if not message.html_content and not message.text_content:
            raise ValueError('Either HTML or text content is required')

        for email in message.to_emails:
            if not self._is_valid_email(email):
                raise ValueError(f'Invalid email address: {email}')

        return True

    def _is_valid_email(self, email: str) -> bool:
        """Basic email validation"""
        import re

        pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        return re.match(pattern, email) is not None