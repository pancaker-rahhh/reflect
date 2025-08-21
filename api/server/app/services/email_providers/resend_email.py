import json
from typing import List, Dict, Any, Optional
from app.core.logging import get_logger
from app.core.settings import get_settings
from .email_base import EmailProvider, EmailMessage, EmailResponse

logger = get_logger(__name__)
settings = get_settings()


class ResendEmailProvider(EmailProvider):
    """Resend email provider implementation"""

    def __init__(self):
        self.api_key = settings.RESEND_API_KEY
        self.base_url = 'https://api.resend.com'
        self.client = None
        self._initialize_client()

    def _initialize_client(self):
        if not self.api_key:
            logger.warning('Resend API key not configured')
            return

        try:
            import resend

            resend.api_key = self.api_key
            self.client = resend
            logger.info('✅ Resend client initialized')
        except ImportError:
            logger.error('resend package is not installed. Run: pip install resend')
            self.client = None

    async def send_email(self, message: EmailMessage) -> EmailResponse:
        await self.validate_message(message)

        if not self.client:
            # Fallback to HTTP API if client not initialized
            logger.warning('Resend client not available, falling back to HTTP')
            return await self._send_via_http(message)
        
        logger.info(f'Using Resend client: {type(self.client)}')

        try:
            # Prepare email parameters
            email_params = {
                'from': f'{message.from_name or settings.EMAIL_FROM_NAME} <{message.from_email or settings.EMAIL_FROM}>',
                'to': message.to_emails,
                'subject': message.subject,
            }

            if message.html_content:
                email_params['html'] = message.html_content

            if message.text_content:
                email_params['text'] = message.text_content

            if message.cc_emails:
                email_params['cc'] = message.cc_emails

            if message.bcc_emails:
                email_params['bcc'] = message.bcc_emails

            if message.reply_to:
                email_params['reply_to'] = message.reply_to

            if message.tags:
                email_params['tags'] = [{'name': tag, 'value': 'true'} for tag in message.tags]

            if message.attachments:
                email_params['attachments'] = [
                    {
                        'filename': att.filename,
                        'content': att.content.decode('utf-8')
                        if isinstance(att.content, bytes)
                        else att.content,
                    }
                    for att in message.attachments
                ]

            # Send the email
            logger.info(f'Sending email via Resend with params: {email_params}')
            response = self.client.Emails.send(email_params)
            logger.info(f'Resend response: {response}')

            if response.get('id'):
                logger.info(f'✅ Email sent via Resend. ID: {response["id"]}')
                return EmailResponse(
                    success=True,
                    message_id=response['id'],
                    provider_response=response,
                )
            else:
                return EmailResponse(
                    success=False,
                    error_message='Failed to send email via Resend',
                    provider_response=response,
                )

        except Exception as e:
            logger.error(f'Failed to send email via Resend: {type(e).__name__}: {str(e)}')
            logger.error(f'Email params: {email_params}')
            return EmailResponse(
                success=False, error_message=f'Failed to send email: {type(e).__name__}: {str(e)}'
            )

    async def _send_via_http(self, message: EmailMessage) -> EmailResponse:
        if not self.api_key:
            return EmailResponse(
                success=False, error_message='Resend API key not configured'
            )

        try:
            import aiohttp

            headers = {
                'Authorization': f'Bearer {self.api_key}',
                'Content-Type': 'application/json',
            }

            payload = {
                'from': f'{message.from_name or settings.EMAIL_FROM_NAME} <{message.from_email or settings.EMAIL_FROM}>',
                'to': message.to_emails,
                'subject': message.subject,
            }

            if message.html_content:
                payload['html'] = message.html_content

            if message.text_content:
                payload['text'] = message.text_content

            if message.cc_emails:
                payload['cc'] = message.cc_emails

            if message.bcc_emails:
                payload['bcc'] = message.bcc_emails

            if message.reply_to:
                payload['reply_to'] = message.reply_to

            async with aiohttp.ClientSession() as session:
                async with session.post(
                    f'{self.base_url}/emails',
                    headers=headers,
                    json=payload,
                ) as response:
                    result = await response.json()

                    if response.status == 200 and result.get('id'):
                        logger.info(
                            f'✅ Email sent via Resend HTTP API. ID: {result["id"]}'
                        )
                        return EmailResponse(
                            success=True,
                            message_id=result['id'],
                            provider_response=result,
                        )
                    else:
                        error_msg = result.get('message', 'Unknown error')
                        logger.error(f'Resend API error: {error_msg}')
                        return EmailResponse(
                            success=False,
                            error_message=error_msg,
                            provider_response=result,
                        )

        except ImportError:
            logger.error('aiohttp is not installed. Run: pip install aiohttp')
            return EmailResponse(
                success=False, error_message='aiohttp not installed'
            )
        except Exception as e:
            logger.error(f'Failed to send email via Resend HTTP API: {str(e)}')
            return EmailResponse(
                success=False, error_message=f'Failed to send email: {str(e)}'
            )

    async def send_bulk_emails(
        self, messages: List[EmailMessage]
    ) -> List[EmailResponse]:
        responses = []

        # Resend supports batch sending, but for simplicity we'll send individually
        for message in messages:
            response = await self.send_email(message)
            responses.append(response)

        return responses

    async def verify_email_address(self, email: str) -> bool:
        """Verify an email address (Resend doesn't require verification)"""
        # Resend doesn't require email verification like SES
        return self._is_valid_email(email)

    async def get_send_quota(self) -> Dict[str, Any]:
        # Resend doesn't expose quota via API in free tier
        # These are the typical free tier limits
        return {
            'provider': 'resend',
            'max_24_hour_send': 3000,  # Free tier: 3000/month
            'max_send_rate': 100,  # Free tier: 100/day
            'sent_last_24_hours': 'N/A',
            'remaining_today': 'N/A',
            'note': 'Free tier: 3000 emails/month, 100 emails/day',
        }