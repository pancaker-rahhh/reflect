import pytest
from uuid import uuid4
from app.services.subscription_service import SubscriptionService
from app.models.organization_model import SubscriptionPlanEnum
from tests.factories.organization_factory import (
    create_pro_monthly_organization,
)


@pytest.fixture
def subscription_service_instance():
    return SubscriptionService()


class TestGetOrganizationSubscription:
    @pytest.mark.asyncio
    async def test_returns_org_when_exists(
        self, subscription_service_instance, async_db_session, test_organization
    ):
        result = await subscription_service_instance.get_organization_subscription(
            async_db_session, test_organization.id
        )
        assert result is not None
        assert result.id == test_organization.id

    @pytest.mark.asyncio
    async def test_returns_none_when_not_found(
        self, subscription_service_instance, async_db_session
    ):
        result = await subscription_service_instance.get_organization_subscription(
            async_db_session, uuid4()
        )
        assert result is None


class TestGetSubscriptionPlan:
    @pytest.mark.asyncio
    async def test_returns_correct_plan_free(
        self, subscription_service_instance, async_db_session, test_organization
    ):
        result = await subscription_service_instance.get_subscription_plan(
            async_db_session, test_organization.id
        )
        assert result == 'free'

    @pytest.mark.asyncio
    async def test_returns_correct_plan_pro_monthly(
        self, subscription_service_instance, async_db_session
    ):
        org = create_pro_monthly_organization()
        async_db_session.add(org)
        await async_db_session.commit()
        await async_db_session.refresh(org)
        result = await subscription_service_instance.get_subscription_plan(
            async_db_session, org.id
        )
        assert result in ('pro_monthly', 'pro')

    @pytest.mark.asyncio
    async def test_returns_free_when_org_not_found(
        self, subscription_service_instance, async_db_session
    ):
        result = await subscription_service_instance.get_subscription_plan(
            async_db_session, uuid4()
        )
        assert result == 'free'


class TestGetSubscriptionStatus:
    @pytest.mark.asyncio
    async def test_returns_status_when_org_exists(
        self, subscription_service_instance, async_db_session, test_organization
    ):
        result = await subscription_service_instance.get_subscription_status(
            async_db_session, test_organization.id
        )
        assert result == 'active'

    @pytest.mark.asyncio
    async def test_returns_inactive_when_org_not_found(
        self, subscription_service_instance, async_db_session
    ):
        result = await subscription_service_instance.get_subscription_status(
            async_db_session, uuid4()
        )
        assert result == 'inactive'


class TestGetPlanLimits:
    @pytest.mark.asyncio
    async def test_correct_limits_free_plan(
        self, subscription_service_instance, async_db_session, test_organization
    ):
        result = await subscription_service_instance.get_plan_limits(
            async_db_session, test_organization.id
        )
        assert 'projects' in result
        assert 'widgets' in result
        assert 'responses' in result
        assert result['projects'] == 1

    @pytest.mark.asyncio
    async def test_correct_limits_pro_plan(
        self, subscription_service_instance, async_db_session
    ):
        org = create_pro_monthly_organization()
        async_db_session.add(org)
        await async_db_session.commit()
        await async_db_session.refresh(org)
        result = await subscription_service_instance.get_plan_limits(
            async_db_session, org.id
        )
        assert result['projects'] >= 999


class TestGetPlanFeatures:
    @pytest.mark.asyncio
    async def test_correct_features_free_plan(
        self, subscription_service_instance, async_db_session, test_organization
    ):
        result = await subscription_service_instance.get_plan_features(
            async_db_session, test_organization.id
        )
        assert 'advanced_targeting' in result
        assert result['advanced_targeting'] is False

    @pytest.mark.asyncio
    async def test_correct_features_pro_plan(
        self, subscription_service_instance, async_db_session
    ):
        org = create_pro_monthly_organization()
        async_db_session.add(org)
        await async_db_session.commit()
        await async_db_session.refresh(org)
        result = await subscription_service_instance.get_plan_features(
            async_db_session, org.id
        )
        assert result['advanced_targeting'] is True


class TestIsFeatureEnabled:
    @pytest.mark.asyncio
    async def test_returns_true_when_enabled(
        self, subscription_service_instance, async_db_session
    ):
        org = create_pro_monthly_organization()
        async_db_session.add(org)
        await async_db_session.commit()
        await async_db_session.refresh(org)
        result = await subscription_service_instance.is_feature_enabled(
            async_db_session, org.id, 'advanced_targeting'
        )
        assert result is True

    @pytest.mark.asyncio
    async def test_returns_false_when_disabled(
        self, subscription_service_instance, async_db_session, test_organization
    ):
        result = await subscription_service_instance.is_feature_enabled(
            async_db_session, test_organization.id, 'advanced_targeting'
        )
        assert result is False

    @pytest.mark.asyncio
    async def test_returns_false_when_org_not_found(
        self, subscription_service_instance, async_db_session
    ):
        result = await subscription_service_instance.is_feature_enabled(
            async_db_session, uuid4(), 'advanced_targeting'
        )
        assert result is False


class TestUpdateSubscriptionPlan:
    @pytest.mark.asyncio
    async def test_success_updates_plan_and_status(
        self, subscription_service_instance, async_db_session, test_organization
    ):
        result = await subscription_service_instance.update_subscription_plan(
            async_db_session, test_organization.id, 'pro_monthly', 'active'
        )
        assert result is True
        await async_db_session.refresh(test_organization)
        assert test_organization.subscription_plan in (
            'pro_monthly',
            SubscriptionPlanEnum.PRO_MONTHLY,
        )
        assert test_organization.subscription_status == 'active'

    @pytest.mark.asyncio
    async def test_returns_false_when_org_not_found(
        self, subscription_service_instance, async_db_session
    ):
        result = await subscription_service_instance.update_subscription_plan(
            async_db_session, uuid4(), 'pro_monthly', 'active'
        )
        assert result is False
