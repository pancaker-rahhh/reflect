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

router = APIRouter(prefix='/roadmap', tags=['Roadmap Enhanced'])


@router.post('/features')
async def create_action_item_with_jira(
    feature_data: RoadmapActionItemCreate,
    jira_integration_id: Optional[UUID] = Body(None, embed=True),
    jira_config: Optional[Dict[str, Any]] = Body(None, embed=True),
    push_to_jira: bool = Body(False, embed=True),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        if not jira_integration_id or not push_to_jira:
            result = await roadmap_service.create_feature(
                db, user_id=current_user.id, feature_in=feature_data
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
            raise HTTPException(status_code=404, detail='JIRA integration not found')

        integration = config_result.get('integration')

        # Get the project from the column to validate access
        from app.repositories.roadmap_repository import (
            roadmap_column_repository,
            roadmap_repository,
        )

        column = await roadmap_column_repository.get(db, id=feature_data.column_id)
        if not column:
            raise HTTPException(status_code=404, detail='Column not found')

        roadmap = await roadmap_repository.get(db, id=column.roadmap_id)
        if not roadmap:
            raise HTTPException(status_code=404, detail='Roadmap not found')

        if str(integration.project_id) != str(roadmap.project_id):
            raise HTTPException(
                status_code=403, detail='Access denied to this integration'
            )

        result = await roadmap_service.create_feature(
            db, user_id=current_user.id, feature_in=feature_data
        )

        action_item_id = result.id

        jira_result = await jira_integration_service.create_issue_from_action_item(
            db, integration, action_item_id, jira_config or {}
        )

        if jira_result.get('status') == 'success':
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
        raise HTTPException(
            status_code=500, detail=f'Failed to create action item: {str(e)}'
        )


@router.post('/features/bulk-jira')
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

        config_result = await integration_setup_service.get_jira_integration_config(
            db, jira_integration_id
        )

        if config_result.get('status') != 'success':
            raise HTTPException(status_code=404, detail='JIRA integration not found')

        integration = config_result.get('integration')

        # Get the project from the first action item to validate access
        from app.repositories.roadmap_repository import (
            roadmap_feature_repository,
            roadmap_column_repository,
            roadmap_repository,
        )

        first_feature = await roadmap_feature_repository.get(db, id=action_item_ids[0])
        if not first_feature:
            raise HTTPException(status_code=404, detail='First action item not found')

        column = await roadmap_column_repository.get(db, id=first_feature.column_id)
        if not column:
            raise HTTPException(status_code=404, detail='Column not found')

        roadmap = await roadmap_repository.get(db, id=column.roadmap_id)
        if not roadmap:
            raise HTTPException(status_code=404, detail='Roadmap not found')

        if str(integration.project_id) != str(roadmap.project_id):
            raise HTTPException(
                status_code=403, detail='Access denied to this integration'
            )

        results = []
        errors = []
        successful_count = 0
        failed_fields = []

        for action_item_id in action_item_ids:
            try:
                # Create a copy of jira_config with failed fields tracking
                current_jira_config = jira_config.copy()
                if failed_fields:
                    current_jira_config['failed_fields'] = failed_fields

                # If this is the first item, check field support
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

                # Check if action item already has a JIRA integration for this integration
                from app.repositories.roadmap_repository import (
                    roadmap_action_item_integration_repository,
                )

                existing_integration = await roadmap_action_item_integration_repository.get_by_action_item_and_integration(
                    db, action_item_id, jira_integration_id
                )

                if existing_integration:
                    # Skip if already has JIRA integration for this integration
                    jira_result = {
                        'status': 'success',
                        'message': 'Already has JIRA integration',
                        'issue_key': existing_integration.external_id,
                        'issue_url': existing_integration.external_url,
                    }
                else:
                    # Force creation of new issues for bulk operations (don't update existing ones)
                    jira_result = (
                        await jira_integration_service.create_issue_from_action_item(
                            db, integration, action_item_id, current_jira_config
                        )
                    )

                if jira_result.get('status') == 'success':
                    results.append(
                        {
                            'action_item_id': str(action_item_id),
                            'issue_key': jira_result.get('issue_key'),
                            'issue_url': jira_result.get('issue_url'),
                            'status': 'success',
                        }
                    )
                    successful_count += 1
                else:
                    error_message = jira_result.get('message', '')

                    # Track priority field failures for subsequent items
                    if (
                        'priority' in error_message.lower()
                        and 'priority' not in failed_fields
                    ):
                        failed_fields.append('priority')

                    results.append(
                        {
                            'action_item_id': str(action_item_id),
                            'status': 'failed',
                            'error': error_message,
                        }
                    )
                    errors.append(f'Action item {action_item_id}: {error_message}')

            except Exception as e:
                results.append(
                    {
                        'action_item_id': str(action_item_id),
                        'status': 'failed',
                        'error': str(e),
                    }
                )
                errors.append(f'Action item {action_item_id}: {str(e)}')

        return {
            'success': len(errors) == 0,
            'data': {
                'results': results,
                'total_requested': len(action_item_ids),
                'successful_count': successful_count,
                'failed_count': len(errors),
            },
            'message': f'Bulk JIRA creation completed. {successful_count} successful, {len(errors)} failed.',
            'errors': errors,
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f'Failed to create bulk JIRA issues: {str(e)}'
        )


@router.put('/features/{feature_id}/jira')
async def update_jira_issue(
    feature_id: UUID,
    jira_integration_id: UUID = Body(..., embed=True),
    update_data: Dict[str, Any] = Body(..., embed=True),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        config_result = await integration_setup_service.get_jira_integration_config(
            db, jira_integration_id
        )

        if config_result.get('status') != 'success':
            raise HTTPException(status_code=404, detail='JIRA integration not found')

        integration = config_result.get('integration')

        # Get the project from the feature to validate access
        from app.repositories.roadmap_repository import (
            roadmap_feature_repository,
            roadmap_column_repository,
            roadmap_repository,
            roadmap_action_item_integration_repository,
        )

        feature = await roadmap_feature_repository.get(db, id=feature_id)
        if not feature:
            raise HTTPException(status_code=404, detail='Feature not found')

        column = await roadmap_column_repository.get(db, id=feature.column_id)
        if not column:
            raise HTTPException(status_code=404, detail='Column not found')

        roadmap = await roadmap_repository.get(db, id=column.roadmap_id)
        if not roadmap:
            raise HTTPException(status_code=404, detail='Roadmap not found')

        if str(integration.project_id) != str(roadmap.project_id):
            raise HTTPException(
                status_code=403, detail='Access denied to this integration'
            )

        integration_record = await roadmap_action_item_integration_repository.get_by_action_item_and_integration(
            db, feature_id, jira_integration_id
        )

        if not integration_record:
            raise HTTPException(
                status_code=404, detail='JIRA issue not found for this action item'
            )

        result = await jira_integration_service.update_issue(
            integration.config,
            integration.auth_data,
            integration_record.external_id,
            update_data,
        )

        if result.get('status') == 'success':
            return {
                'success': True,
                'data': {
                    'issue_key': integration_record.external_id,
                    'issue_url': result.get('url'),
                    'updated_fields': list(update_data.keys()),
                },
                'message': 'JIRA issue updated successfully',
                'errors': [],
            }
        else:
            return {
                'success': False,
                'data': None,
                'message': result.get('message'),
                'errors': [result.get('details', {})],
            }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f'Failed to update JIRA issue: {str(e)}'
        )


@router.delete('/features/{feature_id}/jira')
async def remove_jira_association(
    feature_id: UUID,
    jira_integration_id: UUID = Body(..., embed=True),
    close_jira_issue: bool = Body(False, embed=True),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        config_result = await integration_setup_service.get_jira_integration_config(
            db, jira_integration_id
        )

        if config_result.get('status') != 'success':
            raise HTTPException(status_code=404, detail='JIRA integration not found')

        integration = config_result.get('integration')

        # Get the project from the feature to validate access
        from app.repositories.roadmap_repository import (
            roadmap_feature_repository,
            roadmap_column_repository,
            roadmap_repository,
            roadmap_action_item_integration_repository,
        )

        feature = await roadmap_feature_repository.get(db, id=feature_id)
        if not feature:
            raise HTTPException(status_code=404, detail='Feature not found')

        column = await roadmap_column_repository.get(db, id=feature.column_id)
        if not column:
            raise HTTPException(status_code=404, detail='Column not found')

        roadmap = await roadmap_repository.get(db, id=column.roadmap_id)
        if not roadmap:
            raise HTTPException(status_code=404, detail='Roadmap not found')

        if str(integration.project_id) != str(roadmap.project_id):
            raise HTTPException(
                status_code=403, detail='Access denied to this integration'
            )

        integration_record = await roadmap_action_item_integration_repository.get_by_action_item_and_integration(
            db, feature_id, jira_integration_id
        )

        if not integration_record:
            raise HTTPException(
                status_code=404, detail='JIRA issue not found for this action item'
            )

        if close_jira_issue:
            await jira_integration_service.update_issue(
                integration.config,
                integration.auth_data,
                integration_record.external_id,
                {'status': 'Closed'},
            )

        await roadmap_action_item_integration_repository.delete(
            db, integration_record.id
        )

        return {
            'success': True,
            'data': {
                'issue_key': integration_record.external_id,
                'issue_url': integration_record.external_url,
            },
            'message': 'JIRA association removed successfully',
            'errors': [],
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f'Failed to remove JIRA association: {str(e)}'
        )


@router.get('/features/{feature_id}/jira')
async def get_jira_issue_details(
    feature_id: UUID,
    jira_integration_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        config_result = await integration_setup_service.get_jira_integration_config(
            db, jira_integration_id
        )

        if config_result.get('status') != 'success':
            raise HTTPException(status_code=404, detail='JIRA integration not found')

        integration = config_result.get('integration')

        # Get the project from the feature to validate access
        from app.repositories.roadmap_repository import (
            roadmap_feature_repository,
            roadmap_column_repository,
            roadmap_repository,
            roadmap_action_item_integration_repository,
        )

        feature = await roadmap_feature_repository.get(db, id=feature_id)
        if not feature:
            raise HTTPException(status_code=404, detail='Feature not found')

        column = await roadmap_column_repository.get(db, id=feature.column_id)
        if not column:
            raise HTTPException(status_code=404, detail='Column not found')

        roadmap = await roadmap_repository.get(db, id=column.roadmap_id)
        if not roadmap:
            raise HTTPException(status_code=404, detail='Roadmap not found')

        if str(integration.project_id) != str(roadmap.project_id):
            raise HTTPException(
                status_code=403, detail='Access denied to this integration'
            )

        integration_record = await roadmap_action_item_integration_repository.get_by_action_item_and_integration(
            db, feature_id, jira_integration_id
        )

        if not integration_record:
            raise HTTPException(
                status_code=404, detail='JIRA issue not found for this action item'
            )

        status_result = await jira_integration_service.get_issue_status(
            integration.config, integration.auth_data, integration_record.external_id
        )

        if status_result.get('status') == 'success':
            return {
                'success': True,
                'data': {
                    'issue_key': integration_record.external_id,
                    'issue_url': integration_record.external_url,
                    'issue_status': status_result.get('issue_status'),
                    'last_synced_at': integration_record.last_synced_at,
                    'sync_status': integration_record.sync_status,
                    'metadata': integration_record.integration_metadata,
                },
                'message': 'JIRA issue details retrieved successfully',
                'errors': [],
            }
        else:
            return {
                'success': False,
                'data': {
                    'issue_key': integration_record.external_id,
                    'issue_url': integration_record.external_url,
                    'last_synced_at': integration_record.last_synced_at,
                    'sync_status': integration_record.sync_status,
                },
                'message': 'JIRA issue details retrieved but status fetch failed',
                'errors': [status_result.get('message')],
            }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f'Failed to get JIRA issue details: {str(e)}'
        )


@router.post('/features/{feature_id}/jira/sync')
async def sync_action_item_to_jira(
    feature_id: UUID,
    jira_integration_id: UUID = Body(..., embed=True),
    force_sync: bool = Body(False, embed=True),
    custom_config: Optional[Dict[str, Any]] = Body(None, embed=True),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        config_result = await integration_setup_service.get_jira_integration_config(
            db, jira_integration_id
        )

        if config_result.get('status') != 'success':
            raise HTTPException(status_code=404, detail='JIRA integration not found')

        integration = config_result.get('integration')

        # Get the project from the feature to validate access
        from app.repositories.roadmap_repository import (
            roadmap_feature_repository,
            roadmap_column_repository,
            roadmap_repository,
        )

        feature = await roadmap_feature_repository.get(db, id=feature_id)
        if not feature:
            raise HTTPException(status_code=404, detail='Feature not found')

        column = await roadmap_column_repository.get(db, id=feature.column_id)
        if not column:
            raise HTTPException(status_code=404, detail='Column not found')

        roadmap = await roadmap_repository.get(db, id=column.roadmap_id)
        if not roadmap:
            raise HTTPException(status_code=404, detail='Roadmap not found')

        if str(integration.project_id) != str(roadmap.project_id):
            raise HTTPException(
                status_code=403, detail='Access denied to this integration'
            )

        result = await jira_integration_service.sync_action_item_to_jira(
            db, integration, feature_id, force_sync, custom_config
        )

        if result.get('status') == 'success':
            return {
                'success': True,
                'data': {
                    'issue_key': result.get('issue_key'),
                    'issue_url': result.get('issue_url'),
                    'sync_status': 'synced',
                },
                'message': result.get('message'),
                'errors': [],
            }
        else:
            return {
                'success': False,
                'data': None,
                'message': result.get('message'),
                'errors': [result.get('details', {})],
            }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f'Failed to sync action item to JIRA: {str(e)}'
        )
