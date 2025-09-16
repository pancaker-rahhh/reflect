"""
Subscription plan constants and feature flags.
This module contains the business logic for subscription plans and their associated limits and features.
"""

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
