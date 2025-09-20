from typing import Dict, List, Any
from app.core.settings import get_settings

settings = get_settings()

DODO_PRODUCT_IDS = {
    'pro_monthly': settings.DODO_TEST_PRODUCT_ID_PRO_MONTHLY,
    'pro_yearly': settings.DODO_TEST_PRODUCT_ID_PRO_YEARLY,
}

PLAN_LIMITS = {
    'free': {
        'projects': 1,
        'widgets': 1,
        'responses': 20,
    },
    'pro': {
        'projects': 999999,
        'widgets': 999999,
        'responses': 999999,
    },
}

FEATURE_FLAGS = {
    'free': {
        'advanced_targeting': False,
        'branding_removal': False,
        'priority_support': False,
        'dofollow_backlink': False,
        'jira_integration': False,
    },
    'pro': {
        'advanced_targeting': True,
        'branding_removal': True,
        'priority_support': True,
        'dofollow_backlink': True,
        'jira_integration': True,
    },
}


SUBSCRIPTION_PLANS: List[Dict[str, Any]] = [
    {
        'id': 'free',
        'name': 'free',
        'display_name': 'Free',
        'dodo_product_id': None,
        'price': 0.0,
        'currency': 'USD',
        'interval': None,
        'interval_count': None,
        'trial_days': 0,
        'limits': PLAN_LIMITS['free'],
        'features': FEATURE_FLAGS['free'],
        'description': 'Perfect for getting started',
        'is_active': True,
    },
    {
        'id': 'pro_monthly',
        'name': 'pro',
        'display_name': 'Pro Monthly',
        'dodo_product_id': DODO_PRODUCT_IDS['pro_monthly'],
        'price': 29.0,
        'currency': 'USD',
        'interval': 'month',
        'interval_count': 1,
        'trial_days': 0,
        'limits': PLAN_LIMITS['pro'],
        'features': FEATURE_FLAGS['pro'],
        'description': 'Unlimited everything, billed monthly',
        'is_active': True,
    },
    {
        'id': 'pro_yearly',
        'name': 'pro',
        'display_name': 'Pro Yearly',
        'dodo_product_id': DODO_PRODUCT_IDS['pro_yearly'],
        'price': 260.0,
        'currency': 'USD',
        'interval': 'year',
        'interval_count': 1,
        'trial_days': 0,
        'limits': PLAN_LIMITS['pro'],
        'features': FEATURE_FLAGS['pro'],
        'description': 'Unlimited everything, billed yearly (2 months free)',
        'is_active': True,
    },
]

PAYMENT_STATUS = {
    'PENDING': 'pending',
    'PROCESSING': 'processing',
    'SUCCEEDED': 'succeeded',
    'FAILED': 'failed',
    'CANCELLED': 'cancelled',
    'REFUNDED': 'refunded',
}

SUBSCRIPTION_STATUS = {
    'ACTIVE': 'active',
    'CANCELLED': 'cancelled',
    'EXPIRED': 'expired',
    'PAST_DUE': 'past_due',
    'UNPAID': 'unpaid',
    'INCOMPLETE': 'incomplete',
    'TRIALING': 'trialing',
}


def get_plan_by_id(plan_id: str) -> Dict[str, Any] | None:
    for plan in SUBSCRIPTION_PLANS:
        if plan['id'] == plan_id:
            return plan
    return None


def get_plan_by_dodo_product_id(product_id: str) -> Dict[str, Any] | None:
    for plan in SUBSCRIPTION_PLANS:
        if plan.get('dodo_product_id') == product_id:
            return plan
    return None


def get_active_plans() -> List[Dict[str, Any]]:
    return [plan for plan in SUBSCRIPTION_PLANS if plan.get('is_active', True)]


def get_paid_plans() -> List[Dict[str, Any]]:
    return [
        plan
        for plan in SUBSCRIPTION_PLANS
        if plan.get('price', 0) > 0 and plan.get('is_active', True)
    ]
