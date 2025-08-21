import asyncio
from typing import List, Dict, Any, Optional
from app.core.logging import get_logger
from app.core.settings import get_settings
from app.services.email_providers import (
    get_email_provider,
    EmailMessage,
    EmailResponse,
)

settings = get_settings()
logger = get_logger(__name__)


class EmailService:
    """Main email service that uses the configured email provider"""

    def __init__(self):
        self.provider = get_email_provider()
        self.from_email = settings.EMAIL_FROM
        self.from_name = settings.EMAIL_FROM_NAME
        self.max_retries = settings.EMAIL_MAX_RETRIES
        self.retry_delay = settings.EMAIL_RETRY_DELAY
    
    def _clean_tag(self, tag: str) -> str:
        """Clean a tag to conform to email provider requirements (ASCII letters, numbers, underscores, or dashes)"""
        import re
        # Replace any non-allowed characters with underscores
        cleaned = re.sub(r'[^a-zA-Z0-9_-]', '_', tag)
        # Remove multiple consecutive underscores
        cleaned = re.sub(r'_+', '_', cleaned)
        # Remove leading/trailing underscores
        return cleaned.strip('_')

    async def send_invitation(
        self,
        to_email: str,
        invite_url: str,
        organization_name: str,
        role: str,
        inviter_name: Optional[str] = None,
    ) -> bool:
        """Send an invitation email"""
        try:
            html_content = self._get_invitation_html(
                invite_url, organization_name, role, inviter_name
            )

            text_content = self._get_invitation_text(
                invite_url, organization_name, role, inviter_name
            )

            # Clean tags for email provider requirements
            org_tag = self._clean_tag(organization_name)
            role_tag = self._clean_tag(role)
            
            message = EmailMessage(
                to_emails=[to_email],
                subject=f"You've been invited to join {organization_name}",
                html_content=html_content,
                text_content=text_content,
                from_email=self.from_email,
                from_name=self.from_name,
                tags=['invitation', f'org_{org_tag}', f'role_{role_tag}'],
                email_metadata={
                    'type': 'invitation',
                    'organization': organization_name,
                    'role': role,
                },
            )

            response = await self._send_with_retry(message)
            return response.success

        except Exception as e:
            logger.error(f'Failed to send invitation email to {to_email}: {str(e)}')
            return False

    async def send_welcome_email(
        self, to_email: str, user_name: str, organization_name: Optional[str] = None
    ) -> bool:
        """Send a welcome email to new users"""
        try:
            html_content = self._get_welcome_html(user_name, organization_name)
            text_content = self._get_welcome_text(user_name, organization_name)

            message = EmailMessage(
                to_emails=[to_email],
                subject=f'Welcome to Reflect, {user_name}!',
                html_content=html_content,
                text_content=text_content,
                from_email=self.from_email,
                from_name=self.from_name,
                tags=['welcome', 'onboarding'],
                email_metadata={'type': 'welcome', 'user_name': user_name},
            )

            response = await self._send_with_retry(message)
            return response.success

        except Exception as e:
            logger.error(f'Failed to send welcome email to {to_email}: {str(e)}')
            return False

    async def send_reminder_email(
        self, to_email: str, invite_url: str, organization_name: str, days_remaining: int
    ) -> bool:
        """Send a reminder email for pending invitations"""
        try:
            html_content = self._get_reminder_html(
                invite_url, organization_name, days_remaining
            )

            text_content = self._get_reminder_text(
                invite_url, organization_name, days_remaining
            )

            message = EmailMessage(
                to_emails=[to_email],
                subject=f'Reminder: Your invitation to {organization_name} expires soon',
                html_content=html_content,
                text_content=text_content,
                from_email=self.from_email,
                from_name=self.from_name,
                tags=['reminder', 'invitation'],
                email_metadata={
                    'type': 'reminder',
                    'organization': organization_name,
                    'days_remaining': days_remaining,
                },
            )

            response = await self._send_with_retry(message)
            return response.success

        except Exception as e:
            logger.error(f'Failed to send reminder email to {to_email}: {str(e)}')
            return False

    async def send_bulk_emails(
        self, recipients: List[Dict[str, Any]], template: str, subject: str
    ) -> Dict[str, bool]:
        """Send bulk emails using a template"""
        results = {}

        for recipient in recipients:
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
        """Send a single templated email"""
        try:
            html_content = self._render_template(template, 'html', data)
            text_content = self._render_template(template, 'text', data)

            message = EmailMessage(
                to_emails=[to_email],
                subject=subject,
                html_content=html_content,
                text_content=text_content,
                from_email=self.from_email,
                from_name=self.from_name,
                tags=[template],
                email_metadata={'template': template, **data},
            )

            response = await self._send_with_retry(message)
            return response.success

        except Exception as e:
            logger.error(f'Failed to send email to {to_email}: {str(e)}')
            return False

    async def _send_with_retry(self, message: EmailMessage) -> EmailResponse:
        """Send email with retry logic"""
        last_error = None

        for attempt in range(self.max_retries):
            try:
                response = await self.provider.send_email(message)

                if response.success:
                    return response

                last_error = response.error_message
                logger.warning(
                    f'Email send attempt {attempt + 1} failed: {last_error}'
                )

            except Exception as e:
                last_error = str(e)
                logger.warning(f'Email send attempt {attempt + 1} failed: {last_error}')

            if attempt < self.max_retries - 1:
                await asyncio.sleep(self.retry_delay * (2**attempt))  # Exponential backoff

        # All retries failed
        return EmailResponse(
            success=False,
            error_message=f'Failed after {self.max_retries} attempts: {last_error}',
        )

    def _render_template(
        self, template_name: str, format: str, data: Dict[str, Any]
    ) -> str:
        """Render an email template with data"""
        # TODO: Implement proper template rendering with Jinja2
        # For now, return a simple string
        return f'Template: {template_name} ({format}) with data: {data}'

    def _get_invitation_html(
        self,
        invite_url: str,
        organization_name: str,
        role: str,
        inviter_name: Optional[str] = None,
    ) -> str:
        """Get HTML content for invitation email"""
        inviter_text = f' by {inviter_name}' if inviter_name else ''

        return f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
                body {{ 
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                    line-height: 1.6;
                    color: #333;
                    margin: 0;
                    padding: 0;
                    background-color: #f5f5f5;
                }}
                .container {{ 
                    max-width: 600px;
                    margin: 40px auto;
                    background-color: white;
                    border-radius: 12px;
                    overflow: hidden;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                }}
                .header {{ 
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    padding: 40px 30px;
                    text-align: center;
                }}
                .header h1 {{
                    margin: 0;
                    font-size: 28px;
                    font-weight: 600;
                }}
                .content {{ 
                    padding: 40px 30px;
                }}
                .content h2 {{
                    color: #333;
                    font-size: 24px;
                    margin-bottom: 20px;
                }}
                .content p {{
                    color: #666;
                    margin-bottom: 20px;
                }}
                .button {{ 
                    display: inline-block;
                    padding: 14px 32px;
                    background: #667eea;
                    color: white;
                    text-decoration: none;
                    border-radius: 6px;
                    font-weight: 600;
                    margin: 25px 0;
                }}
                .button:hover {{
                    background: #5a67d8;
                }}
                .footer {{ 
                    background: #f9f9f9;
                    padding: 25px 30px;
                    text-align: center;
                    color: #999;
                    font-size: 14px;
                    border-top: 1px solid #eee;
                }}
                .footer p {{
                    margin: 5px 0;
                }}
                .role-badge {{
                    display: inline-block;
                    padding: 4px 12px;
                    background: #e6f3ff;
                    color: #0066cc;
                    border-radius: 4px;
                    font-weight: 600;
                    font-size: 14px;
                }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>You're Invited to Reflect! 🚀</h1>
                </div>
                <div class="content">
                    <h2>Join {organization_name}</h2>
                    <p>
                        You've been invited{inviter_text} to join <strong>{organization_name}</strong> 
                        as a <span class="role-badge">{role}</span>.
                    </p>
                    <p>
                        Reflect is a powerful feedback management platform that helps teams collect, 
                        organize, and act on user feedback to build better products.
                    </p>
                    <p>Click the button below to accept the invitation and get started:</p>
                    <div style="text-align: center;">
                        <a href="{invite_url}" class="button">Accept Invitation</a>
                    </div>
                    <p style="color: #999; font-size: 14px;">
                        This invitation will expire in 72 hours. If you didn't expect this invitation, 
                        you can safely ignore this email.
                    </p>
                </div>
                <div class="footer">
                    <p>© 2024 Reflect. All rights reserved.</p>
                    <p>Building better products through user feedback</p>
                </div>
            </div>
        </body>
        </html>
        """

    def _get_invitation_text(
        self,
        invite_url: str,
        organization_name: str,
        role: str,
        inviter_name: Optional[str] = None,
    ) -> str:
        """Get plain text content for invitation email"""
        inviter_text = f' by {inviter_name}' if inviter_name else ''

        return f"""
You're Invited to Reflect!

You've been invited{inviter_text} to join {organization_name} as a {role}.

Reflect is a powerful feedback management platform that helps teams collect, 
organize, and act on user feedback to build better products.

Accept your invitation:
{invite_url}

This invitation will expire in 72 hours.

If you didn't expect this invitation, you can safely ignore this email.

© 2024 Reflect. All rights reserved.
        """

    def _get_welcome_html(
        self, user_name: str, organization_name: Optional[str] = None
    ) -> str:
        """Get HTML content for welcome email"""
        org_text = f' to {organization_name}' if organization_name else ''

        return f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
                body {{ 
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                    line-height: 1.6;
                    color: #333;
                    margin: 0;
                    padding: 0;
                    background-color: #f5f5f5;
                }}
                .container {{ 
                    max-width: 600px;
                    margin: 40px auto;
                    background-color: white;
                    border-radius: 12px;
                    overflow: hidden;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                }}
                .header {{ 
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    padding: 40px 30px;
                    text-align: center;
                }}
                .content {{ 
                    padding: 40px 30px;
                }}
                .button {{ 
                    display: inline-block;
                    padding: 14px 32px;
                    background: #667eea;
                    color: white;
                    text-decoration: none;
                    border-radius: 6px;
                    font-weight: 600;
                    margin: 20px 0;
                }}
                .feature-list {{
                    margin: 25px 0;
                }}
                .feature-list li {{
                    margin: 10px 0;
                    color: #666;
                }}
                .footer {{ 
                    background: #f9f9f9;
                    padding: 25px 30px;
                    text-align: center;
                    color: #999;
                    font-size: 14px;
                }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>Welcome to Reflect, {user_name}! 🎉</h1>
                </div>
                <div class="content">
                    <h2>Your account is ready{org_text}</h2>
                    <p>
                        We're excited to have you onboard! Reflect helps you collect and manage 
                        user feedback to build products your users love.
                    </p>
                    <h3>What you can do with Reflect:</h3>
                    <ul class="feature-list">
                        <li>📝 Collect feedback through customizable widgets</li>
                        <li>📊 Organize and prioritize feature requests</li>
                        <li>🐛 Track and manage bug reports</li>
                        <li>⭐ Monitor customer satisfaction with reviews</li>
                        <li>🗺️ Build public roadmaps to engage your users</li>
                        <li>🔗 Integrate with your favorite tools</li>
                    </ul>
                    <div style="text-align: center;">
                        <a href="{settings.FRONTEND_URL}/dashboard" class="button">Go to Dashboard</a>
                    </div>
                </div>
                <div class="footer">
                    <p>© 2024 Reflect. All rights reserved.</p>
                    <p>Need help? Contact our support team anytime.</p>
                </div>
            </div>
        </body>
        </html>
        """

    def _get_welcome_text(
        self, user_name: str, organization_name: Optional[str] = None
    ) -> str:
        """Get plain text content for welcome email"""
        org_text = f' to {organization_name}' if organization_name else ''

        return f"""
Welcome to Reflect, {user_name}!

Your account is ready{org_text}.

We're excited to have you onboard! Reflect helps you collect and manage 
user feedback to build products your users love.

What you can do with Reflect:
- Collect feedback through customizable widgets
- Organize and prioritize feature requests
- Track and manage bug reports
- Monitor customer satisfaction with reviews
- Build public roadmaps to engage your users
- Integrate with your favorite tools

Get started: {settings.FRONTEND_URL}/dashboard

© 2024 Reflect. All rights reserved.
Need help? Contact our support team anytime.
        """

    def _get_reminder_html(
        self, invite_url: str, organization_name: str, days_remaining: int
    ) -> str:
        """Get HTML content for reminder email"""
        days_text = f'{days_remaining} day{"s" if days_remaining != 1 else ""}'

        return f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
                body {{ 
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                    line-height: 1.6;
                    color: #333;
                    margin: 0;
                    padding: 0;
                    background-color: #f5f5f5;
                }}
                .container {{ 
                    max-width: 600px;
                    margin: 40px auto;
                    background-color: white;
                    border-radius: 12px;
                    overflow: hidden;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                }}
                .header {{ 
                    background: linear-gradient(135deg, #f97316 0%, #ea580c 100%);
                    color: white;
                    padding: 40px 30px;
                    text-align: center;
                }}
                .content {{ 
                    padding: 40px 30px;
                }}
                .warning-box {{
                    background: #fff4e6;
                    border: 1px solid #ffc069;
                    border-radius: 6px;
                    padding: 15px;
                    margin: 20px 0;
                }}
                .button {{ 
                    display: inline-block;
                    padding: 14px 32px;
                    background: #f97316;
                    color: white;
                    text-decoration: none;
                    border-radius: 6px;
                    font-weight: 600;
                    margin: 25px 0;
                }}
                .footer {{ 
                    background: #f9f9f9;
                    padding: 25px 30px;
                    text-align: center;
                    color: #999;
                    font-size: 14px;
                }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>Your Invitation Expires Soon ⏰</h1>
                </div>
                <div class="content">
                    <h2>Don't miss out on joining {organization_name}</h2>
                    <div class="warning-box">
                        <strong>⚠️ This invitation expires in {days_text}</strong>
                    </div>
                    <p>
                        You still have a pending invitation to join <strong>{organization_name}</strong> 
                        on Reflect. Don't let this opportunity slip away!
                    </p>
                    <p>Accept your invitation now to start collaborating with your team:</p>
                    <div style="text-align: center;">
                        <a href="{invite_url}" class="button">Accept Invitation Now</a>
                    </div>
                    <p style="color: #999; font-size: 14px;">
                        After the invitation expires, you'll need to request a new one from your team administrator.
                    </p>
                </div>
                <div class="footer">
                    <p>© 2024 Reflect. All rights reserved.</p>
                </div>
            </div>
        </body>
        </html>
        """

    def _get_reminder_text(
        self, invite_url: str, organization_name: str, days_remaining: int
    ) -> str:
        """Get plain text content for reminder email"""
        days_text = f'{days_remaining} day{"s" if days_remaining != 1 else ""}'

        return f"""
Your Invitation Expires Soon!

Don't miss out on joining {organization_name}.

⚠️ This invitation expires in {days_text}.

You still have a pending invitation to join {organization_name} on Reflect. 
Don't let this opportunity slip away!

Accept your invitation now:
{invite_url}

After the invitation expires, you'll need to request a new one from your team administrator.

© 2024 Reflect. All rights reserved.
        """


# Singleton instance
email_service = EmailService()