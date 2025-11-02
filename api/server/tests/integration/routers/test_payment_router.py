import pytest
from httpx import AsyncClient
from unittest.mock import patch, Mock


@pytest.mark.asyncio
class TestCreatePaymentLink:
    async def test_success_with_authenticated_user(
        self,
        async_client: AsyncClient,
        authenticated_headers,
        test_organization,
        test_project,
    ):
        with patch(
            'app.services.payment_service.payment_service.client'
        ) as mock_client:
            mock_client.subscriptions = Mock()
            mock_client.payments = Mock()
            response = await async_client.post(
                f'/api/v1/organizations/{test_organization.id}/payment/create-link',
                headers=authenticated_headers,
                json={
                    'plan_id': 'pro_monthly',
                    'email': 'test@example.com',
                    'firstName': 'Test',
                    'lastName': 'User',
                    'country': 'US',
                },
            )
            assert response.status_code == 200
            data = response.json()
            assert 'payment_link' in data
            assert data['plan_id'] == 'pro_monthly'

    async def test_missing_authentication(
        self, async_client: AsyncClient, test_organization
    ):
        response = await async_client.post(
            f'/api/v1/organizations/{test_organization.id}/payment/create-link',
            json={
                'plan_id': 'pro_monthly',
                'email': 'test@example.com',
                'firstName': 'Test',
                'lastName': 'User',
                'country': 'US',
            },
        )
        assert response.status_code == 401

    async def test_invalid_plan_id(
        self, async_client: AsyncClient, authenticated_headers, test_organization
    ):
        response = await async_client.post(
            f'/api/v1/organizations/{test_organization.id}/payment/create-link',
            headers=authenticated_headers,
            json={
                'plan_id': 'invalid_plan',
                'email': 'test@example.com',
                'firstName': 'Test',
                'lastName': 'User',
                'country': 'US',
            },
        )
        assert response.status_code == 400


@pytest.mark.asyncio
class TestGetPaymentStatus:
    async def test_success_returns_payment_status(
        self, async_client: AsyncClient, authenticated_headers, test_organization
    ):
        response = await async_client.get(
            f'/api/v1/organizations/{test_organization.id}/payment/status/test_payment_123',
            headers=authenticated_headers,
        )
        assert response.status_code == 200
        data = response.json()
        assert 'payment_id' in data
        assert 'subscription_plan' in data
        assert 'subscription_status' in data


@pytest.mark.asyncio
class TestCancelSubscription:
    async def test_success_with_manage_billing_permission(
        self,
        async_client: AsyncClient,
        authenticated_headers,
        test_organization_with_subscription,
    ):
        with patch(
            'app.services.payment_service.payment_service.client'
        ) as mock_client:
            mock_client.subscriptions = Mock()
            mock_client.subscriptions.update = Mock(
                return_value={
                    'response': {
                        'data': 'eyJuZXh0X2JpbGxpbmdfZGF0ZSI6ICIyMDI1LTEyLTMxVDAwOjAwOjAwWiJ9'
                    }
                }
            )
            with patch(
                'app.services.permission_service.PermissionService.has_permission',
                return_value=True,
            ):
                response = await async_client.post(
                    f'/api/v1/organizations/{test_organization_with_subscription.id}/payment/cancel-subscription',
                    headers=authenticated_headers,
                )
                assert response.status_code == 200
                data = response.json()
                assert data['success'] is True
                assert 'subscription_ends_at' in data

    async def test_missing_permission_returns_403(
        self,
        async_client: AsyncClient,
        authenticated_headers,
        test_organization_with_subscription,
    ):
        with patch(
            'app.services.permission_service.PermissionService.has_permission',
            return_value=False,
        ):
            response = await async_client.post(
                f'/api/v1/organizations/{test_organization_with_subscription.id}/payment/cancel-subscription',
                headers=authenticated_headers,
            )
            assert response.status_code == 403


@pytest.mark.asyncio
class TestChangePlan:
    async def test_success_with_permission(
        self,
        async_client: AsyncClient,
        authenticated_headers,
        test_organization_with_subscription,
    ):
        mock_client = Mock()
        mock_client.subscriptions = Mock()
        mock_client.subscriptions.change_plan = Mock(return_value=None)
        with patch(
            'app.services.payment_service.payment_service.client', new=mock_client
        ):
            with patch(
                'app.services.permission_service.PermissionService.has_permission',
                return_value=True,
            ):
                with patch(
                    'app.core.rate_limiting.check_rate_limit', return_value=True
                ):
                    response = await async_client.post(
                        f'/api/v1/organizations/{test_organization_with_subscription.id}/payment/change-plan',
                        headers=authenticated_headers,
                        json={
                            'new_plan_id': 'pro_yearly',
                            'quantity': 1,
                        },
                    )
                    assert response.status_code == 200
                    data = response.json()
                    assert data['success'] is True
                    assert data['new_plan_id'] == 'pro_yearly'

    async def test_invalid_plan_returns_400(
        self,
        async_client: AsyncClient,
        authenticated_headers,
        test_organization_with_subscription,
    ):
        mock_client = Mock()
        mock_client.subscriptions = Mock()
        with patch(
            'app.services.payment_service.payment_service.client', new=mock_client
        ):
            with patch(
                'app.services.permission_service.PermissionService.has_permission',
                return_value=True,
            ):
                with patch(
                    'app.core.rate_limiting.check_rate_limit', return_value=True
                ):
                    response = await async_client.post(
                        f'/api/v1/organizations/{test_organization_with_subscription.id}/payment/change-plan',
                        headers=authenticated_headers,
                        json={
                            'new_plan_id': 'invalid_plan',
                            'quantity': 1,
                        },
                    )
                    assert response.status_code == 400


@pytest.mark.asyncio
class TestGetPaymentPlans:
    async def test_success_returns_paid_plans_only(
        self, async_client: AsyncClient, authenticated_headers, test_organization
    ):
        response = await async_client.get(
            f'/api/v1/organizations/{test_organization.id}/payment/plans',
            headers=authenticated_headers,
        )
        assert response.status_code == 200
        data = response.json()
        assert 'plans' in data
        assert 'total' in data
        plan_ids = [plan['id'] for plan in data['plans']]
        assert 'free' not in plan_ids
