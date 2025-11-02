import pytest
from unittest.mock import Mock, patch
from uuid import uuid4
import base64
import json
import hmac
import hashlib

from app.services.payment_service import PaymentService, ProrationBillingMode
from app.models.organization_model import SubscriptionPlanEnum, PaymentStatusEnum


@pytest.fixture
def payment_service_instance():
    return PaymentService()


@pytest.fixture
def mock_dodo_client_for_service(monkeypatch):
    mock_client = Mock()
    mock_client.subscriptions = Mock()
    mock_client.payments = Mock()
    mock_client.invoices = Mock()
    with patch('app.services.payment_service.DodoPayments', return_value=mock_client):
        yield mock_client


class TestCreatePaymentLink:
    @pytest.mark.asyncio
    async def test_success_with_valid_plan_pro_monthly(
        self,
        payment_service_instance,
        async_db_session,
        test_organization,
        mock_dodo_client_for_service,
    ):
        payment_service_instance.client = mock_dodo_client_for_service
        user_details = {
            'email': 'test@example.com',
            'firstName': 'Test',
            'lastName': 'User',
            'country': 'US',
        }
        result = await payment_service_instance.create_payment_link(
            db=async_db_session,
            organization_id=test_organization.id,
            plan_id='pro_monthly',
            user_details=user_details,
        )
        assert 'payment_link' in result
        assert 'checkout.dodopayments.com' in result['payment_link']
        assert result['plan_id'] == 'pro_monthly'
        assert result['organization_id'] == str(test_organization.id)

    @pytest.mark.asyncio
    async def test_success_with_valid_plan_pro_yearly(
        self,
        payment_service_instance,
        async_db_session,
        test_organization,
        mock_dodo_client_for_service,
    ):
        payment_service_instance.client = mock_dodo_client_for_service
        user_details = {
            'email': 'test@example.com',
            'firstName': 'Test',
            'lastName': 'User',
            'country': 'US',
        }
        result = await payment_service_instance.create_payment_link(
            db=async_db_session,
            organization_id=test_organization.id,
            plan_id='pro_yearly',
            user_details=user_details,
        )
        assert result['plan_id'] == 'pro_yearly'
        assert 'payment_link' in result

    @pytest.mark.asyncio
    async def test_invalid_plan_id(
        self, payment_service_instance, async_db_session, test_organization
    ):
        payment_service_instance.client = Mock()
        user_details = {
            'email': 'test@example.com',
            'firstName': 'Test',
            'lastName': 'User',
            'country': 'US',
        }
        with pytest.raises(ValueError, match='Invalid plan ID'):
            await payment_service_instance.create_payment_link(
                db=async_db_session,
                organization_id=test_organization.id,
                plan_id='invalid_plan',
                user_details=user_details,
            )

    @pytest.mark.asyncio
    async def test_missing_organization(
        self, payment_service_instance, async_db_session, mock_dodo_client_for_service
    ):
        payment_service_instance.client = mock_dodo_client_for_service
        user_details = {
            'email': 'test@example.com',
            'firstName': 'Test',
            'lastName': 'User',
            'country': 'US',
        }
        with pytest.raises(ValueError, match='Organization not found'):
            await payment_service_instance.create_payment_link(
                db=async_db_session,
                organization_id=uuid4(),
                plan_id='pro_monthly',
                user_details=user_details,
            )

    @pytest.mark.asyncio
    async def test_dodo_client_not_initialized(
        self, payment_service_instance, async_db_session, test_organization
    ):
        payment_service_instance.client = None
        user_details = {
            'email': 'test@example.com',
            'firstName': 'Test',
            'lastName': 'User',
            'country': 'US',
        }
        with pytest.raises(ValueError, match='Dodo Payments client not initialized'):
            await payment_service_instance.create_payment_link(
                db=async_db_session,
                organization_id=test_organization.id,
                plan_id='pro_monthly',
                user_details=user_details,
            )

    @pytest.mark.asyncio
    async def test_metadata_in_checkout_url(
        self,
        payment_service_instance,
        async_db_session,
        test_organization,
        mock_dodo_client_for_service,
    ):
        payment_service_instance.client = mock_dodo_client_for_service
        user_details = {
            'email': 'test@example.com',
            'firstName': 'Test',
            'lastName': 'User',
            'country': 'US',
        }
        result = await payment_service_instance.create_payment_link(
            db=async_db_session,
            organization_id=test_organization.id,
            plan_id='pro_monthly',
            user_details=user_details,
        )
        assert 'metadata[organization_id]' in result['payment_link']
        assert 'metadata[plan_id]' in result['payment_link']


class TestWebhookSignatureVerification:
    def test_valid_hmac_signature_base64(
        self, payment_service_instance, mock_webhook_secret
    ):
        webhook_id = 'test_webhook_123'
        timestamp = '1234567890'
        payload_str = '{"type":"payment.succeeded","data":{}}'
        signed_payload = f'{webhook_id}.{timestamp}.{payload_str}'
        secret_key = mock_webhook_secret.encode('utf-8')
        digest = hmac.new(
            secret_key, signed_payload.encode('utf-8'), hashlib.sha256
        ).digest()
        expected_sig = base64.b64encode(digest).decode('ascii')
        payload = json.loads(payload_str)
        result = payment_service_instance._verify_webhook_signature(
            payload=payload,
            signature=expected_sig,
            timestamp=timestamp,
            webhook_id=webhook_id,
            raw_body=payload_str,
        )
        assert result is True

    def test_valid_hmac_signature_hex(
        self, payment_service_instance, mock_webhook_secret
    ):
        webhook_id = 'test_webhook_123'
        timestamp = '1234567890'
        payload_str = '{"type":"payment.succeeded","data":{}}'
        signed_payload = f'{webhook_id}.{timestamp}.{payload_str}'
        secret_key = mock_webhook_secret.encode('utf-8')
        digest = hmac.new(
            secret_key, signed_payload.encode('utf-8'), hashlib.sha256
        ).digest()
        expected_sig = digest.hex()
        payload = json.loads(payload_str)
        result = payment_service_instance._verify_webhook_signature(
            payload=payload,
            signature=expected_sig,
            timestamp=timestamp,
            webhook_id=webhook_id,
            raw_body=payload_str,
        )
        assert result is True

    def test_invalid_signature_rejection(
        self, payment_service_instance, mock_webhook_secret
    ):
        payload = {'type': 'payment.succeeded', 'data': {}}
        result = payment_service_instance._verify_webhook_signature(
            payload=payload,
            signature='invalid_signature',
            timestamp='1234567890',
            webhook_id='test_webhook_123',
            raw_body='{"type":"payment.succeeded","data":{}}',
        )
        assert result is False

    def test_missing_webhook_secret(self, payment_service_instance):
        with patch('app.services.payment_service.settings.DODO_WEBHOOK_SECRET', ''):
            payload = {'type': 'payment.succeeded', 'data': {}}
            result = payment_service_instance._verify_webhook_signature(
                payload=payload,
                signature='test',
                timestamp='1234567890',
                webhook_id='test_webhook_123',
            )
            assert result is False

    def test_signature_with_sha256_prefix(
        self, payment_service_instance, mock_webhook_secret
    ):
        webhook_id = 'test_webhook_123'
        timestamp = '1234567890'
        payload_str = '{"type":"payment.succeeded","data":{}}'
        signed_payload = f'{webhook_id}.{timestamp}.{payload_str}'
        secret_key = mock_webhook_secret.encode('utf-8')
        digest = hmac.new(
            secret_key, signed_payload.encode('utf-8'), hashlib.sha256
        ).digest()
        expected_sig = base64.b64encode(digest).decode('ascii')
        payload = json.loads(payload_str)
        result = payment_service_instance._verify_webhook_signature(
            payload=payload,
            signature=f'sha256={expected_sig}',
            timestamp=timestamp,
            webhook_id=webhook_id,
            raw_body=payload_str,
        )
        assert result is True

    def test_missing_webhook_id(self, payment_service_instance, mock_webhook_secret):
        payload = {'type': 'payment.succeeded', 'data': {}}
        result = payment_service_instance._verify_webhook_signature(
            payload=payload,
            signature='test',
            timestamp='1234567890',
            webhook_id=None,
        )
        assert result is False


class TestWebhookEventHandlers:
    @pytest.mark.asyncio
    async def test_payment_succeeded_handler(
        self, payment_service_instance, async_db_session, test_organization
    ):
        data = {
            'payment_id': 'pay_123',
            'subscription_id': 'sub_123',
            'customer': {'email': 'test@example.com'},
            'metadata': {
                'organization_id': str(test_organization.id),
                'plan_id': 'pro_monthly',
            },
        }
        await payment_service_instance._handle_payment_succeeded(async_db_session, data)
        await async_db_session.refresh(test_organization)
        assert test_organization.subscription_plan == SubscriptionPlanEnum.PRO_MONTHLY
        assert test_organization.subscription_status == 'active'
        assert test_organization.payment_status == PaymentStatusEnum.SUCCEEDED
        assert test_organization.dodo_subscription_id == 'sub_123'
        assert test_organization.last_payment_date is not None

    @pytest.mark.asyncio
    async def test_payment_failed_handler(
        self, payment_service_instance, async_db_session, test_organization
    ):
        data = {
            'payment_id': 'pay_123',
            'metadata': {'organization_id': str(test_organization.id)},
            'customer': {'email': 'test@example.com'},
        }
        with patch('app.services.payment_service.notification_service') as mock_notif:
            await payment_service_instance._handle_payment_failed(
                async_db_session, data
            )
            await async_db_session.refresh(test_organization)
            assert test_organization.payment_status == PaymentStatusEnum.FAILED
            mock_notif.send_payment_failed_email.assert_called_once()

    @pytest.mark.asyncio
    async def test_subscription_cancelled_handler(
        self,
        payment_service_instance,
        async_db_session,
        test_organization_with_subscription,
    ):
        data = {
            'id': 'sub_123',
            'metadata': {
                'organization_id': str(test_organization_with_subscription.id)
            },
        }
        await payment_service_instance._handle_subscription_cancelled(
            async_db_session, data
        )
        await async_db_session.refresh(test_organization_with_subscription)
        assert test_organization_with_subscription.subscription_status == 'cancelled'
        assert (
            test_organization_with_subscription.subscription_plan
            == SubscriptionPlanEnum.FREE
        )

    @pytest.mark.asyncio
    async def test_subscription_renewed_handler(
        self,
        payment_service_instance,
        async_db_session,
        test_organization_with_subscription,
    ):
        data = {
            'id': 'sub_123',
            'metadata': {
                'organization_id': str(test_organization_with_subscription.id)
            },
            'customer': {'email': 'test@example.com'},
        }
        await payment_service_instance._handle_subscription_renewed(
            async_db_session, data
        )
        await async_db_session.refresh(test_organization_with_subscription)
        assert test_organization_with_subscription.subscription_status == 'active'
        assert test_organization_with_subscription.last_payment_date is not None


class TestSubscriptionManagement:
    @pytest.mark.asyncio
    async def test_cancel_subscription_success(
        self,
        payment_service_instance,
        async_db_session,
        test_organization_with_subscription,
        mock_dodo_client_for_service,
    ):
        payment_service_instance.client = mock_dodo_client_for_service
        result = await payment_service_instance.cancel_subscription(
            async_db_session, test_organization_with_subscription.id
        )
        assert result is True
        await async_db_session.refresh(test_organization_with_subscription)
        assert test_organization_with_subscription.subscription_status == 'cancelled'

    @pytest.mark.asyncio
    async def test_change_subscription_plan_success(
        self,
        payment_service_instance,
        async_db_session,
        test_organization_with_subscription,
        mock_dodo_client_for_service,
    ):
        payment_service_instance.client = mock_dodo_client_for_service
        result = await payment_service_instance.change_subscription_plan(
            db=async_db_session,
            organization_id=test_organization_with_subscription.id,
            new_plan_id='pro_yearly',
            proration_billing_mode=ProrationBillingMode.DIFFERENCE_IMMEDIATELY,
            quantity=1,
        )
        assert result is True
        await async_db_session.refresh(test_organization_with_subscription)
        assert (
            test_organization_with_subscription.subscription_plan
            == SubscriptionPlanEnum.PRO_YEARLY
        )
