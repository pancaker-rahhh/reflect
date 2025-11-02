import pytest
from app.models.usage_tracking_model import UsageTracking, ResourceType
from datetime import datetime, timezone


class TestGetCurrentUsage:
    @pytest.mark.asyncio
    async def test_returns_correct_count_current_month(
        self, usage_tracking_service, async_db_session, test_organization
    ):
        current_month = datetime.now(timezone.utc).replace(
            day=1, hour=0, minute=0, second=0, microsecond=0
        )
        usage = UsageTracking(
            organization_id=test_organization.id,
            resource_type=ResourceType.RESPONSES.value,
            usage_count=5,
            period_start=current_month,
        )
        async_db_session.add(usage)
        await async_db_session.commit()
        result = await usage_tracking_service.get_current_usage(
            async_db_session, test_organization.id, ResourceType.RESPONSES.value
        )
        assert result == 5

    @pytest.mark.asyncio
    async def test_returns_zero_when_no_record(
        self, usage_tracking_service, async_db_session, test_organization
    ):
        result = await usage_tracking_service.get_current_usage(
            async_db_session, test_organization.id, ResourceType.RESPONSES.value
        )
        assert result == 0


class TestGetAllUsage:
    @pytest.mark.asyncio
    async def test_returns_dict_all_resource_types(
        self, usage_tracking_service, async_db_session, test_organization
    ):
        result = await usage_tracking_service.get_all_usage(
            async_db_session, test_organization.id
        )
        assert isinstance(result, dict)
        assert ResourceType.RESPONSES.value in result
        assert ResourceType.PROJECTS.value in result
        assert ResourceType.WIDGETS.value in result


class TestIncrementUsage:
    @pytest.mark.asyncio
    async def test_creates_new_record_when_none_exists(
        self, usage_tracking_service, async_db_session, test_organization
    ):
        await usage_tracking_service.increment_usage(
            async_db_session, test_organization.id, ResourceType.RESPONSES.value
        )
        result = await usage_tracking_service.get_current_usage(
            async_db_session, test_organization.id, ResourceType.RESPONSES.value
        )
        assert result == 1

    @pytest.mark.asyncio
    async def test_updates_existing_record(
        self, usage_tracking_service, async_db_session, test_organization
    ):
        await usage_tracking_service.increment_usage(
            async_db_session, test_organization.id, ResourceType.RESPONSES.value
        )
        await usage_tracking_service.increment_usage(
            async_db_session, test_organization.id, ResourceType.RESPONSES.value
        )
        result = await usage_tracking_service.get_current_usage(
            async_db_session, test_organization.id, ResourceType.RESPONSES.value
        )
        assert result == 2

    @pytest.mark.asyncio
    async def test_handles_amount_parameter(
        self, usage_tracking_service, async_db_session, test_organization
    ):
        await usage_tracking_service.increment_usage(
            async_db_session,
            test_organization.id,
            ResourceType.RESPONSES.value,
            amount=5,
        )
        result = await usage_tracking_service.get_current_usage(
            async_db_session, test_organization.id, ResourceType.RESPONSES.value
        )
        assert result == 5


class TestDecrementUsage:
    @pytest.mark.asyncio
    async def test_decrements_correctly(
        self, usage_tracking_service, async_db_session, test_organization
    ):
        await usage_tracking_service.increment_usage(
            async_db_session,
            test_organization.id,
            ResourceType.RESPONSES.value,
            amount=5,
        )
        await usage_tracking_service.decrement_usage(
            async_db_session, test_organization.id, ResourceType.RESPONSES.value
        )
        result = await usage_tracking_service.get_current_usage(
            async_db_session, test_organization.id, ResourceType.RESPONSES.value
        )
        assert result == 4

    @pytest.mark.asyncio
    async def test_does_not_go_below_zero(
        self, usage_tracking_service, async_db_session, test_organization
    ):
        await usage_tracking_service.decrement_usage(
            async_db_session, test_organization.id, ResourceType.RESPONSES.value
        )
        result = await usage_tracking_service.get_current_usage(
            async_db_session, test_organization.id, ResourceType.RESPONSES.value
        )
        assert result == 0

    @pytest.mark.asyncio
    async def test_no_op_when_record_doesnt_exist(
        self, usage_tracking_service, async_db_session, test_organization
    ):
        await usage_tracking_service.decrement_usage(
            async_db_session, test_organization.id, ResourceType.RESPONSES.value
        )
        result = await usage_tracking_service.get_current_usage(
            async_db_session, test_organization.id, ResourceType.RESPONSES.value
        )
        assert result == 0
