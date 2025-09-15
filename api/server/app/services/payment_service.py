import hashlib
import hmac
import json
from typing import Dict, Any
from uuid import UUID
from datetime import datetime, timezone, timedelta
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.settings import get_settings
from app.core.logging import get_logger
from app.core.subscription_plans import (
    get_plan_by_id,
    PAYMENT_STATUS,
    SUBSCRIPTION_STATUS,
)
from app.services.subscription_service import subscription_service
from app.models.organization_model import SubscriptionPlanEnum
from dodopayments import DodoPayments
from app.services.notification_service import notification_service

logger = get_logger(__name__)
settings = get_settings()


class PaymentService:
    def __init__(self):
        self.client = None
        if DodoPayments and settings.DODO_TEST_API_KEY:
            self.client = DodoPayments(bearer_token=settings.DODO_TEST_API_KEY)

    async def create_payment_link(
        self,
        db: AsyncSession,
        organization_id: UUID,
        plan_id: str,
        user_details: Dict[str, str],
    ) -> Dict[str, Any]:
        if not self.client:
            raise ValueError('Dodo Payments client not initialized')

        plan = get_plan_by_id(plan_id)
        if not plan or not plan.get('dodo_product_id'):
            raise ValueError(f'Invalid plan ID: {plan_id}')

        # Get organization details
        organization = await subscription_service.get_organization_subscription(
            db, organization_id
        )
        if not organization:
            raise ValueError('Organization not found')

        try:
            # Construct the Dodo Payments checkout URL directly
            # Use test environment for testing
            base_url = (
                'https://test.checkout.dodopayments.com'
                if settings.DODO_TEST_API_KEY
                else 'https://checkout.dodopayments.com'
            )
            checkout_url = f'{base_url}/buy/{plan["dodo_product_id"]}?quantity=1&redirect_url={settings.DODO_RETURN_URL}'

            # Add customer details as query parameters
            checkout_url += f'&email={user_details.get("email")}'
            checkout_url += f'&country={user_details.get("country")}'
            checkout_url += f'&firstName={user_details.get("firstName")}'
            checkout_url += f'&lastName={user_details.get("lastName")}'

            # Add organization metadata for webhook processing
            checkout_url += f'&metadata[organization_id]={organization_id}'
            checkout_url += f'&metadata[plan_id]={plan_id}'

            logger.info(
                f'Created payment link for organization {organization_id}, plan {plan_id}',
                extra={
                    'organization_id': str(organization_id),
                    'plan_id': plan_id,
                    'payment_link': checkout_url,
                },
            )

            return {
                'payment_link': checkout_url,
                'subscription_id': '',  # Will be created after payment
                'payment_id': '',  # Will be created after payment
                'plan_id': plan_id,
                'organization_id': str(organization_id),
                'amount': plan['price'],
                'currency': plan['currency'],
            }

        except Exception as e:
            logger.error(
                f'Failed to create payment link for organization {organization_id}',
                extra={'error': str(e), 'organization_id': str(organization_id)},
            )
            raise

    async def process_webhook(
        self, db: AsyncSession, payload: Dict[str, Any], signature: str, timestamp: str
    ) -> bool:
        if not self._verify_webhook_signature(payload, signature, timestamp):
            logger.warning('Invalid webhook signature')
            return False

        try:
            event_type = payload.get('type')
            data = payload.get('data', {})

            logger.info(f'Processing webhook event: {event_type}')

            if event_type == 'payment.succeeded':
                await self._handle_payment_succeeded(db, data)
            elif event_type == 'payment.failed':
                await self._handle_payment_failed(db, data)
            elif event_type == 'payment.cancelled':
                await self._handle_payment_cancelled(db, data)
            elif event_type == 'payment.processing':
                await self._handle_payment_processing(db, data)
            elif event_type == 'subscription.active':
                await self._handle_subscription_active(db, data)
            elif event_type == 'subscription.cancelled':
                await self._handle_subscription_cancelled(db, data)
            elif event_type == 'subscription.expired':
                await self._handle_subscription_expired(db, data)
            elif event_type == 'subscription.failed':
                await self._handle_subscription_failed(db, data)
            elif event_type == 'subscription.renewed':
                await self._handle_subscription_renewed(db, data)
            else:
                logger.info(f'Unhandled webhook event type: {event_type}')

            return True

        except Exception as e:
            logger.error(f'Failed to process webhook: {str(e)}')
            return False

    def _verify_webhook_signature(
        self, payload: Dict[str, Any], signature: str, timestamp: str
    ) -> bool:
        """Verify webhook signature using HMAC."""
        if not settings.DODO_WEBHOOK_SECRET:
            logger.warning('Webhook secret not configured')
            return False

        # Create the payload string
        payload_str = json.dumps(payload, separators=(',', ':'))

        # Create the signature string
        signed_payload = f'{timestamp}.{payload_str}'

        # Calculate expected signature
        expected_signature = hmac.new(
            settings.DODO_WEBHOOK_SECRET.encode('utf-8'),
            signed_payload.encode('utf-8'),
            hashlib.sha256,
        ).hexdigest()

        return hmac.compare_digest(signature, expected_signature)

    async def _handle_payment_succeeded(
        self, db: AsyncSession, data: Dict[str, Any]
    ) -> None:
        payment_id = data.get('id')
        subscription_id = data.get('subscription_id')
        customer_email = data.get('customer', {}).get('email')
        metadata = data.get('metadata', {})

        organization_id = metadata.get('organization_id')
        plan_id = metadata.get('plan_id')

        if not organization_id:
            logger.warning(f'No organization_id in payment metadata: {payment_id}')
            return

        logger.info(
            f'Processing payment succeeded: {payment_id}, customer: {customer_email}'
        )

        # Update organization subscription
        organization = await subscription_service.get_organization_subscription(
            db, UUID(organization_id)
        )
        if not organization:
            logger.warning(f'Organization not found: {organization_id}')
            return

        # Update subscription details
        if plan_id == 'pro_monthly':
            organization.subscription_plan = SubscriptionPlanEnum.PRO_MONTHLY
        elif plan_id == 'pro_yearly':
            organization.subscription_plan = SubscriptionPlanEnum.PRO_YEARLY
        else:
            organization.subscription_plan = SubscriptionPlanEnum.PRO_MONTHLY
        organization.subscription_status = SUBSCRIPTION_STATUS['ACTIVE']
        organization.dodo_subscription_id = subscription_id
        organization.payment_status = PAYMENT_STATUS['SUCCEEDED']
        organization.last_payment_date = datetime.now(timezone.utc)
        organization.updated_at = datetime.now(timezone.utc)

        await db.commit()

        logger.info(
            f'Payment succeeded for organization {organization_id}',
            extra={
                'payment_id': payment_id,
                'subscription_id': subscription_id,
                'organization_id': organization_id,
                'customer_email': customer_email,
                'plan_id': plan_id,
            },
        )

    async def _handle_payment_failed(
        self, db: AsyncSession, data: Dict[str, Any]
    ) -> None:
        payment_id = data.get('id')
        metadata = data.get('metadata', {})
        organization_id = metadata.get('organization_id')

        if not organization_id:
            logger.warning(
                f'No organization_id in payment metadata for failed payment: {payment_id}'
            )
            return

        organization = await subscription_service.get_organization_subscription(
            db, UUID(organization_id)
        )
        if not organization:
            logger.warning(
                f'Organization not found for failed payment: {organization_id}'
            )
            return

        organization.payment_status = PAYMENT_STATUS['FAILED']
        organization.updated_at = datetime.now(timezone.utc)

        await db.commit()

        logger.info(
            f'Payment failed for organization {organization_id}, payment_id: {payment_id}'
        )

        # Send notification (dummy email function for now)
        customer_email = data.get('customer', {}).get('email')
        notification_service.send_payment_failed_email(
            to_email=customer_email,
            organization_id=str(organization_id),
            payment_id=payment_id,
        )

    async def _handle_payment_cancelled(
        self, db: AsyncSession, data: Dict[str, Any]
    ) -> None:
        payment_id = data.get('id')
        metadata = data.get('metadata', {})
        organization_id = metadata.get('organization_id')

        if not organization_id:
            logger.warning(
                f'No organization_id in payment metadata for cancelled payment: {payment_id}'
            )
            return

        organization = await subscription_service.get_organization_subscription(
            db, UUID(organization_id)
        )
        if not organization:
            logger.warning(
                f'Organization not found for cancelled payment: {organization_id}'
            )
            return

        organization.payment_status = PAYMENT_STATUS['CANCELLED']
        organization.updated_at = datetime.now(timezone.utc)

        await db.commit()

        logger.info(
            f'Payment cancelled for organization {organization_id}, payment_id: {payment_id}'
        )

    async def _handle_payment_processing(
        self, db: AsyncSession, data: Dict[str, Any]
    ) -> None:
        payment_id = data.get('id')
        metadata = data.get('metadata', {})
        organization_id = metadata.get('organization_id')

        if not organization_id:
            logger.warning(
                f'No organization_id in payment metadata for processing payment: {payment_id}'
            )
            return

        organization = await subscription_service.get_organization_subscription(
            db, UUID(organization_id)
        )
        if not organization:
            logger.warning(
                f'Organization not found for processing payment: {organization_id}'
            )
            return

        organization.payment_status = PAYMENT_STATUS['PROCESSING']
        organization.updated_at = datetime.now(timezone.utc)

        await db.commit()

        logger.info(
            f'Payment processing for organization {organization_id}, payment_id: {payment_id}'
        )

    async def _handle_subscription_created(
        self, db: AsyncSession, data: Dict[str, Any]
    ) -> None:
        subscription_id = data.get('id')
        customer_email = data.get('customer', {}).get('email')
        metadata = data.get('metadata', {})
        organization_id = metadata.get('organization_id')

        if not organization_id:
            logger.warning(
                f'No organization_id in subscription metadata: {subscription_id}'
            )
            return

        organization = await subscription_service.get_organization_subscription(
            db, UUID(organization_id)
        )
        if not organization:
            logger.warning(
                f'Organization not found for subscription created: {organization_id}'
            )
            return

        organization.dodo_subscription_id = subscription_id
        organization.subscription_status = SUBSCRIPTION_STATUS['ACTIVE']
        organization.updated_at = datetime.now(timezone.utc)

        await db.commit()

        logger.info(
            f'Subscription created for organization {organization_id}, subscription_id: {subscription_id}, customer: {customer_email}'
        )

    async def _handle_subscription_updated(
        self, db: AsyncSession, data: Dict[str, Any]
    ) -> None:
        subscription_id = data.get('id')
        status = data.get('status')
        metadata = data.get('metadata', {})
        organization_id = metadata.get('organization_id')

        if not organization_id:
            logger.warning(
                f'No organization_id in subscription metadata: {subscription_id}'
            )
            return

        organization = await subscription_service.get_organization_subscription(
            db, UUID(organization_id)
        )
        if not organization:
            logger.warning(
                f'Organization not found for subscription updated: {organization_id}'
            )
            return

        # Map Dodo status to our status
        status_mapping = {
            'active': SUBSCRIPTION_STATUS['ACTIVE'],
            'cancelled': SUBSCRIPTION_STATUS['CANCELLED'],
            'past_due': SUBSCRIPTION_STATUS['PAST_DUE'],
            'unpaid': SUBSCRIPTION_STATUS['UNPAID'],
            'incomplete': SUBSCRIPTION_STATUS['INCOMPLETE'],
            'trialing': SUBSCRIPTION_STATUS['TRIALING'],
        }

        organization.subscription_status = status_mapping.get(status, status)
        organization.updated_at = datetime.now(timezone.utc)

        await db.commit()

        logger.info(
            f'Subscription updated for organization {organization_id}, subscription_id: {subscription_id}, status: {status}'
        )

    async def _handle_subscription_cancelled(
        self, db: AsyncSession, data: Dict[str, Any]
    ) -> None:
        subscription_id = data.get('id')
        metadata = data.get('metadata', {})
        organization_id = metadata.get('organization_id')

        if not organization_id:
            logger.warning(
                f'No organization_id in subscription metadata: {subscription_id}'
            )
            return

        organization = await subscription_service.get_organization_subscription(
            db, UUID(organization_id)
        )
        if not organization:
            logger.warning(
                f'Organization not found for subscription cancelled: {organization_id}'
            )
            return

        organization.subscription_status = SUBSCRIPTION_STATUS['CANCELLED']
        organization.subscription_plan = 'free'
        organization.updated_at = datetime.now(timezone.utc)

        await db.commit()

        logger.info(
            f'Subscription cancelled for organization {organization_id}, subscription_id: {subscription_id}'
        )

    async def _handle_subscription_active(
        self, db: AsyncSession, data: Dict[str, Any]
    ) -> None:
        subscription_id = data.get('id')
        metadata = data.get('metadata', {})
        organization_id = metadata.get('organization_id')

        if not organization_id:
            logger.warning(
                f'No organization_id in subscription metadata: {subscription_id}'
            )
            return

        organization = await subscription_service.get_organization_subscription(
            db, UUID(organization_id)
        )
        if not organization:
            logger.warning(
                f'Organization not found for subscription active: {organization_id}'
            )
            return

        organization.dodo_subscription_id = subscription_id
        organization.subscription_status = SUBSCRIPTION_STATUS['ACTIVE']
        organization.updated_at = datetime.now(timezone.utc)

        await db.commit()

        logger.info(
            f'Subscription active for organization {organization_id}, subscription_id: {subscription_id}'
        )

    async def _handle_subscription_expired(
        self, db: AsyncSession, data: Dict[str, Any]
    ) -> None:
        subscription_id = data.get('id')
        metadata = data.get('metadata', {})
        organization_id = metadata.get('organization_id')

        if not organization_id:
            logger.warning(
                f'No organization_id in subscription metadata: {subscription_id}'
            )
            return

        organization = await subscription_service.get_organization_subscription(
            db, UUID(organization_id)
        )
        if not organization:
            logger.warning(
                f'Organization not found for subscription expired: {organization_id}'
            )
            return

        organization.subscription_status = SUBSCRIPTION_STATUS['CANCELLED']
        organization.subscription_plan = 'free'
        organization.updated_at = datetime.now(timezone.utc)

        await db.commit()

        logger.info(
            f'Subscription expired for organization {organization_id}, subscription_id: {subscription_id}'
        )

    async def _handle_subscription_failed(
        self, db: AsyncSession, data: Dict[str, Any]
    ) -> None:
        subscription_id = data.get('id')
        metadata = data.get('metadata', {})
        organization_id = metadata.get('organization_id')

        if not organization_id:
            logger.warning(
                f'No organization_id in subscription metadata: {subscription_id}'
            )
            return

        organization = await subscription_service.get_organization_subscription(
            db, UUID(organization_id)
        )
        if not organization:
            logger.warning(
                f'Organization not found for subscription failed: {organization_id}'
            )
            return

        organization.subscription_status = SUBSCRIPTION_STATUS['CANCELLED']
        organization.subscription_plan = 'free'
        organization.updated_at = datetime.now(timezone.utc)

        await db.commit()

        logger.info(
            f'Subscription failed for organization {organization_id}, subscription_id: {subscription_id}'
        )

        # Send notification (dummy email function for now)
        customer_email = data.get('customer', {}).get('email')
        notification_service.send_subscription_failed_email(
            to_email=customer_email,
            organization_id=str(organization_id),
            subscription_id=subscription_id,
        )

    async def _handle_subscription_renewed(
        self, db: AsyncSession, data: Dict[str, Any]
    ) -> None:
        subscription_id = data.get('id')
        metadata = data.get('metadata', {})
        organization_id = metadata.get('organization_id')

        if not organization_id:
            logger.warning(
                f'No organization_id in subscription metadata: {subscription_id}'
            )
            return

        organization = await subscription_service.get_organization_subscription(
            db, UUID(organization_id)
        )
        if not organization:
            logger.warning(
                f'Organization not found for subscription renewed: {organization_id}'
            )
            return

        organization.subscription_status = SUBSCRIPTION_STATUS['ACTIVE']
        organization.last_payment_date = datetime.now(timezone.utc)
        organization.updated_at = datetime.now(timezone.utc)

        await db.commit()

        logger.info(
            f'Subscription renewed for organization {organization_id}, subscription_id: {subscription_id}'
        )

    async def cancel_subscription(
        self, db: AsyncSession, organization_id: UUID
    ) -> bool:
        if not self.client:
            raise ValueError('Dodo Payments client not initialized')

        organization = await subscription_service.get_organization_subscription(
            db, organization_id
        )
        if not organization or not organization.dodo_subscription_id:
            return False

        try:
            # Cancel subscription in Dodo
            self.client.subscriptions.update(
                organization.dodo_subscription_id, status='cancelled'
            )

            organization.subscription_status = SUBSCRIPTION_STATUS['CANCELLED']
            organization.subscription_plan = 'free'
            organization.updated_at = datetime.now(timezone.utc)

            await db.commit()

            logger.info(f'Cancelled subscription for organization {organization_id}')
            return True

        except Exception as e:
            logger.error(f'Failed to cancel subscription: {str(e)}')
            return False

    async def schedule_subscription_cancellation(
        self,
        db: AsyncSession,
        organization_id: UUID,
        grace_period_hours: int = 3,
    ) -> bool:
        """Mark org for cancellation after a grace period. Does not call Dodo immediately."""
        from app.services.subscription_service import subscription_service

        organization = await subscription_service.get_organization_subscription(
            db, organization_id
        )
        if not organization:
            raise ValueError('Organization not found')

        organization.subscription_status = SUBSCRIPTION_STATUS['ACTIVE']
        organization.subscription_ends_at = datetime.now(timezone.utc) + timedelta(
            hours=grace_period_hours
        )
        organization.updated_at = datetime.now(timezone.utc)
        await db.commit()
        logger.info(
            f'Scheduled subscription cancellation for organization {organization_id} after {grace_period_hours} hours'
        )
        return True

    async def undo_scheduled_cancellation(
        self, db: AsyncSession, organization_id: UUID
    ) -> bool:
        """Undo a scheduled cancellation if within grace period."""
        from app.services.subscription_service import subscription_service

        organization = await subscription_service.get_organization_subscription(
            db, organization_id
        )
        if not organization:
            raise ValueError('Organization not found')

        organization.subscription_ends_at = None
        organization.updated_at = datetime.now(timezone.utc)
        await db.commit()
        logger.info(
            f'Cancelled scheduled subscription cancellation for organization {organization_id}'
        )
        return True

    async def change_subscription_plan(
        self,
        db: AsyncSession,
        organization_id: UUID,
        new_plan_id: str,
        proration_billing_mode: str = 'difference_immediately',
        quantity: int = 1,
    ) -> bool:
        """Change Dodo subscription plan for an organization."""
        if not self.client:
            raise ValueError('Dodo Payments client not initialized')

        plan = get_plan_by_id(new_plan_id)
        if not plan or not plan.get('dodo_product_id'):
            raise ValueError(f'Invalid plan ID: {new_plan_id}')

        from app.services.subscription_service import subscription_service

        organization = await subscription_service.get_organization_subscription(
            db, organization_id
        )
        if not organization or not organization.dodo_subscription_id:
            raise ValueError('Active subscription not found for organization')

        try:
            self.client.subscriptions.change_plan(
                subscription_id=organization.dodo_subscription_id,
                product_id=plan['dodo_product_id'],
                proration_billing_mode=proration_billing_mode,
                quantity=quantity,
            )

            # Update local state optimistically; webhook will reconcile
            if new_plan_id == 'pro_monthly':
                organization.subscription_plan = SubscriptionPlanEnum.PRO_MONTHLY
            elif new_plan_id == 'pro_yearly':
                organization.subscription_plan = SubscriptionPlanEnum.PRO_YEARLY
            else:
                organization.subscription_plan = SubscriptionPlanEnum.PRO_MONTHLY
            organization.updated_at = datetime.now(timezone.utc)
            await db.commit()

            logger.info(
                f'Changed plan for organization {organization_id} to {new_plan_id}'
            )
            return True
        except Exception as e:
            logger.error(
                f'Failed to change plan for organization {organization_id}: {str(e)}'
            )
            return False


payment_service = PaymentService()
