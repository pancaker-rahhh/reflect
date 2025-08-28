from typing import Dict, Any, Optional, List
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.ext.asyncio import AsyncSession

from app.db import get_db
from app.core.auth import get_current_user
from app.models.user_model import User
from app.services.roadmap_service import roadmap_service
from app.services.integration_setup_service import integration_setup_service
from app.services.jira_integration_service import jira_integration_service
from app.services.jira.jira_auth_service import JiraAuthType
from app.schemas.roadmap_schema import RoadmapActionItemCreate
from app.core.logging import get_logger
from app.core.rate_limiting import rate_limit
from app.core.audit_logging import audit_log
from app.core.validation import sanitize_input

logger = get_logger(__name__)

router = APIRouter(prefix='/roadmap', tags=['Roadmap Integrations'])


@router.post('/features')
@rate_limit(max_requests=50, window_seconds=3600)
@audit_log(action='create_action_item_with_integration')
async def create_action_item_with_integration(
    feature_data: RoadmapActionItemCreate,
    jira_integration_id: Optional[UUID] = Body(None, embed=True),
    jira_config: Optional[Dict[str, Any]] = Body(None, embed=True),
    push_to_jira: bool = Body(False, embed=True),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        if jira_config:
            jira_config = sanitize_input(jira_config)

        if not jira_integration_id or not push_to_jira:
            result = await roadmap_service.create_feature(
                db, user_id=current_user.id, feature_in=feature_data
            )

            logger.info(
                f'Action item created successfully: {result.id} by user {current_user.id}'
            )

            return {
                'success': True,
                'data': result,
                'message': 'Action item created successfully',
                'errors': [],
            }

        config_result = await integration_setup_service.get_jira_integration_config(
            db, jira_integration_id
        )

        if config_result.get('status') != 'success':
            logger.warning(f'JIRA integration not found: {jira_integration_id}')
            raise HTTPException(status_code=404, detail='JIRA integration not found')

        integration = config_result.get('integration')

        if str(integration.project_id) != str(current_user.project_id):
            logger.warning(
                f'User {current_user.id} attempted to access integration {jira_integration_id} without permission'
            )
            raise HTTPException(
                status_code=403, detail='Access denied to this integration'
            )

        from app.repositories.roadmap_repository import (
            roadmap_column_repository,
            roadmap_repository,
        )

        column = await roadmap_column_repository.get(db, id=feature_data.column_id)
        if not column:
            logger.warning(f'Column not found: {feature_data.column_id}')
            raise HTTPException(status_code=404, detail='Column not found')

        roadmap = await roadmap_repository.get(db, id=column.roadmap_id)
        if not roadmap:
            logger.warning(f'Roadmap not found for column: {feature_data.column_id}')
            raise HTTPException(status_code=404, detail='Roadmap not found')

        if str(integration.project_id) != str(roadmap.project_id):
            logger.warning(
                f"Integration project {integration.project_id} doesn't match roadmap project {roadmap.project_id}"
            )
            raise HTTPException(
                status_code=403,
                detail='Integration and roadmap must belong to the same project',
            )

        result = await roadmap_service.create_feature(
            db, user_id=current_user.id, feature_in=feature_data
        )

        action_item_id = result.id
        logger.info(f'Action item created: {action_item_id} by user {current_user.id}')

        jira_result = await jira_integration_service.create_issue_from_action_item(
            db, integration, action_item_id, jira_config or {}
        )

        if jira_result.get('status') == 'success':
            logger.info(
                f"JIRA issue created successfully for action item {action_item_id}: {jira_result.get('issue_key')}"
            )

            return {
                'success': True,
                'data': {
                    'id': str(result.id),
                    'title': result.title,
                    'description': result.description,
                    'column_id': str(result.column_id),
                    'jira_issue': {
                        'issue_key': jira_result.get('issue_key'),
                        'issue_url': jira_result.get('issue_url'),
                        'issue_id': jira_result.get('issue_id'),
                    },
                },
                'message': 'Action item created and synced to JIRA successfully',
                'errors': [],
            }
        else:
            logger.warning(
                f"JIRA issue creation failed for action item {action_item_id}: {jira_result.get('message')}"
            )

            return {
                'success': True,
                'data': {
                    'id': str(result.id),
                    'title': result.title,
                    'description': result.description,
                    'column_id': str(result.column_id),
                },
                'message': 'Action item created but JIRA sync failed',
                'errors': [jira_result.get('message')],
            }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f'Failed to create action item: {str(e)}', exc_info=True)
        raise HTTPException(status_code=500, detail='Failed to create action item')


@router.post('/features/bulk-jira')
@rate_limit(max_requests=10, window_seconds=3600)
@audit_log(action='bulk_create_jira_issues')
async def bulk_create_jira_issues(
    action_item_ids: List[UUID] = Body(..., embed=True),
    jira_integration_id: UUID = Body(..., embed=True),
    jira_config: Dict[str, Any] = Body(..., embed=True),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        if not action_item_ids:
            raise HTTPException(status_code=400, detail='No action item IDs provided')

        if len(action_item_ids) > 50:  # Limit bulk operations
            raise HTTPException(
                status_code=400,
                detail='Maximum 50 action items allowed per bulk operation',
            )

        jira_config = sanitize_input(jira_config)

        config_result = await integration_setup_service.get_jira_integration_config(
            db, jira_integration_id
        )

        if config_result.get('status') != 'success':
            logger.warning(f'JIRA integration not found: {jira_integration_id}')
            raise HTTPException(status_code=404, detail='JIRA integration not found')

        integration = config_result.get('integration')

        if str(integration.project_id) != str(current_user.project_id):
            logger.warning(
                f'User {current_user.id} attempted to access integration {jira_integration_id} without permission'
            )
            raise HTTPException(
                status_code=403, detail='Access denied to this integration'
            )

        from app.repositories.roadmap_repository import (
            roadmap_feature_repository,
            roadmap_column_repository,
            roadmap_repository,
        )

        first_feature = await roadmap_feature_repository.get(db, id=action_item_ids[0])
        if not first_feature:
            logger.warning(f'First action item not found: {action_item_ids[0]}')
            raise HTTPException(status_code=404, detail='First action item not found')

        column = await roadmap_column_repository.get(db, id=first_feature.column_id)
        if not column:
            logger.warning(f'Column not found for action item: {action_item_ids[0]}')
            raise HTTPException(status_code=404, detail='Column not found')

        roadmap = await roadmap_repository.get(db, id=column.roadmap_id)
        if not roadmap:
            logger.warning(f'Roadmap not found for column: {column.id}')
            raise HTTPException(status_code=404, detail='Roadmap not found')

        if str(integration.project_id) != str(roadmap.project_id):
            logger.warning(
                f"Integration project {integration.project_id} doesn't match roadmap project {roadmap.project_id}"
            )
            raise HTTPException(
                status_code=403,
                detail='Integration and roadmap must belong to the same project',
            )

        results = []
        errors = []
        successful_count = 0
        failed_fields = []

        for action_item_id in action_item_ids:
            try:
                current_jira_config = jira_config.copy()
                if failed_fields:
                    current_jira_config['failed_fields'] = failed_fields

                if action_item_id == action_item_ids[0]:
                    field_support = await jira_integration_service.issue_service._check_field_support(
                        integration.config,
                        integration.auth_data,
                        current_jira_config.get('project_key'),
                        current_jira_config.get('issue_type', 'Task'),
                        JiraAuthType.API_TOKEN,
                    )
                    if field_support['status'] == 'success':
                        current_jira_config['supported_fields'] = field_support[
                            'supported_fields'
                        ]
                    else:
                        current_jira_config['supported_fields'] = {
                            'priority': True,
                            'components': True,
                            'assignee': True,
                        }

                from app.repositories.roadmap_repository import (
                    roadmap_action_item_integration_repository,
                )

                existing_integration = await roadmap_action_item_integration_repository.get_by_action_item_and_integration(
                    db, action_item_id, jira_integration_id
                )

                if existing_integration:
                    errors.append(
                        {
                            'action_item_id': str(action_item_id),
                            'error': 'Action item already has a JIRA issue for this integration',
                            'issue_key': existing_integration.external_id,
                        }
                    )
                    continue

                jira_result = (
                    await jira_integration_service.create_issue_from_action_item(
                        db, integration, action_item_id, current_jira_config
                    )
                )

                if jira_result.get('status') == 'success':
                    successful_count += 1
                    results.append(
                        {
                            'action_item_id': str(action_item_id),
                            'issue_key': jira_result.get('issue_key'),
                            'issue_url': jira_result.get('issue_url'),
                            'status': 'success',
                        }
                    )

                    logger.info(
                        f"JIRA issue created for action item {action_item_id}: {jira_result.get('issue_key')}"
                    )
                else:
                    errors.append(
                        {
                            'action_item_id': str(action_item_id),
                            'error': jira_result.get('message', 'Unknown error'),
                            'details': jira_result.get('details'),
                        }
                    )

                    logger.warning(
                        f"JIRA issue creation failed for action item {action_item_id}: {jira_result.get('message')}"
                    )

            except Exception as e:
                logger.error(
                    f'Error processing action item {action_item_id}: {str(e)}',
                    exc_info=True,
                )
                errors.append(
                    {
                        'action_item_id': str(action_item_id),
                        'error': f'Processing error: {str(e)}',
                    }
                )

        logger.info(
            f'Bulk JIRA creation completed: {successful_count} successful, {len(errors)} failed'
        )

        return {
            'success': True,
            'data': {
                'successful_count': successful_count,
                'failed_count': len(errors),
                'total_count': len(action_item_ids),
                'results': results,
                'errors': errors,
            },
            'message': f'Bulk JIRA creation completed: {successful_count} successful, {len(errors)} failed',
            'errors': [],
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f'Bulk JIRA creation failed: {str(e)}', exc_info=True)
        raise HTTPException(status_code=500, detail='Failed to create JIRA issues')


@router.post('/features/{feature_id}/sync-jira')
@rate_limit(max_requests=100, window_seconds=3600)
@audit_log(action='sync_feature_to_jira')
async def sync_feature_to_jira(
    feature_id: UUID,
    jira_integration_id: UUID = Body(..., embed=True),
    force_sync: bool = Body(False, embed=True),
    custom_config: Optional[Dict[str, Any]] = Body(None, embed=True),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        if custom_config:
            custom_config = sanitize_input(custom_config)

        config_result = await integration_setup_service.get_jira_integration_config(
            db, jira_integration_id
        )

        if config_result.get('status') != 'success':
            logger.warning(f'JIRA integration not found: {jira_integration_id}')
            raise HTTPException(status_code=404, detail='JIRA integration not found')

        integration = config_result.get('integration')

        if str(integration.project_id) != str(current_user.project_id):
            logger.warning(
                f'User {current_user.id} attempted to access integration {jira_integration_id} without permission'
            )
            raise HTTPException(
                status_code=403, detail='Access denied to this integration'
            )

        from app.repositories.roadmap_repository import (
            roadmap_feature_repository,
            roadmap_column_repository,
            roadmap_repository,
        )

        action_item = await roadmap_feature_repository.get(db, id=feature_id)
        if not action_item:
            logger.warning(f'Action item not found: {feature_id}')
            raise HTTPException(status_code=404, detail='Action item not found')

        column = await roadmap_column_repository.get(db, id=action_item.column_id)
        if not column:
            logger.warning(f'Column not found for action item: {feature_id}')
            raise HTTPException(status_code=404, detail='Column not found')

        roadmap = await roadmap_repository.get(db, id=column.roadmap_id)
        if not roadmap:
            logger.warning(f'Roadmap not found for column: {column.id}')
            raise HTTPException(status_code=404, detail='Roadmap not found')

        if str(integration.project_id) != str(roadmap.project_id):
            logger.warning(
                f"Integration project {integration.project_id} doesn't match roadmap project {roadmap.project_id}"
            )
            raise HTTPException(
                status_code=403,
                detail='Integration and roadmap must belong to the same project',
            )

        from app.repositories.roadmap_repository import (
            roadmap_action_item_integration_repository,
        )

        existing_integration = await roadmap_action_item_integration_repository.get_by_action_item_and_integration(
            db, feature_id, jira_integration_id
        )

        if existing_integration and not force_sync:
            logger.info(
                f'Action item {feature_id} already synced to JIRA: {existing_integration.external_id}'
            )
            return {
                'success': True,
                'data': {
                    'issue_key': existing_integration.external_id,
                    'issue_url': existing_integration.external_url,
                    'status': 'already_synced',
                },
                'message': 'Action item already synced to JIRA',
                'errors': [],
            }

        jira_result = await jira_integration_service.sync_action_item_to_jira(
            db, integration, feature_id, push_to_jira=True
        )

        if jira_result.get('status') == 'success':
            logger.info(
                f"Action item {feature_id} synced to JIRA successfully: {jira_result.get('issue_key')}"
            )

            return {
                'success': True,
                'data': {
                    'issue_key': jira_result.get('issue_key'),
                    'issue_url': jira_result.get('issue_url'),
                    'issue_id': jira_result.get('issue_id'),
                    'status': 'synced',
                },
                'message': 'Action item synced to JIRA successfully',
                'errors': [],
            }
        else:
            logger.warning(
                f"JIRA sync failed for action item {feature_id}: {jira_result.get('message')}"
            )

            return {
                'success': False,
                'data': None,
                'message': jira_result.get('message', 'Failed to sync to JIRA'),
                'errors': [jira_result.get('details', {})],
            }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f'Failed to sync feature to JIRA: {str(e)}', exc_info=True)
        raise HTTPException(status_code=500, detail='Failed to sync feature to JIRA')


@router.get('/features/{feature_id}/jira-status')
async def get_jira_status(
    feature_id: UUID,
    jira_integration_id: Optional[UUID] = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        from app.repositories.roadmap_repository import (
            roadmap_feature_repository,
            roadmap_column_repository,
            roadmap_repository,
        )

        action_item = await roadmap_feature_repository.get(db, id=feature_id)
        if not action_item:
            logger.warning(f'Action item not found: {feature_id}')
            raise HTTPException(status_code=404, detail='Action item not found')

        column = await roadmap_column_repository.get(db, id=action_item.column_id)
        if not column:
            logger.warning(f'Column not found for action item: {feature_id}')
            raise HTTPException(status_code=404, detail='Column not found')

        roadmap = await roadmap_repository.get(db, id=column.roadmap_id)
        if not roadmap:
            logger.warning(f'Roadmap not found for column: {column.id}')
            raise HTTPException(status_code=404, detail='Roadmap not found')

        if str(roadmap.project_id) != str(current_user.project_id):
            logger.warning(
                f'User {current_user.id} attempted to access roadmap {roadmap.id} without permission'
            )
            raise HTTPException(status_code=403, detail='Access denied to this roadmap')

        from app.repositories.roadmap_repository import (
            roadmap_action_item_integration_repository,
        )

        integrations = (
            await roadmap_action_item_integration_repository.get_by_action_item(
                db, feature_id
            )
        )

        if jira_integration_id:
            integrations = [
                i
                for i in integrations
                if str(i.integration_id) == str(jira_integration_id)
            ]

        jira_statuses = []
        for integration in integrations:
            jira_statuses.append(
                {
                    'integration_id': str(integration.integration_id),
                    'external_id': integration.external_id,
                    'external_url': integration.external_url,
                    'external_status': integration.external_status,
                    'sync_status': integration.sync_status,
                    'last_synced_at': integration.last_synced_at.isoformat()
                    if integration.last_synced_at
                    else None,
                    'integration_metadata': integration.integration_metadata,
                }
            )

        logger.info(
            f'Retrieved JIRA status for action item {feature_id}: {len(jira_statuses)} integrations'
        )

        return {
            'success': True,
            'data': {
                'feature_id': str(feature_id),
                'jira_integrations': jira_statuses,
            },
            'message': f'Found {len(jira_statuses)} JIRA integrations for this action item',
            'errors': [],
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f'Failed to get JIRA status: {str(e)}', exc_info=True)
        raise HTTPException(status_code=500, detail='Failed to get JIRA status')
