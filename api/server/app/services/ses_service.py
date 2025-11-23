import asyncio
import boto3
from typing import Optional
from botocore.exceptions import ClientError, NoCredentialsError
from app.core.logging import get_logger
from app.core.settings import get_settings

settings = get_settings()
logger = get_logger(__name__)


class SESService:
    def __init__(self):
        self.region_name = 'us-east-1'
        self.from_email = 'support@reflectfeedback.com'
        self.from_name = 'Reflect'
        self._client = None

    def _get_client(self):
        """Get or create SES client."""
        if self._client is None:
            # Use hardcoded credentials from test_ses.py for now
            self._client = boto3.client(
                'ses',
                region_name=self.region_name,
                aws_access_key_id="AKIARYY7SWECS7PXL2VM",
                aws_secret_access_key="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"
            )
        return self._client

    def _send_email_sync(
        self,
        to_email: str,
        subject: str,
        html_content: str,
        text_content: Optional[str] = None,
        from_email: Optional[str] = None
    ) -> bool:
        """Synchronous email sending via AWS SES."""
        try:
            sender = from_email or f"{self.from_name} <{self.from_email}>"
            
            # Prepare message body
            body = {'Html': {'Data': html_content, 'Charset': 'UTF-8'}}
            if text_content:
                body['Text'] = {'Data': text_content, 'Charset': 'UTF-8'}

            client = self._get_client()
            response = client.send_email(
                Source=sender,
                Destination={'ToAddresses': [to_email]},
                Message={
                    'Subject': {'Data': subject, 'Charset': 'UTF-8'},
                    'Body': body
                }
            )

            message_id = response.get('MessageId')
            logger.info(f"✅ Email sent successfully to {to_email} (MessageId: {message_id})")
            return True

        except ClientError as e:
            error_code = e.response['Error']['Code']
            error_msg = e.response['Error']['Message']
            logger.error(f"❌ SES ClientError sending to {to_email}: {error_code} - {error_msg}")
            
            if 'not verified' in error_msg:
                logger.error(f"💡 Email address {self.from_email} needs to be verified in AWS SES")
            elif 'sandbox' in error_msg.lower():
                logger.error(f"💡 AWS SES is in sandbox mode - recipient {to_email} needs verification")
                
            return False

        except NoCredentialsError:
            logger.error("❌ AWS credentials not configured for SES")
            return False

        except Exception as e:
            logger.error(f"❌ Unexpected error sending email to {to_email}: {str(e)}")
            return False

    async def send_email(
        self,
        to_email: str,
        subject: str,
        html_content: str,
        text_content: Optional[str] = None,
        from_email: Optional[str] = None
    ) -> bool:
        """Async wrapper for email sending."""
        return await asyncio.to_thread(
            self._send_email_sync,
            to_email,
            subject,
            html_content,
            text_content,
            from_email
        )


# Singleton instance
ses_service = SESService()