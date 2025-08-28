import time
from typing import Dict, Any, Optional
from functools import wraps
from datetime import datetime, timezone
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.logging import get_logger

logger = get_logger(__name__)


class AuditLogger:
    def __init__(self):
        self.logger = logger

    def log_operation(
        self,
        action: str,
        user_id: Optional[str] = None,
        project_id: Optional[str] = None,
        integration_id: Optional[str] = None,
        details: Optional[Dict[str, Any]] = None,
        status: str = 'success',
        error_message: Optional[str] = None,
    ) -> None:
        audit_event = {
            'timestamp': datetime.now(timezone.utc).isoformat(),
            'action': action,
            'user_id': user_id,
            'project_id': project_id,
            'integration_id': integration_id,
            'status': status,
            'details': details or {},
        }

        if error_message:
            audit_event['error_message'] = error_message

        self.logger.info(
            'AUDIT_LOG',
            extra={
                'audit_event': audit_event,
                'audit_type': 'integration_operation',
            },
        )

    async def log_integration_creation(
        self,
        db: AsyncSession,
        user_id: str,
        project_id: str,
        integration_type: str,
        integration_config: Dict[str, Any],
        status: str = 'success',
        error_message: Optional[str] = None,
    ) -> None:
        self.log_operation(
            action='integration_created',
            user_id=user_id,
            project_id=project_id,
            details={
                'integration_type': integration_type,
                'config_summary': self._sanitize_config(integration_config),
            },
            status=status,
            error_message=error_message,
        )

    async def log_integration_update(
        self,
        db: AsyncSession,
        user_id: str,
        integration_id: str,
        project_id: str,
        changes: Dict[str, Any],
        status: str = 'success',
        error_message: Optional[str] = None,
    ) -> None:
        self.log_operation(
            action='integration_updated',
            user_id=user_id,
            project_id=project_id,
            integration_id=integration_id,
            details={
                'changes': self._sanitize_config(changes),
            },
            status=status,
            error_message=error_message,
        )

    async def log_integration_deletion(
        self,
        db: AsyncSession,
        user_id: str,
        integration_id: str,
        project_id: str,
        status: str = 'success',
        error_message: Optional[str] = None,
    ) -> None:
        self.log_operation(
            action='integration_deleted',
            user_id=user_id,
            project_id=project_id,
            integration_id=integration_id,
            status=status,
            error_message=error_message,
        )

    async def log_jira_issue_creation(
        self,
        db: AsyncSession,
        user_id: str,
        integration_id: str,
        project_id: str,
        action_item_id: str,
        jira_issue_key: Optional[str] = None,
        status: str = 'success',
        error_message: Optional[str] = None,
    ) -> None:
        self.log_operation(
            action='jira_issue_created',
            user_id=user_id,
            project_id=project_id,
            integration_id=integration_id,
            details={
                'action_item_id': action_item_id,
                'jira_issue_key': jira_issue_key,
            },
            status=status,
            error_message=error_message,
        )

    async def log_jira_sync(
        self,
        db: AsyncSession,
        user_id: str,
        integration_id: str,
        project_id: str,
        action_item_id: str,
        sync_type: str = 'manual',
        status: str = 'success',
        error_message: Optional[str] = None,
    ) -> None:
        self.log_operation(
            action='jira_sync',
            user_id=user_id,
            project_id=project_id,
            integration_id=integration_id,
            details={
                'action_item_id': action_item_id,
                'sync_type': sync_type,
            },
            status=status,
            error_message=error_message,
        )

    async def log_connection_test(
        self,
        db: AsyncSession,
        user_id: str,
        integration_type: str,
        jira_url: str,
        status: str = 'success',
        error_message: Optional[str] = None,
    ) -> None:
        self.log_operation(
            action='connection_test',
            user_id=user_id,
            details={
                'integration_type': integration_type,
                'jira_url': self._sanitize_url(jira_url),
            },
            status=status,
            error_message=error_message,
        )

    def _sanitize_config(self, config: Dict[str, Any]) -> Dict[str, Any]:
        sanitized = {}
        sensitive_fields = [
            'access_token',
            'refresh_token',
            'api_token',
            'password',
            'client_secret',
            'authorization_code',
        ]

        for key, value in config.items():
            if key in sensitive_fields:
                if isinstance(value, str) and value:
                    sanitized[key] = (
                        f'{value[:4]}...{value[-4:]}' if len(value) > 8 else '***'
                    )
                else:
                    sanitized[key] = '***'
            elif isinstance(value, dict):
                sanitized[key] = self._sanitize_config(value)
            elif isinstance(value, list):
                sanitized[key] = [str(item) for item in value[:5]]  # Limit list items
            else:
                sanitized[key] = str(value)

        return sanitized

    def _sanitize_url(self, url: str) -> str:
        if not url:
            return url

        try:
            from urllib.parse import urlparse

            parsed = urlparse(url)
            return f'{parsed.scheme}://{parsed.netloc}'
        except Exception:
            return '***'


# Global audit logger instance
audit_logger = AuditLogger()


def audit_log(action: str):
    def decorator(func):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            start_time = time.time()
            user_id = None
            project_id = None
            integration_id = None
            status = 'success'
            error_message = None

            try:
                for arg in args:
                    if hasattr(arg, 'id') and hasattr(arg, 'project_id'):
                        user_id = str(arg.id)
                        project_id = str(arg.project_id)
                        break

                integration_id = kwargs.get('integration_id')
                if integration_id:
                    integration_id = str(integration_id)

                result = await func(*args, **kwargs)

                audit_logger.log_operation(
                    action=action,
                    user_id=user_id,
                    project_id=project_id,
                    integration_id=integration_id,
                    details={
                        'execution_time': time.time() - start_time,
                        'function': func.__name__,
                    },
                    status=status,
                )

                return result

            except Exception as e:
                status = 'failure'
                error_message = str(e)

                audit_logger.log_operation(
                    action=action,
                    user_id=user_id,
                    project_id=project_id,
                    integration_id=integration_id,
                    details={
                        'execution_time': time.time() - start_time,
                        'function': func.__name__,
                    },
                    status=status,
                    error_message=error_message,
                )

                raise

        return wrapper

    return decorator
