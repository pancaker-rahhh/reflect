from typing import Optional
from app.core.logging import get_logger

logger = get_logger(__name__)


class NotificationService:
    def send_payment_failed_email(
        self,
        to_email: Optional[str],
        organization_id: str,
        payment_id: Optional[str] = None,
    ) -> None:
        """
        TODO: Implement real email sending via provider (e.g., SES, Postmark).
        Currently logs intent to send an email for a failed payment.
        """
        logger.info(
            'TODO email: payment failed',
            extra={
                'email': to_email,
                'organization_id': organization_id,
                'payment_id': payment_id,
            },
        )

    def send_subscription_failed_email(
        self,
        to_email: Optional[str],
        organization_id: str,
        subscription_id: Optional[str] = None,
    ) -> None:
        """
        TODO: Implement real email sending via provider.
        Currently logs intent to send an email for a failed subscription/mandate.
        """
        logger.info(
            'TODO email: subscription failed',
            extra={
                'email': to_email,
                'organization_id': organization_id,
                'subscription_id': subscription_id,
            },
        )


notification_service = NotificationService()
