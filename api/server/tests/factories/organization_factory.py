from uuid import UUID, uuid4
from datetime import datetime, timezone
from app.models.organization_model import (
    Organization,
    SubscriptionPlanEnum,
    PaymentStatusEnum,
)


def create_organization(
    name: str = 'Test Organization',
    slug: str | None = None,
    subscription_plan: SubscriptionPlanEnum = SubscriptionPlanEnum.FREE,
    subscription_status: str = 'active',
    dodo_subscription_id: str | None = None,
    payment_status: PaymentStatusEnum | None = None,
    created_by: UUID | None = None,
) -> Organization:
    if slug is None:
        base_slug = name.lower().replace(' ', '-')
        unique_id = str(uuid4())[:8]
        slug = f'{base_slug}-{unique_id}'
    return Organization(
        id=uuid4(),
        name=name,
        slug=slug,
        subscription_plan=subscription_plan,
        subscription_status=subscription_status,
        dodo_subscription_id=dodo_subscription_id,
        payment_status=payment_status,
        created_by=created_by or uuid4(),
        created_at=datetime.now(timezone.utc),
        updated_at=datetime.now(timezone.utc),
    )


def create_free_organization(**kwargs) -> Organization:
    return create_organization(
        subscription_plan=SubscriptionPlanEnum.FREE,
        subscription_status='active',
        **kwargs,
    )


def create_pro_monthly_organization(**kwargs) -> Organization:
    return create_organization(
        subscription_plan=SubscriptionPlanEnum.PRO_MONTHLY,
        subscription_status='active',
        dodo_subscription_id=kwargs.pop('dodo_subscription_id', 'test_sub_monthly'),
        payment_status=kwargs.pop('payment_status', PaymentStatusEnum.SUCCEEDED),
        **kwargs,
    )


def create_pro_yearly_organization(**kwargs) -> Organization:
    return create_organization(
        subscription_plan=SubscriptionPlanEnum.PRO_YEARLY,
        subscription_status='active',
        dodo_subscription_id=kwargs.pop('dodo_subscription_id', 'test_sub_yearly'),
        payment_status=kwargs.pop('payment_status', PaymentStatusEnum.SUCCEEDED),
        **kwargs,
    )


def create_cancelled_organization(**kwargs) -> Organization:
    return create_organization(
        subscription_plan=SubscriptionPlanEnum.FREE,
        subscription_status='cancelled',
        **kwargs,
    )
