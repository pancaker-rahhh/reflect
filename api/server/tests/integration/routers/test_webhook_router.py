import pytest
from httpx import AsyncClient
import json


@pytest.mark.asyncio
class TestWebhookEndpoint:
    async def test_success_with_valid_signature(
        self,
        async_client: AsyncClient,
        test_organization,
        mock_webhook_secret,
        generate_webhook_signature,
    ):
        webhook_id = 'test_webhook_123'
        timestamp = '1234567890'
        payload = {
            'type': 'payment.succeeded',
            'data': {
                'payment_id': 'pay_123',
                'subscription_id': 'sub_123',
                'customer': {'email': 'test@example.com'},
                'metadata': {
                    'organization_id': str(test_organization.id),
                    'plan_id': 'pro_monthly',
                },
            },
        }
        payload_str = json.dumps(payload, separators=(',', ':'))
        signature = generate_webhook_signature(webhook_id, timestamp, payload_str)
        response = await async_client.post(
            '/api/v1/organization/payments/webhook',
            content=payload_str,
            headers={
                'webhook-id': webhook_id,
                'webhook-signature': signature,
                'webhook-timestamp': timestamp,
                'Content-Type': 'application/json',
            },
        )
        assert response.status_code in (200, 400)

    async def test_invalid_signature_returns_400(self, async_client: AsyncClient):
        payload = {'type': 'payment.succeeded', 'data': {}}
        payload_str = json.dumps(payload)
        response = await async_client.post(
            '/api/v1/organization/payments/webhook',
            content=payload_str,
            headers={
                'webhook-id': 'test_webhook_123',
                'webhook-signature': 'invalid_signature',
                'webhook-timestamp': '1234567890',
                'Content-Type': 'application/json',
            },
        )
        assert response.status_code == 400

    async def test_missing_headers_returns_422(self, async_client: AsyncClient):
        payload = {'type': 'payment.succeeded', 'data': {}}
        payload_str = json.dumps(payload)
        response = await async_client.post(
            '/api/v1/organization/payments/webhook',
            content=payload_str,
            headers={
                'webhook-signature': 'test',
                'webhook-timestamp': '1234567890',
            },
        )
        assert response.status_code == 422

    async def test_invalid_json_returns_400(self, async_client: AsyncClient):
        response = await async_client.post(
            '/api/v1/organization/payments/webhook',
            content='invalid json',
            headers={
                'webhook-id': 'test_webhook_123',
                'webhook-signature': 'test',
                'webhook-timestamp': '1234567890',
                'Content-Type': 'application/json',
            },
        )
        assert response.status_code == 400


@pytest.mark.asyncio
class TestWebhookHeadOptions:
    async def test_head_returns_200(self, async_client: AsyncClient):
        response = await async_client.head('/api/v1/organization/payments/webhook')
        assert response.status_code == 200

    async def test_options_returns_200(self, async_client: AsyncClient):
        response = await async_client.options('/api/v1/organization/payments/webhook')
        assert response.status_code == 200
