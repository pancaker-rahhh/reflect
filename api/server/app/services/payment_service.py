import hashlib
import hmac
import json
from typing import Dict, Any, Optional
from uuid import UUID
from datetime import datetime, timezone, timedelta
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.settings import get_settings
from app.core.logging import get_logger
from app.core.subscription_plans import (
    get_plan_by_id,
    get_plan_by_dodo_product_id,
    PAYMENT_STATUS,
    SUBSCRIPTION_STATUS,
)
from app.services.subscription_service import subscription_service
from app.models.organization_model import SubscriptionPlanEnum
from dodopayments import DodoPayments
from app.services.notification_service import notification_service
import base64

logger = get_logger(__name__)
settings = get_settings()


class PaymentService:
    def __init__(self):
        self.client = None
        if DodoPayments:
            api_key: Optional[str] = None
            if settings.DODO_TEST_API_KEY and settings.DODO_TEST_API_KEY.strip():
                api_key = settings.DODO_TEST_API_KEY
                # Use test environment only when test key is present
                self.client = DodoPayments(
                    bearer_token=api_key,
                    environment='test_mode',
                )
            elif settings.DODO_API_KEY and settings.DODO_API_KEY.strip():
                api_key = settings.DODO_API_KEY
                self.client = DodoPayments(bearer_token=api_key)

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
        self,
        db: AsyncSession,
        payload: Dict[str, Any],
        signature: str,
        timestamp: str,
        webhook_id: Optional[str] = None,
        raw_body: Optional[str] = None,
    ) -> bool:
        if not self._verify_webhook_signature(
            payload, signature, timestamp, webhook_id, raw_body
        ):
            logger.error('Invalid webhook signature')
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
            elif event_type == 'subscription.created':
                await self._handle_subscription_created(db, data)
            elif event_type == 'subscription.updated':
                await self._handle_subscription_updated(db, data)
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
            elif event_type == 'subscription.plan_changed':
                await self._handle_subscription_plan_changed(db, data)
            else:
                logger.info(f'Unhandled webhook event type: {event_type}')

            return True

        except Exception as e:
            logger.error(f'Failed to process webhook: {str(e)}')
            return False

    def _verify_webhook_signature(
        self,
        payload: Dict[str, Any],
        signature: str,
        timestamp: str,
        webhook_id: Optional[str] = None,
        raw_body: Optional[str] = None,
    ) -> bool:
        secret: Optional[str] = None
        if (
            getattr(settings, 'DODO_TEST_API_KEY', None)
            and getattr(settings, 'DODO_TEST_API_KEY').strip()
        ):
            test_secret = getattr(settings, 'DODO_TEST_WEBHOOK_SECRET', '')
            if isinstance(test_secret, str) and test_secret.strip():
                secret = test_secret
        if not secret:
            secret = settings.DODO_WEBHOOK_SECRET

        if not secret or not str(secret).strip():
            logger.warning('Webhook secret not configured')
            return False

        secret_key = secret
        if secret.startswith('whsec_'):
            try:
                secret_key = base64.b64decode(secret[6:])
            except Exception as e:
                logger.error(f'Failed to decode webhook secret: {str(e)}')
                return False
        else:
            secret_key = secret.encode('utf-8')

        provided_sig = signature or ''
        if ',' in provided_sig:
            provided_sig = provided_sig.split(',', 1)[1]
        if provided_sig.lower().startswith('sha256='):
            provided_sig = provided_sig.split('=', 1)[1]
        provided_sig = provided_sig.strip()

        # Use exact raw body if provided (required for HMAC to match)
        payload_str = (
            raw_body
            if isinstance(raw_body, str) and raw_body != ''
            else json.dumps(payload, separators=(',', ':'))
        )

        if not webhook_id:
            logger.warning('Webhook ID missing, cannot verify signature')
            return False

        # According to Dodo docs: concatenate webhook-id, webhook-timestamp, and payload with periods
        signed_payload = f'{webhook_id}.{timestamp}.{payload_str}'

        # Compute HMAC SHA256
        digest = hmac.new(
            secret_key, signed_payload.encode('utf-8'), hashlib.sha256
        ).digest()

        expected_b64 = base64.b64encode(digest).decode('ascii')
        if hmac.compare_digest(provided_sig, expected_b64):
            logger.info('Webhook signature verified successfully')
            return True

        # Try hex format for compatibility
        expected_hex = digest.hex()
        if hmac.compare_digest(provided_sig.lower(), expected_hex.lower()):
            logger.info('Webhook signature verified (hex format)')
            return True

        # Log signature mismatch details for debugging
        logger.error(
            'Webhook signature mismatch - debugging info',
            extra={
                'webhook_id': webhook_id,
                'timestamp': timestamp,
                'provided_sig': provided_sig,
                'expected_b64': expected_b64,
                'expected_hex': expected_hex[:16] + '...',
                'signed_payload_preview': signed_payload[:200] + '...'
                if len(signed_payload) > 200
                else signed_payload,
                'payload_length': len(payload_str),
                'payload_first_50_chars': payload_str[:50],
                'secret_configured': 'yes' if secret else 'no',
                'secret_has_whsec_prefix': secret.startswith('whsec_')
                if secret
                else False,
                'using_test_secret': bool(
                    getattr(settings, 'DODO_TEST_API_KEY', None)
                    and getattr(settings, 'DODO_TEST_API_KEY').strip()
                ),
            },
        )
        return False

    async def _handle_payment_succeeded(
        self, db: AsyncSession, data: Dict[str, Any]
    ) -> None:
        payment_id = data.get('payment_id') or data.get('id')
        subscription_id = data.get('subscription_id')
        customer_email = data.get('customer', {}).get('email')
        metadata = data.get('metadata', {})

        organization_id = metadata.get('organization_id')
        plan_id = metadata.get('plan_id')

        # If metadata is empty, try to find organization by customer email
        if not organization_id and customer_email:
            logger.info(
                f'Metadata empty, looking up organization by email: {customer_email}'
            )
            from app.repositories.organization_repository import organization_repository
            from app.repositories.user_repository import user_repository

            user = await user_repository.get_by_email(db, customer_email)
            if user:
                organizations = await organization_repository.get_user_organizations(
                    db, user.id, limit=1
                )
                if organizations:
                    organization_id = str(organizations[0].id)
                    logger.info(
                        f'Found organization {organization_id} for user {customer_email}'
                    )

        if not organization_id:
            logger.warning(
                f'No organization_id found for payment: {payment_id}, email: {customer_email}'
            )
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

        # Update subscription details based on product
        # Default to monthly if no plan_id specified
        if plan_id == 'pro_yearly':
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
                'plan_id': plan_id or 'pro_monthly',
            },
        )

    async def _handle_payment_failed(
        self, db: AsyncSession, data: Dict[str, Any]
    ) -> None:
        payment_id = data.get('payment_id') or data.get('id')
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

        # If metadata is empty, try to find organization by customer email
        if not organization_id and customer_email:
            logger.info(
                f'Metadata empty, looking up organization by email: {customer_email}'
            )
            from app.repositories.organization_repository import organization_repository
            from app.repositories.user_repository import user_repository

            # Find user by email
            user = await user_repository.get_by_email(db, customer_email)
            if user:
                # Get user's organizations
                organizations = await organization_repository.get_user_organizations(
                    db, user.id, limit=1
                )
                if organizations:
                    organization_id = str(organizations[0].id)
                    logger.info(
                        f'Found organization {organization_id} for user {customer_email}'
                    )

        if not organization_id:
            logger.warning(
                f'No organization_id found for subscription: {subscription_id}, email: {customer_email}'
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

        organization.subscription_status = SUBSCRIPTION_STATUS['EXPIRED']
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
        customer_email = data.get('customer', {}).get('email')
        organization_id = metadata.get('organization_id')

        # If metadata is empty, try to find organization by customer email
        if not organization_id and customer_email:
            logger.info(
                f'Metadata empty, looking up organization by email: {customer_email}'
            )
            from app.repositories.organization_repository import organization_repository
            from app.repositories.user_repository import user_repository

            # Find user by email
            user = await user_repository.get_by_email(db, customer_email)
            if user:
                # Get user's organizations
                organizations = await organization_repository.get_user_organizations(
                    db, user.id, limit=1
                )
                if organizations:
                    organization_id = str(organizations[0].id)
                    logger.info(
                        f'Found organization {organization_id} for user {customer_email}'
                    )

        if not organization_id:
            logger.warning(
                f'No organization_id found for subscription: {subscription_id}, email: {customer_email}'
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

    async def _handle_subscription_plan_changed(
        self, db: AsyncSession, data: Dict[str, Any]
    ) -> None:
        subscription_id = data.get('id')
        metadata = data.get('metadata', {})
        organization_id = metadata.get('organization_id')
        product_id = data.get('product_id')

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
                f'Organization not found for subscription plan changed: {organization_id}'
            )
            return

        # Map Dodo product_id back to our plan id
        plan = get_plan_by_dodo_product_id(product_id) if product_id else None
        if plan:
            plan_id = plan['id']
            if plan_id == 'pro_monthly':
                organization.subscription_plan = SubscriptionPlanEnum.PRO_MONTHLY
            elif plan_id == 'pro_yearly':
                organization.subscription_plan = SubscriptionPlanEnum.PRO_YEARLY
            else:
                organization.subscription_plan = SubscriptionPlanEnum.PRO_MONTHLY
            organization.updated_at = datetime.now(timezone.utc)
            await db.commit()

            logger.info(
                'Subscription plan changed via webhook',
                extra={
                    'organization_id': organization_id,
                    'subscription_id': subscription_id,
                    'dodo_product_id': product_id,
                    'plan_id': plan_id,
                },
            )
        else:
            logger.warning(
                'Unknown product_id in subscription.plan_changed',
                extra={'organization_id': organization_id, 'product_id': product_id},
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
        organization.subscription_status = 'active'
        organization.updated_at = datetime.now(timezone.utc)
        await db.commit()
        logger.info(
            f'Cancelled scheduled subscription cancellation for organization {organization_id}'
        )
        return True

    async def request_cancel_at_period_end(
        self, db: AsyncSession, organization_id: UUID
    ) -> Optional[datetime]:
        """Request subscription cancellation at the next billing date.

        - Sends a PATCH to Dodo to set cancel_at_next_billing_date=true
        - Updates local Organization:
          subscription_status -> cancelled
          subscription_ends_at -> next billing date (from Dodo response)

        Returns the next billing date if successful, else None.
        """
        organization = await subscription_service.get_organization_subscription(
            db, organization_id
        )
        if not organization:
            raise ValueError('Organization not found')

        # Check if we can reach Dodo
        if not self.client or not organization.dodo_subscription_id:
            # Only use fallback in development/test - fail in production
            if settings.ENV in ['development', 'test']:
                logger.warning(
                    'Dodo client not initialized or no subscription ID - using fallback cancellation (DEV MODE)',
                    extra={'organization_id': str(organization_id)},
                )
                # Calculate next billing date as 30 days from now for monthly, or 1 year for yearly
                plan = organization.subscription_plan
                if 'yearly' in plan.lower():
                    next_billing_date = datetime.now(timezone.utc) + timedelta(days=365)
                else:
                    next_billing_date = datetime.now(timezone.utc) + timedelta(days=30)

                organization.subscription_status = SUBSCRIPTION_STATUS['CANCELLED']
                organization.subscription_ends_at = next_billing_date
                organization.updated_at = datetime.now(timezone.utc)
                await db.commit()

                logger.info(
                    'Fallback cancellation scheduled (DEV MODE)',
                    extra={
                        'organization_id': str(organization_id),
                        'subscription_ends_at': next_billing_date.isoformat(),
                    },
                )
                return next_billing_date
            else:
                raise ValueError(
                    'Dodo Payments client not initialized or no active subscription'
                )

        try:
            response = self.client.subscriptions.update(
                subscription_id=organization.dodo_subscription_id,
                cancel_at_next_billing_date=True,
            )

            next_billing_date = self._extract_next_billing_date(response)

            organization.subscription_status = SUBSCRIPTION_STATUS['CANCELLED']
            organization.subscription_ends_at = next_billing_date
            organization.updated_at = datetime.now(timezone.utc)
            await db.commit()

            logger.info(
                'Requested cancel at period end for organization',
                extra={
                    'organization_id': str(organization_id),
                    'dodo_subscription_id': organization.dodo_subscription_id,
                    'subscription_ends_at': next_billing_date.isoformat()
                    if next_billing_date
                    else None,
                },
            )

            return next_billing_date
        except Exception as e:
            # Only use fallback in development/test - fail loudly in production
            if settings.ENV in ['development', 'test']:
                logger.warning(
                    'Dodo API call failed, using fallback cancellation (DEV MODE)',
                    extra={
                        'organization_id': str(organization_id),
                        'dodo_subscription_id': organization.dodo_subscription_id,
                        'error': str(e),
                    },
                )
                # Fallback: set local cancellation date
                plan = organization.subscription_plan
                if 'yearly' in plan.lower():
                    next_billing_date = datetime.now(timezone.utc) + timedelta(days=365)
                else:
                    next_billing_date = datetime.now(timezone.utc) + timedelta(days=30)

                organization.subscription_status = SUBSCRIPTION_STATUS['CANCELLED']
                organization.subscription_ends_at = next_billing_date
                organization.updated_at = datetime.now(timezone.utc)
                await db.commit()

                logger.info(
                    'Fallback cancellation scheduled after Dodo failure (DEV MODE)',
                    extra={
                        'organization_id': str(organization_id),
                        'subscription_ends_at': next_billing_date.isoformat(),
                    },
                )
                return next_billing_date
            else:
                logger.error(
                    'Failed to cancel subscription via Dodo Payments',
                    extra={
                        'organization_id': str(organization_id),
                        'dodo_subscription_id': organization.dodo_subscription_id,
                        'error': str(e),
                    },
                )
                raise

    def _extract_next_billing_date(self, response: Any) -> Optional[datetime]:
        """Parse next billing date from Dodo's base64-encoded response.data."""
        try:
            if not isinstance(response, dict):
                return None
            resp = response.get('response')
            if not isinstance(resp, dict):
                return None
            data = resp.get('data')
            if not isinstance(data, str):
                return None

            decoded = base64.b64decode(data).decode('utf-8')
            payload = json.loads(decoded)

            date_str: Optional[str] = payload.get('next_billing_date') or payload.get(
                'expires_at'
            )
            if not isinstance(date_str, str):
                return None

            normalized = date_str.replace('Z', '+00:00')
            return datetime.fromisoformat(normalized)
        except Exception:
            return None

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

    async def list_payments(
        self,
        db: AsyncSession,
        organization_id: UUID,
        *,
        created_at_gte: Optional[str] = None,
        created_at_lte: Optional[str] = None,
        page_size: Optional[int] = None,
        page_number: Optional[int] = None,
        subscription_id: Optional[str] = None,
        customer_id: Optional[str] = None,
        status: Optional[str] = None,
    ) -> Dict[str, Any]:
        """List payments from Dodo Payments for an organization.

        If `customer_id` or `subscription_id` are not provided, this method
        will use values stored on the organization when available.
        """
        if not self.client:
            raise ValueError('Dodo Payments client not initialized')

        from app.services.subscription_service import subscription_service

        org = await subscription_service.get_organization_subscription(
            db, organization_id
        )
        if not org:
            raise ValueError('Organization not found')

        final_customer_id = customer_id or getattr(org, 'dodo_customer_id', None)
        final_subscription_id = subscription_id or getattr(
            org, 'dodo_subscription_id', None
        )

        try:
            page = self.client.payments.list(
                created_at_gte=created_at_gte if created_at_gte else None,
                created_at_lte=created_at_lte if created_at_lte else None,
                page_size=page_size if page_size is not None else None,
                page_number=page_number if page_number is not None else None,
                subscription_id=final_subscription_id
                if final_subscription_id
                else None,
                customer_id=final_customer_id if final_customer_id else None,
                status=status if status else None,
            )

            items = getattr(page, 'items', []) or []
            return {
                'items': [
                    {
                        'brand_id': getattr(item, 'brand_id', None),
                        'created_at': getattr(item, 'created_at', None),
                        'currency': getattr(item, 'currency', None),
                        'customer': (
                            getattr(item, 'customer', None).to_dict()  # type: ignore[attr-defined]
                            if getattr(item, 'customer', None)
                            and hasattr(getattr(item, 'customer'), 'to_dict')
                            else getattr(item, 'customer', None)
                        ),
                        'digital_products_delivered': getattr(
                            item, 'digital_products_delivered', None
                        ),
                        'metadata': getattr(item, 'metadata', None) or {},
                        'payment_id': getattr(item, 'payment_id', None),
                        'payment_method': getattr(item, 'payment_method', None),
                        'payment_method_type': getattr(
                            item, 'payment_method_type', None
                        ),
                        'status': getattr(item, 'status', None),
                        'subscription_id': getattr(item, 'subscription_id', None),
                        'total_amount': getattr(item, 'total_amount', None),
                    }
                    for item in items
                ],
                'page_number': page_number or 0,
                'page_size': page_size or 10,
            }
        except Exception as e:
            logger.error(
                'Failed to list payments',
                extra={
                    'organization_id': str(organization_id),
                    'error': str(e),
                },
            )
            raise

    async def get_payment_invoice_pdf(
        self,
        payment_id: str,
    ) -> bytes:
        """Fetch invoice PDF bytes for a given payment id from Dodo Payments."""
        if not self.client:
            raise ValueError('Dodo Payments client not initialized')

        if not payment_id or not isinstance(payment_id, str):
            raise ValueError('payment_id must be a non-empty string')

        try:
            resp = self.client.invoices.payments.retrieve(payment_id)

            content = resp.read()
            if not isinstance(content, (bytes, bytearray)):
                return bytes(str(content), 'utf-8')
            return content
        except Exception as e:
            logger.error(
                'Failed to fetch payment invoice PDF',
                extra={'payment_id': payment_id, 'error': str(e)},
            )
            raise


payment_service = PaymentService()
