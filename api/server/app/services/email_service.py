import asyncio
from typing import Optional, List, Dict, Any
from app.core.logging import get_logger
from app.core.config import settings

logger = get_logger(__name__)


class EmailService:
    """
    Email service for sending various types of emails.
    This is a stub implementation that can be replaced with actual email providers
    like SendGrid, AWS SES, Mailgun, etc.
    """
    
    def __init__(self):
        self.from_email = settings.EMAIL_FROM if hasattr(settings, 'EMAIL_FROM') else "noreply@reflect.app"
        self.from_name = settings.EMAIL_FROM_NAME if hasattr(settings, 'EMAIL_FROM_NAME') else "Reflect"
    
    async def send_invitation(
        self,
        to_email: str,
        invite_url: str,
        organization_name: str,
        role: str
    ) -> bool:
        """
        Send an invitation email.
        
        Args:
            to_email: Recipient email address
            invite_url: URL for accepting the invitation
            organization_name: Name of the organization
            role: Role being assigned
        
        Returns:
            bool: True if email was sent successfully
        """
        try:
            # Log the email details for now (replace with actual email sending)
            logger.info(f"Sending invitation email to {to_email}")
            logger.debug(f"Invitation details: org={organization_name}, role={role}, url={invite_url}")
            
            # Simulate email sending delay
            await asyncio.sleep(0.1)
            
            # In production, this would integrate with an email service provider
            # Example with SendGrid:
            # message = Mail(
            #     from_email=(self.from_email, self.from_name),
            #     to_emails=to_email,
            #     subject=f"You've been invited to join {organization_name}",
            #     html_content=self._get_invitation_html(invite_url, organization_name, role)
            # )
            # response = await self.sendgrid_client.send(message)
            
            return True
            
        except Exception as e:
            logger.error(f"Failed to send invitation email to {to_email}: {str(e)}")
            return False
    
    async def send_bulk_emails(
        self,
        recipients: List[Dict[str, Any]],
        template: str,
        subject: str
    ) -> Dict[str, bool]:
        """
        Send bulk emails to multiple recipients.
        
        Args:
            recipients: List of recipient data with email and personalization
            template: Email template name
            subject: Email subject
        
        Returns:
            Dict mapping email to success status
        """
        results = {}
        
        for recipient in recipients:
            # Add small delay to avoid rate limiting
            await asyncio.sleep(0.05)
            
            success = await self._send_single_email(
                to_email=recipient['email'],
                template=template,
                subject=subject,
                data=recipient.get('data', {})
            )
            results[recipient['email']] = success
        
        return results
    
    async def _send_single_email(
        self,
        to_email: str,
        template: str,
        subject: str,
        data: Dict[str, Any]
    ) -> bool:
        """Send a single templated email."""
        try:
            logger.info(f"Sending {template} email to {to_email}")
            # Implement actual email sending here
            return True
        except Exception as e:
            logger.error(f"Failed to send email to {to_email}: {str(e)}")
            return False
    
    def _get_invitation_html(
        self,
        invite_url: str,
        organization_name: str,
        role: str
    ) -> str:
        """Generate HTML content for invitation email."""
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