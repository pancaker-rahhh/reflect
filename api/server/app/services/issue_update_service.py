from typing import Dict, Any, List
from uuid import UUID
from datetime import datetime, timezone
import asyncio
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.logging import get_logger
from app.models.integration_model import Integration
from app.schemas.status_mapping_schema import (
    UpdateResponse,
    UpdateField,
)
from app.services.jira_integration_service import jira_integration_service
from app.repositories.roadmap_repository import (
    roadmap_action_item_integration_repository,
)

logger = get_logger(__name__)


class IssueUpdateService:
    def __init__(self):
        self.max_retries = 3
        self.base_delay = 1.0
        self.max_delay = 30.0
        self.update_history = {}

    async def update_action_item(
        self,
        db: AsyncSession,
        integration: Integration,
        action_item_id: UUID,
        updates: Dict[str, Any],
        force_update: bool = False,
        validate_only: bool = False,
    ) -> UpdateResponse:
        try:
            integration_record = await roadmap_action_item_integration_repository.get_by_action_item_and_integration(
                db, action_item_id, integration.id
            )

            if not integration_record:
                return UpdateResponse(
                    success=False,
                    message='No JIRA integration found for this action item',
                    errors=['Action item not linked to JIRA'],
                    update_timestamp=datetime.now(timezone.utc).isoformat(),
                )

            if validate_only:
                validation_result = await self._validate_updates(
                    integration, integration_record.external_id, updates
                )
                return UpdateResponse(
                    success=validation_result.get('valid', False),
                    message=validation_result.get('message', 'Validation completed'),
                    errors=validation_result.get('errors', []),
                    update_timestamp=datetime.now(timezone.utc).isoformat(),
                )

            field_mapping = self._get_field_mapping()
            jira_updates = {}

            for field_name, new_value in updates.items():
                if field_name in field_mapping:
                    jira_field = field_mapping[field_name]
                    jira_updates[jira_field] = new_value

            if not jira_updates:
                return UpdateResponse(
                    success=False,
                    message='No valid fields to update',
                    errors=['No mappable fields found'],
                    update_timestamp=datetime.now(timezone.utc).isoformat(),
                )

            update_result = await self._execute_update_with_retry(
                integration, integration_record.external_id, jira_updates, force_update
            )

            if update_result.get('status') == 'success':
                await self._track_update_success(
                    db,
                    action_item_id,
                    list(updates.keys()),
                    integration_record.external_id,
                )

                return UpdateResponse(
                    success=True,
                    message='Action item updated successfully',
                    updated_fields=list(updates.keys()),
                    jira_issue_key=integration_record.external_id,
                    update_timestamp=datetime.now(timezone.utc).isoformat(),
                )
            else:
                await self._track_update_failure(
                    db,
                    action_item_id,
                    list(updates.keys()),
                    update_result.get('message'),
                )

                return UpdateResponse(
                    success=False,
                    message=f"Update failed: {update_result.get('message')}",
                    errors=[update_result.get('message')],
                    update_timestamp=datetime.now(timezone.utc).isoformat(),
                )

        except Exception as e:
            logger.error(f'Action item update failed: {str(e)}')
            return UpdateResponse(
                success=False,
                message=f'Update failed: {str(e)}',
                errors=[str(e)],
                update_timestamp=datetime.now(timezone.utc).isoformat(),
            )

    def _get_field_mapping(self) -> Dict[str, str]:
        return {
            'title': 'summary',
            'description': 'description',
            'priority': 'priority',
            'assignee': 'assignee',
            'components': 'components',
            'labels': 'labels',
            'status': 'status',
        }

    async def _validate_updates(
        self,
        integration: Integration,
        issue_key: str,
        updates: Dict[str, Any],
    ) -> Dict[str, Any]:
        try:
            config = integration.config
            auth_data = integration.auth_data

            validation_errors = []
            valid_fields = []

            for field_name, value in updates.items():
                field_validation = await self._validate_field(
                    config, auth_data, issue_key, field_name, value
                )

                if field_validation.get('valid'):
                    valid_fields.append(field_name)
                else:
                    validation_errors.append(
                        field_validation.get('error', f'Invalid field: {field_name}')
                    )

            return {
                'valid': len(validation_errors) == 0,
                'message': f'Validation completed: {len(valid_fields)} valid, {len(validation_errors)} invalid',
                'errors': validation_errors,
                'valid_fields': valid_fields,
            }

        except Exception as e:
            logger.error(f'Update validation failed: {str(e)}')
            return {
                'valid': False,
                'message': f'Validation failed: {str(e)}',
                'errors': [str(e)],
            }

    async def _validate_field(
        self,
        config: Dict[str, Any],
        auth_data: Dict[str, Any],
        issue_key: str,
        field_name: str,
        value: Any,
    ) -> Dict[str, Any]:
        try:
            field_mapping = self._get_field_mapping()
            jira_field = field_mapping.get(field_name)

            if not jira_field:
                return {'valid': False, 'error': f'Unknown field: {field_name}'}

            if field_name == 'title' and (not value or len(str(value)) > 255):
                return {
                    'valid': False,
                    'error': 'Title must be between 1 and 255 characters',
                }

            if field_name == 'description' and value and len(str(value)) > 32767:
                return {
                    'valid': False,
                    'error': 'Description must be less than 32767 characters',
                }

            if field_name == 'priority' and value:
                priority_result = await self._validate_priority(
                    config, auth_data, value
                )
                if not priority_result.get('valid'):
                    return priority_result

            if field_name == 'assignee' and value:
                assignee_result = await self._validate_assignee(
                    config, auth_data, value
                )
                if not assignee_result.get('valid'):
                    return assignee_result

            return {'valid': True, 'field': jira_field}

        except Exception as e:
            return {'valid': False, 'error': f'Field validation failed: {str(e)}'}

    async def _validate_priority(
        self,
        config: Dict[str, Any],
        auth_data: Dict[str, Any],
        priority_name: str,
    ) -> Dict[str, Any]:
        try:
            from app.services.jira_integration_service import jira_integration_service

            priorities_result = await jira_integration_service.get_priorities(
                config, auth_data
            )
            if priorities_result.get('status') == 'success':
                priorities = priorities_result.get('data', {}).get('priorities', [])
                valid_priorities = [p.get('name') for p in priorities]

                if priority_name in valid_priorities:
                    return {'valid': True}
                else:
                    return {
                        'valid': False,
                        'error': f'Invalid priority: {priority_name}. Valid options: {valid_priorities}',
                    }
            else:
                return {
                    'valid': False,
                    'error': f'Failed to validate priority: {priorities_result.get("message")}',
                }

        except Exception as e:
            return {'valid': False, 'error': f'Priority validation failed: {str(e)}'}

    async def _validate_assignee(
        self,
        config: Dict[str, Any],
        auth_data: Dict[str, Any],
        assignee_name: str,
    ) -> Dict[str, Any]:
        try:
            from app.services.jira_integration_service import jira_integration_service

            users_result = await jira_integration_service.search_users(
                config, auth_data, assignee_name
            )
            if users_result.get('status') == 'success':
                users = users_result.get('data', {}).get('users', [])
                valid_users = [u.get('name') for u in users]

                if assignee_name in valid_users:
                    return {'valid': True}
                else:
                    return {
                        'valid': False,
                        'error': f'Invalid assignee: {assignee_name}. Valid options: {valid_users}',
                    }
            else:
                return {
                    'valid': False,
                    'error': f'Failed to validate assignee: {users_result.get("message")}',
                }

        except Exception as e:
            return {'valid': False, 'error': f'Assignee validation failed: {str(e)}'}

    async def _execute_update_with_retry(
        self,
        integration: Integration,
        issue_key: str,
        updates: Dict[str, Any],
        force_update: bool = False,
    ) -> Dict[str, Any]:
        for attempt in range(self.max_retries):
            try:
                config = integration.config
                auth_data = integration.auth_data

                update_result = await jira_integration_service.update_issue(
                    config, auth_data, issue_key, updates
                )

                if update_result.get('status') == 'success':
                    return update_result

                if attempt < self.max_retries - 1:
                    delay = min(self.base_delay * (2**attempt), self.max_delay)
                    await asyncio.sleep(delay)
                    logger.warning(
                        f'Update attempt {attempt + 1} failed, retrying in {delay}s: {update_result.get("message")}'
                    )

                return update_result

            except Exception as e:
                if attempt < self.max_retries - 1:
                    delay = min(self.base_delay * (2**attempt), self.max_delay)
                    await asyncio.sleep(delay)
                    logger.warning(
                        f'Update attempt {attempt + 1} failed with exception, retrying in {delay}s: {str(e)}'
                    )
                else:
                    return {
                        'status': 'error',
                        'message': f'Update failed after {self.max_retries} attempts: {str(e)}',
                        'details': {'exception': str(e)},
                    }

    async def _track_update_success(
        self,
        db: AsyncSession,
        action_item_id: UUID,
        updated_fields: List[str],
        jira_issue_key: str,
    ):
        try:
            timestamp = datetime.now(timezone.utc)
            for field_name in updated_fields:
                history_key = f'{action_item_id}_{field_name}_{timestamp.isoformat()}'
                self.update_history[history_key] = {
                    'action_item_id': str(action_item_id),
                    'field_name': field_name,
                    'update_timestamp': timestamp.isoformat(),
                    'success': True,
                    'jira_issue_key': jira_issue_key,
                }

        except Exception as e:
            logger.error(f'Failed to track update success: {str(e)}')

    async def _track_update_failure(
        self,
        db: AsyncSession,
        action_item_id: UUID,
        failed_fields: List[str],
        error_message: str,
    ):
        try:
            timestamp = datetime.now(timezone.utc)
            for field_name in failed_fields:
                history_key = f'{action_item_id}_{field_name}_{timestamp.isoformat()}'
                self.update_history[history_key] = {
                    'action_item_id': str(action_item_id),
                    'field_name': field_name,
                    'update_timestamp': timestamp.isoformat(),
                    'success': False,
                    'error_message': error_message,
                }

        except Exception as e:
            logger.error(f'Failed to track update failure: {str(e)}')

    async def detect_changes(
        self,
        db: AsyncSession,
        action_item_id: UUID,
        integration: Integration,
    ) -> List[UpdateField]:
        try:
            from app.repositories.roadmap_repository import roadmap_feature_repository

            action_item = await roadmap_feature_repository.get(db, action_item_id)
            if not action_item:
                return []

            integration_record = await roadmap_action_item_integration_repository.get_by_action_item_and_integration(
                db, action_item_id, integration.id
            )

            if not integration_record:
                return []

            changes = []
            last_sync = integration_record.last_synced_at

            if not last_sync or action_item.updated_at > last_sync:
                if action_item.title != integration_record.integration_metadata.get(
                    'last_title'
                ):
                    changes.append(
                        UpdateField(
                            field_name='title',
                            old_value=integration_record.integration_metadata.get(
                                'last_title'
                            ),
                            new_value=action_item.title,
                        )
                    )

                if (
                    action_item.description
                    != integration_record.integration_metadata.get('last_description')
                ):
                    changes.append(
                        UpdateField(
                            field_name='description',
                            old_value=integration_record.integration_metadata.get(
                                'last_description'
                            ),
                            new_value=action_item.description,
                        )
                    )

                if action_item.priority != integration_record.integration_metadata.get(
                    'last_priority'
                ):
                    changes.append(
                        UpdateField(
                            field_name='priority',
                            old_value=integration_record.integration_metadata.get(
                                'last_priority'
                            ),
                            new_value=action_item.priority,
                        )
                    )

            return changes

        except Exception as e:
            logger.error(f'Change detection failed: {str(e)}')
            return []

    async def get_update_history(
        self,
        action_item_id: UUID,
        limit: int = 50,
    ) -> List[Dict[str, Any]]:
        try:
            history_items = []
            for key, item in self.update_history.items():
                if str(action_item_id) in key:
                    history_items.append(item)

            history_items.sort(
                key=lambda x: x.get('update_timestamp', ''), reverse=True
            )
            return history_items[:limit]

        except Exception as e:
            logger.error(f'Failed to get update history: {str(e)}')
            return []


issue_update_service = IssueUpdateService()
