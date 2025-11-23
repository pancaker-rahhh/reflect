import asyncio
from typing import List, Dict, Any
from app.core.logging import get_logger
from app.core.settings import get_settings
from app.services.ses_service import ses_service

settings = get_settings()

logger = get_logger(__name__)


class EmailService:
    def __init__(self):
        self.from_email = (
            settings.EMAIL_FROM
            if hasattr(settings, 'EMAIL_FROM')
            else 'noreply@reflect.app'
        )
        self.from_name = (
            settings.EMAIL_FROM_NAME
            if hasattr(settings, 'EMAIL_FROM_NAME')
            else 'Reflect'
        )

    async def send_invitation(
        self, to_email: str, invite_url: str, organization_name: str, role: str
    ) -> bool:
        try:
            subject = f"You've been invited to join {organization_name}"
            html_content = self._get_invitation_html(
                invite_url, organization_name, role
            )
            
            logger.info('📧 INVITATION EMAIL')
            logger.info(f'To: {to_email}')
            logger.info(f'From: {self.from_name} <{self.from_email}>')
            logger.info(f'Subject: {subject}')
            logger.info(f'Organization: {organization_name}')
            logger.info(f'Role: {role}')
            logger.info(f'Invitation URL: {invite_url}')
            logger.info('=' * 60)

            # Send via SES
            success = await ses_service.send_email(
                to_email=to_email,
                subject=subject,
                html_content=html_content
            )
            
            if success:
                logger.info(f'✅ Email invitation successfully sent to {to_email}')
            else:
                logger.error(f'❌ Failed to send invitation email to {to_email}')
            
            return success

        except Exception as e:
            logger.error(f'❌ Failed to send invitation email to {to_email}: {str(e)}')
            return False

    async def send_bulk_emails(
        self, recipients: List[Dict[str, Any]], template: str, subject: str
    ) -> Dict[str, bool]:
        results = {}

        for recipient in recipients:
            await asyncio.sleep(0.05)

            success = await self._send_single_email(
                to_email=recipient['email'],
                template=template,
                subject=subject,
                data=recipient.get('data', {}),
            )
            results[recipient['email']] = success

        return results

    async def _send_single_email(
        self, to_email: str, template: str, subject: str, data: Dict[str, Any]
    ) -> bool:
        try:
            logger.info(f'Sending {template} email to {to_email}')
            
            # For now, create a simple HTML template
            html_content = f"""
            <html>
            <body style="font-family: Arial, sans-serif;">
                <h2>{subject}</h2>
                <p>Template: {template}</p>
                <p>Data: {data}</p>
            </body>
            </html>
            """
            
            success = await ses_service.send_email(
                to_email=to_email,
                subject=subject,
                html_content=html_content
            )
            
            return success
            
        except Exception as e:
            logger.error(f'Failed to send email to {to_email}: {str(e)}')
            return False

    def _get_invitation_html(
        self, invite_url: str, organization_name: str, role: str
    ) -> str:
        return f"""
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                .header {{ background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }}
                .content {{ background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }}
                .button {{ display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }}
                .footer {{ text-align: center; margin-top: 30px; color: #666; font-size: 12px; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>You're Invited!</h1>
                </div>
                <div class="content">
                    <h2>Join {organization_name} on Reflect</h2>
                    <p>You've been invited to join <strong>{organization_name}</strong> as a <strong>{role}</strong>.</p>
                    <p>Click the button below to accept the invitation and get started:</p>
                    <div style="text-align: center;">
                        <a href="{invite_url}" class="button">Accept Invitation</a>
                    </div>
                    <p style="color: #666; font-size: 14px;">
                        This invitation will expire in 72 hours. If you didn't expect this invitation, you can safely ignore this email.
                    </p>
                </div>
                <div class="footer">
                    <p>© 2024 Reflect. All rights reserved.</p>
                </div>
            </div>
        </body>
        </html>
        """


# Singleton instance
email_service = EmailService()
