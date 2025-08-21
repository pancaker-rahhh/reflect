import json
from typing import List, Dict, Any, Optional
from app.core.logging import get_logger
from app.core.settings import get_settings
from .email_base import EmailProvider, EmailMessage, EmailResponse

logger = get_logger(__name__)
settings = get_settings()


class SESEmailProvider(EmailProvider):
    """AWS SES email provider implementation"""

    def __init__(self):
        self.client = None
        self.region = settings.AWS_REGION or 'us-east-1'
        self.configuration_set = settings.SES_CONFIGURATION_SET
        self._initialize_client()

    def _initialize_client(self):
        try:
            import boto3
            from botocore.exceptions import NoCredentialsError

            if settings.AWS_ACCESS_KEY_ID and settings.AWS_SECRET_ACCESS_KEY:
                self.client = boto3.client(
                    'ses',
                    region_name=self.region,
                    aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
                    aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
                )
            else:
                # Use default credentials (IAM role, environment variables, etc.)
                self.client = boto3.client('ses', region_name=self.region)

            logger.info(f'✅ AWS SES client initialized for region: {self.region}')
        except ImportError:
            logger.error('boto3 is not installed. Run: pip install boto3')
            raise
        except NoCredentialsError:
            logger.error('AWS credentials not found')
            raise
        except Exception as e:
            logger.error(f'Failed to initialize SES client: {str(e)}')
            raise

    async def send_email(self, message: EmailMessage) -> EmailResponse:
        await self.validate_message(message)

        if not self.client:
            return EmailResponse(
                success=False, error_message='SES client not initialized'
            )

        try:
            # Prepare the email
            destination = {'ToAddresses': message.to_emails}

            if message.cc_emails:
                destination['CcAddresses'] = message.cc_emails

            if message.bcc_emails:
                destination['BccAddresses'] = message.bcc_emails

            email_message = {
                'Subject': {'Data': message.subject, 'Charset': 'UTF-8'},
                'Body': {},
            }

            if message.html_content:
                email_message['Body']['Html'] = {
                    'Data': message.html_content,
                    'Charset': 'UTF-8',
                }

            if message.text_content:
                email_message['Body']['Text'] = {
                    'Data': message.text_content,
                    'Charset': 'UTF-8',
                }

            # Prepare send parameters
            send_params = {
                'Source': f'{message.from_name or settings.EMAIL_FROM_NAME} <{message.from_email or settings.EMAIL_FROM}>',
                'Destination': destination,
                'Message': email_message,
            }

            if message.reply_to:
                send_params['ReplyToAddresses'] = [message.reply_to]

            if self.configuration_set:
                send_params['ConfigurationSetName'] = self.configuration_set

            if message.tags:
                send_params['Tags'] = [
                    {'Name': 'Tag', 'Value': tag} for tag in message.tags
                ]

            # Send the email
            response = self.client.send_email(**send_params)

            logger.info(
                f'✅ Email sent via AWS SES. MessageId: {response["MessageId"]}'
            )

            return EmailResponse(
                success=True,
                message_id=response['MessageId'],
                provider_response=response,
            )

        except self.client.exceptions.MessageRejected as e:
            logger.error(f'SES rejected message: {str(e)}')
            return EmailResponse(success=False, error_message=f'Message rejected: {str(e)}')

        except self.client.exceptions.MailFromDomainNotVerifiedException as e:
            logger.error(f'SES domain not verified: {str(e)}')
            return EmailResponse(
                success=False, error_message=f'Domain not verified: {str(e)}'
            )

        except self.client.exceptions.SendingPausedException as e:
            logger.error(f'SES sending paused: {str(e)}')
            return EmailResponse(
                success=False, error_message='Email sending is currently paused'
            )

        except Exception as e:
            logger.error(f'Failed to send email via SES: {str(e)}')
            return EmailResponse(
                success=False, error_message=f'Failed to send email: {str(e)}'
            )

    async def send_bulk_emails(
        self, messages: List[EmailMessage]
    ) -> List[EmailResponse]:
        responses = []

        # AWS SES has rate limits, so we should respect them
        for message in messages:
            response = await self.send_email(message)
            responses.append(response)

        return responses

    async def verify_email_address(self, email: str) -> bool:
        """Verify an email address with AWS SES"""
        if not self.client:
            logger.error('SES client not initialized')
            return False

        try:
            response = self.client.verify_email_identity(EmailAddress=email)
            logger.info(f'Verification email sent to: {email}')
            return True
        except Exception as e:
            logger.error(f'Failed to verify email {email}: {str(e)}')
            return False

    async def get_send_quota(self) -> Dict[str, Any]:
        if not self.client:
            return {
                'provider': 'aws_ses',
                'error': 'SES client not initialized',
            }

        try:
            response = self.client.get_send_quota()
            return {
                'provider': 'aws_ses',
                'max_24_hour_send': response.get('Max24HourSend', 0),
                'max_send_rate': response.get('MaxSendRate', 0),
                'sent_last_24_hours': response.get('SentLast24Hours', 0),
                'remaining_today': response.get('Max24HourSend', 0)
                - response.get('SentLast24Hours', 0),
            }
        except Exception as e:
            logger.error(f'Failed to get SES quota: {str(e)}')
            return {
                'provider': 'aws_ses',
                'error': str(e),
            }

    async def get_verified_emails(self) -> List[str]:
        if not self.client:
            return []

        try:
            response = self.client.list_verified_email_addresses()
            return response.get('VerifiedEmailAddresses', [])
        except Exception as e:
            logger.error(f'Failed to get verified emails: {str(e)}')
            return []

    async def check_domain_verification(self, domain: str) -> bool:
        if not self.client:
            return False

        try:
            response = self.client.get_identity_verification_attributes(
                Identities=[domain]
            )
            verification_attrs = response.get('VerificationAttributes', {})
            domain_attrs = verification_attrs.get(domain, {})
            return domain_attrs.get('VerificationStatus') == 'Success'
        except Exception as e:
            logger.error(f'Failed to check domain verification: {str(e)}')
            return False