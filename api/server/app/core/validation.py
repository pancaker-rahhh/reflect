import re
import html
from typing import Dict, Any, List
from urllib.parse import urlparse
from app.core.logging import get_logger

logger = get_logger(__name__)


def validate_jira_url(url: str) -> str:
    if not url:
        raise ValueError('JIRA URL is required')

    url = url.strip()
    if not url.startswith(('http://', 'https://')):
        url = f'https://{url}'

    try:
        parsed = urlparse(url)
    except Exception as e:
        raise ValueError(f'Invalid URL format: {str(e)}')

    if not parsed.scheme or not parsed.netloc:
        raise ValueError('Invalid JIRA URL format')

    allowed_domains = [
        'atlassian.net',  # JIRA Cloud
        'jira.com',  # JIRA Cloud alternative
    ]

    custom_domains = get_custom_jira_domains()
    allowed_domains.extend(custom_domains)

    domain_valid = False
    for allowed_domain in allowed_domains:
        if allowed_domain in parsed.netloc.lower():
            domain_valid = True
            break

    if not domain_valid:
        raise ValueError(f'JIRA URL domain not in allowed list: {parsed.netloc}')

    return url.rstrip('/')


def get_custom_jira_domains() -> List[str]:
    import os

    custom_domains_str = os.getenv('CUSTOM_JIRA_DOMAINS', '')
    if custom_domains_str:
        return [
            domain.strip() for domain in custom_domains_str.split(',') if domain.strip()
        ]
    return []


def sanitize_input(data: Any) -> Any:
    if isinstance(data, str):
        return html.escape(data.strip())
    elif isinstance(data, dict):
        return {key: sanitize_input(value) for key, value in data.items()}
    elif isinstance(data, list):
        return [sanitize_input(item) for item in data]
    else:
        return data


def validate_project_key(project_key: str) -> str:
    if not project_key:
        raise ValueError('Project key is required')

    project_key = project_key.strip().upper()

    # JIRA project keys must be 1-10 characters, alphanumeric
    if not re.match(r'^[A-Z0-9]{1,10}$', project_key):
        raise ValueError('Project key must be 1-10 characters, alphanumeric only')

    return project_key


def validate_issue_type(issue_type: str) -> str:
    if not issue_type:
        raise ValueError('Issue type is required')

    issue_type = issue_type.strip()

    valid_issue_types = [
        'Task',
        'Story',
        'Bug',
        'Epic',
        'Subtask',
        'Improvement',
        'New Feature',
        'Technical task',
        'Design',
        'Research',
        'Documentation',
    ]

    if issue_type not in valid_issue_types:
        logger.warning(f'Unknown issue type: {issue_type}')

    return issue_type


def validate_priority(priority: str) -> str:
    if not priority:
        raise ValueError('Priority is required')

    priority = priority.strip()

    valid_priorities = [
        'Lowest',
        'Low',
        'Medium',
        'High',
        'Highest',
        'Minor',
        'Major',
        'Critical',
        'Blocker',
    ]

    if priority not in valid_priorities:
        logger.warning(f'Unknown priority: {priority}')

    return priority


def validate_email(email: str) -> str:
    if not email:
        raise ValueError('Email is required')

    email = email.strip().lower()

    email_pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    if not re.match(email_pattern, email):
        raise ValueError('Invalid email format')

    return email


def validate_username(username: str) -> str:
    if not username:
        raise ValueError('Username is required')

    username = username.strip()

    if not re.match(r'^[a-zA-Z0-9._-]+$', username):
        raise ValueError('Username contains invalid characters')

    if len(username) < 1 or len(username) > 50:
        raise ValueError('Username must be between 1 and 50 characters')

    return username


def sanitize_jira_config(config: Dict[str, Any]) -> Dict[str, Any]:
    sanitized_config = {}

    for key, value in config.items():
        if isinstance(value, str):
            sanitized_config[key] = html.escape(value.strip())
        elif isinstance(value, dict):
            sanitized_config[key] = sanitize_jira_config(value)
        elif isinstance(value, list):
            sanitized_config[key] = [
                html.escape(str(item).strip()) if isinstance(item, str) else item
                for item in value
            ]
        else:
            sanitized_config[key] = value

    return sanitized_config


def validate_integration_config(config: Dict[str, Any]) -> Dict[str, Any]:
    if not isinstance(config, dict):
        raise ValueError('Configuration must be a dictionary')

    validated_config = {}

    if 'base_url' in config:
        validated_config['base_url'] = validate_jira_url(config['base_url'])

    if 'project_key' in config:
        validated_config['project_key'] = validate_project_key(config['project_key'])

    if 'default_issue_type' in config:
        validated_config['default_issue_type'] = validate_issue_type(
            config['default_issue_type']
        )

    if 'default_priority' in config:
        validated_config['default_priority'] = validate_priority(
            config['default_priority']
        )

    if 'default_assignee' in config and config['default_assignee']:
        validated_config['default_assignee'] = validate_username(
            config['default_assignee']
        )

    if 'default_reporter' in config and config['default_reporter']:
        validated_config['default_reporter'] = validate_username(
            config['default_reporter']
        )

    for bool_field in ['auto_create_issues', 'include_metadata']:
        if bool_field in config:
            validated_config[bool_field] = bool(config[bool_field])

    for list_field in ['components', 'labels']:
        if list_field in config and isinstance(config[list_field], list):
            validated_config[list_field] = [
                html.escape(str(item).strip()) for item in config[list_field] if item
            ]

    if 'status_mapping' in config and isinstance(config['status_mapping'], dict):
        validated_config['status_mapping'] = {
            html.escape(str(key).strip()): html.escape(str(value).strip())
            for key, value in config['status_mapping'].items()
        }

    return validated_config
