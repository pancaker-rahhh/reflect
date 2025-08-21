from typing import Optional
from app.core.settings import get_settings
from app.core.logging import get_logger
from .email_base import EmailProvider
from .mock_email import MockEmailProvider
from .ses_email import SESEmailProvider
from .resend_email import ResendEmailProvider

logger = get_logger(__name__)
settings = get_settings()

_email_provider_instance: Optional[EmailProvider] = None


def get_email_provider() -> EmailProvider:
    """
    Factory function to get the appropriate email provider based on configuration.
    Returns a singleton instance of the selected provider.
    """
    global _email_provider_instance

    if _email_provider_instance is not None:
        return _email_provider_instance

    provider_type = settings.EMAIL_PROVIDER.lower()

    logger.info(f'Initializing email provider: {provider_type}')

    if provider_type == 'aws_ses':
        _email_provider_instance = SESEmailProvider()
    elif provider_type == 'resend':
        _email_provider_instance = ResendEmailProvider()
    elif provider_type == 'mock':
        _email_provider_instance = MockEmailProvider()
    else:
        logger.warning(
            f'Unknown email provider: {provider_type}. Falling back to mock provider.'
        )
        _email_provider_instance = MockEmailProvider()

    return _email_provider_instance


def reset_email_provider():
    global _email_provider_instance
    _email_provider_instance = None
    logger.info('Email provider instance reset')