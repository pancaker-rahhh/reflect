import asyncio
import uuid
from typing import List, Dict, Any
from app.core.logging import get_logger
from .email_base import EmailProvider, EmailMessage, EmailResponse

logger = get_logger(__name__)


class MockEmailProvider(EmailProvider):
    """Mock email provider for development and testing"""

    def __init__(self):
        self.sent_emails = []
        logger.info('📧 MockEmailProvider initialized')

    async def send_email(self, message: EmailMessage) -> EmailResponse:
        """Simulate sending an email by logging it"""
        await self.validate_message(message)

        message_id = str(uuid.uuid4())

        logger.info('=' * 60)
        logger.info('📧 MOCK EMAIL SENT')
        logger.info(f'Message ID: {message_id}')
        logger.info(f'To: {", ".join(message.to_emails)}')
        logger.info(f'From: {message.from_name} <{message.from_email}>')
        logger.info(f'Subject: {message.subject}')

        if message.cc_emails:
            logger.info(f'CC: {", ".join(message.cc_emails)}')

        if message.bcc_emails:
            logger.info(f'BCC: {", ".join(message.bcc_emails)}')

        if message.reply_to:
            logger.info(f'Reply-To: {message.reply_to}')

        if message.tags:
            logger.info(f'Tags: {", ".join(message.tags)}')

        logger.info('--- HTML Content ---')
        logger.info(
            message.html_content[:500] + '...'
            if len(message.html_content) > 500
            else message.html_content
        )

        if message.text_content:
            logger.info('--- Text Content ---')
            logger.info(
                message.text_content[:500] + '...'
                if len(message.text_content) > 500
                else message.text_content
            )

        if message.attachments:
            logger.info(f'Attachments: {len(message.attachments)} file(s)')
            for attachment in message.attachments:
                logger.info(
                    f'  - {attachment.filename} ({attachment.content_type}, {len(attachment.content)} bytes)'
                )

        logger.info('=' * 60)

        # Store the email for testing purposes
        self.sent_emails.append(
            {
                'message_id': message_id,
                'message': message,
                'timestamp': EmailResponse(True, message_id).timestamp,
            }
        )

        # Simulate processing delay
        await asyncio.sleep(0.1)

        return EmailResponse(
            success=True,
            message_id=message_id,
            provider_response={'mock': True, 'stored': True},
        )

    async def send_bulk_emails(
        self, messages: List[EmailMessage]
    ) -> List[EmailResponse]:
        responses = []
        for message in messages:
            response = await self.send_email(message)
            responses.append(response)
            # Small delay between emails
            await asyncio.sleep(0.05)
        return responses

    async def verify_email_address(self, email: str) -> bool:
        """Mock email verification - always returns True in development"""
        logger.info(f'Mock verifying email: {email}')
        return self._is_valid_email(email)

    async def get_send_quota(self) -> Dict[str, Any]:
        """Return mock quota information"""
        return {
            'provider': 'mock',
            'max_24_hour_send': 'unlimited',
            'max_send_rate': 'unlimited',
            'sent_last_24_hours': len(self.sent_emails),
            'remaining_today': 'unlimited',
        }

    def get_sent_emails(self) -> List[Dict[str, Any]]:
        return self.sent_emails

    def clear_sent_emails(self):
        self.sent_emails = []
        logger.info('Cleared mock email history')