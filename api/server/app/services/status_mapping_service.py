from typing import Dict, Any, Optional, List
from uuid import UUID
from datetime import datetime, timezone
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.logging import get_logger
from app.models.integration_model import Integration
from app.schemas.status_mapping_schema import (
    StatusSyncResponse,
    ConflictInfo,
    SyncDirection,
    ConflictResolution,
)
from app.services.jira.jira_workflow_service import jira_workflow_service
from app.services.jira_integration_service import jira_integration_service
from app.repositories.roadmap_repository import (
    roadmap_action_item_integration_repository,
)

logger = get_logger(__name__)


class StatusMappingService:
    def __init__(self):
        self.conflict_cache = {}

    async def sync_status(
        self,
        db: AsyncSession,
        integration: Integration,
        action_item_id: UUID,
        new_status: str,
        old_status: Optional[str] = None,
        sync_direction: SyncDirection = SyncDirection.BIDIRECTIONAL,
        force_sync: bool = False,
    ) -> StatusSyncResponse:
        try:
            integration_record = await roadmap_action_item_integration_repository.get_by_action_item_and_integration(
                db, action_item_id, integration.id
            )

            if not integration_record:
                return StatusSyncResponse(
                    success=False,
                    message='No JIRA integration found for this action item',
                    errors=['Action item not linked to JIRA'],
                )

            config = integration.config
            status_mapping = config.get('status_mapping', {})

            jira_status = status_mapping.get(new_status)
            if not jira_status:
                return StatusSyncResponse(
                    success=False,
                    message=f'No JIRA status mapping found for Reflect status: {new_status}',
                    errors=[f"Status '{new_status}' not mapped to JIRA"],
                )

            if sync_direction in [
                SyncDirection.REFLECT_TO_JIRA,
                SyncDirection.BIDIRECTIONAL,
            ]:
                sync_result = await self._sync_to_jira(
                    db, integration, integration_record, jira_status, force_sync
                )

                if sync_result.get('status') == 'success':
                    await roadmap_action_item_integration_repository.update_sync_status(
                        db, integration_record.id, 'synced', datetime.now(timezone.utc)
                    )

                    return StatusSyncResponse(
                        success=True,
                        message=f'Status synced to JIRA: {new_status} → {jira_status}',
                        sync_result=sync_result.get('data'),
                    )
                else:
                    await roadmap_action_item_integration_repository.update_sync_status(
                        db, integration_record.id, 'failed'
                    )

                    return StatusSyncResponse(
                        success=False,
                        message=f"Failed to sync status to JIRA: {sync_result.get('message')}",
                        errors=[sync_result.get('message')],
                    )

            return StatusSyncResponse(
                success=True,
                message='Status sync completed (JIRA to Reflect direction)',
                sync_result={'direction': 'jira_to_reflect'},
            )

        except Exception as e:
            logger.error(f'Status sync failed: {str(e)}')
            return StatusSyncResponse(
                success=False, message=f'Status sync failed: {str(e)}', errors=[str(e)]
            )

    async def _sync_to_jira(
        self,
        db: AsyncSession,
        integration: Integration,
        integration_record: Any,
        jira_status: str,
        force_sync: bool = False,
    ) -> Dict[str, Any]:
        try:
            issue_key = integration_record.external_id
            config = integration.config
            auth_data = integration.auth_data

            if not force_sync:
                validation_result = (
                    await jira_workflow_service.validate_status_transition(
                        config,
                        auth_data,
                        issue_key,
                        integration_record.external_status,
                        jira_status,
                    )
                )

                if validation_result.get('status') != 'success':
                    return {
                        'status': 'error',
                        'message': f'Invalid status transition: {validation_result.get("message")}',
                        'details': validation_result.get('data'),
                    }

                transition_id = validation_result.get('data', {}).get('transition_id')
                if not transition_id:
                    return {
                        'status': 'error',
                        'message': f'No valid transition found to status: {jira_status}',
                        'details': validation_result.get('data'),
                    }

                transition_result = (
                    await jira_workflow_service.execute_status_transition(
                        config, auth_data, issue_key, transition_id
                    )
                )

                if transition_result.get('status') == 'success':
                    await roadmap_action_item_integration_repository.update(
                        db, integration_record.id, external_status=jira_status
                    )

                    return {
                        'status': 'success',
                        'message': f'Status updated to {jira_status}',
                        'data': {
                            'issue_key': issue_key,
                            'new_status': jira_status,
                            'transition_id': transition_id,
                        },
                    }
                else:
                    return transition_result

            else:
                update_result = await jira_integration_service.update_issue(
                    config, auth_data, issue_key, {'status': jira_status}
                )

                if update_result.get('status') == 'success':
                    await roadmap_action_item_integration_repository.update(
                        db, integration_record.id, external_status=jira_status
                    )

                    return {
                        'status': 'success',
                        'message': f'Status force-updated to {jira_status}',
                        'data': {
                            'issue_key': issue_key,
                            'new_status': jira_status,
                            'force_update': True,
                        },
                    }
                else:
                    return update_result

        except Exception as e:
            logger.error(f'JIRA sync failed: {str(e)}')
            return {
                'status': 'error',
                'message': f'JIRA sync failed: {str(e)}',
                'details': {'exception': str(e)},
            }

    async def detect_conflicts(
        self,
        db: AsyncSession,
        integration: Integration,
        action_item_id: UUID,
        reflect_status: str,
        jira_status: str,
    ) -> List[ConflictInfo]:
        try:
            integration_record = await roadmap_action_item_integration_repository.get_by_action_item_and_integration(
                db, action_item_id, integration.id
            )

            if not integration_record:
                return []

            config = integration.config
            status_mapping = config.get('status_mapping', {})
            expected_jira_status = status_mapping.get(reflect_status)

            conflicts = []
            if expected_jira_status and expected_jira_status != jira_status:
                conflict = ConflictInfo(
                    action_item_id=str(action_item_id),
                    reflect_status=reflect_status,
                    jira_status=jira_status,
                    conflict_type='status_mismatch',
                    timestamp=datetime.now(timezone.utc).isoformat(),
                )
                conflicts.append(conflict)

            return conflicts

        except Exception as e:
            logger.error(f'Conflict detection failed: {str(e)}')
            return []

    async def resolve_conflicts(
        self,
        db: AsyncSession,
        integration: Integration,
        conflicts: List[ConflictInfo],
        resolution_strategy: ConflictResolution,
    ) -> Dict[str, Any]:
        try:
            resolved_count = 0
            failed_count = 0
            resolution_results = []

            for conflict in conflicts:
                try:
                    if resolution_strategy == ConflictResolution.REFLECT_WINS:
                        result = await self.sync_status(
                            db,
                            integration,
                            UUID(conflict.action_item_id),
                            conflict.reflect_status,
                            force_sync=True,
                        )
                    elif resolution_strategy == ConflictResolution.JIRA_WINS:
                        result = await self._update_reflect_status(
                            db, UUID(conflict.action_item_id), conflict.jira_status
                        )
                    else:
                        result = StatusSyncResponse(
                            success=False,
                            message='Manual resolution required',
                            errors=['Manual resolution not implemented'],
                        )

                    if result.success:
                        resolved_count += 1
                        resolution_results.append(
                            {
                                'conflict_id': conflict.action_item_id,
                                'resolution': resolution_strategy.value,
                                'success': True,
                            }
                        )
                    else:
                        failed_count += 1
                        resolution_results.append(
                            {
                                'conflict_id': conflict.action_item_id,
                                'resolution': resolution_strategy.value,
                                'success': False,
                                'error': result.message,
                            }
                        )

                except Exception as e:
                    failed_count += 1
                    resolution_results.append(
                        {
                            'conflict_id': conflict.action_item_id,
                            'resolution': resolution_strategy.value,
                            'success': False,
                            'error': str(e),
                        }
                    )

            return {
                'status': 'success',
                'message': f'Conflict resolution completed: {resolved_count} resolved, {failed_count} failed',
                'data': {
                    'resolved_count': resolved_count,
                    'failed_count': failed_count,
                    'resolution_results': resolution_results,
                },
            }

        except Exception as e:
            logger.error(f'Conflict resolution failed: {str(e)}')
            return {
                'status': 'error',
                'message': f'Conflict resolution failed: {str(e)}',
                'details': {'exception': str(e)},
            }

    async def _update_reflect_status(
        self,
        db: AsyncSession,
        action_item_id: UUID,
        new_status: str,
    ) -> StatusSyncResponse:
        try:
            from app.repositories.roadmap_repository import roadmap_feature_repository

            action_item = await roadmap_feature_repository.get(db, action_item_id)
            if not action_item:
                return StatusSyncResponse(
                    success=False,
                    message='Action item not found',
                    errors=['Action item not found'],
                )

            await roadmap_feature_repository.update(
                db, action_item_id, status=new_status
            )

            return StatusSyncResponse(
                success=True,
                message=f'Reflect status updated to {new_status}',
                sync_result={'new_status': new_status},
            )

        except Exception as e:
            logger.error(f'Reflect status update failed: {str(e)}')
            return StatusSyncResponse(
                success=False,
                message=f'Reflect status update failed: {str(e)}',
                errors=[str(e)],
            )

    async def validate_status_mapping(
        self,
        integration: Integration,
        status_mapping: Dict[str, str],
    ) -> Dict[str, Any]:
        try:
            config = integration.config
            auth_data = integration.auth_data
            project_key = config.get('project_key')

            workflows_result = await jira_workflow_service.discover_workflows(
                config, auth_data, project_key
            )

            if workflows_result.get('status') != 'success':
                return {
                    'status': 'error',
                    'message': f'Failed to validate status mapping: {workflows_result.get("message")}',
                    'details': workflows_result.get('details'),
                }

            workflows = workflows_result.get('data', {}).get('workflows', [])
            available_statuses = set()

            for workflow in workflows:
                workflow_id = workflow.get('id')
                if workflow_id:
                    statuses_result = await jira_workflow_service.get_workflow_statuses(
                        config, auth_data, workflow_id
                    )
                    if statuses_result.get('status') == 'success':
                        statuses = statuses_result.get('data', {}).get('statuses', [])
                        for status in statuses:
                            available_statuses.add(status.get('name'))

            validation_results = []
            invalid_mappings = []

            for reflect_status, jira_status in status_mapping.items():
                if jira_status in available_statuses:
                    validation_results.append(
                        {
                            'reflect_status': reflect_status,
                            'jira_status': jira_status,
                            'valid': True,
                        }
                    )
                else:
                    validation_results.append(
                        {
                            'reflect_status': reflect_status,
                            'jira_status': jira_status,
                            'valid': False,
                            'error': f'Status "{jira_status}" not found in JIRA workflows',
                        }
                    )
                    invalid_mappings.append(jira_status)

            return {
                'status': 'success',
                'message': f'Status mapping validation completed: {len(status_mapping) - len(invalid_mappings)} valid, {len(invalid_mappings)} invalid',
                'data': {
                    'validation_results': validation_results,
                    'invalid_mappings': invalid_mappings,
                    'available_statuses': list(available_statuses),
                },
            }

        except Exception as e:
            logger.error(f'Status mapping validation failed: {str(e)}')
            return {
                'status': 'error',
                'message': f'Status mapping validation failed: {str(e)}',
                'details': {'exception': str(e)},
            }


status_mapping_service = StatusMappingService()
