from typing import Dict, Any, Optional, List
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.ext.asyncio import AsyncSession

from app.db import get_db
from app.core.auth import get_current_user
from app.models.user_model import User
from app.services.action_item_service import action_item_service
from app.services.integration_setup_service import integration_setup_service
from app.services.jira_integration_service import jira_integration_service
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
            result = await action_item_service.create_action_item(
                db, feature_data, current_user.id
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
        if str(integration.project_id) != str(current_user.project_id):
            raise HTTPException(
                status_code=403, detail='Access denied to this integration'
            )

        result = await action_item_service.create_action_item(
            db, feature_data, current_user.id
        )

        if result.get('status') == 'success':
            action_item_id = result.get('data', {}).get('id')

            jira_result = await jira_integration_service.create_issue_from_action_item(
                db, integration, action_item_id, jira_config or {}
            )

            if jira_result.get('status') == 'success':
                return {
                    'success': True,
                    'data': {
                        **result.get('data', {}),
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
                    'data': result.get('data'),
                    'message': 'Action item created but JIRA sync failed',
                    'errors': [jira_result.get('message')],
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
        if str(integration.project_id) != str(current_user.project_id):
            raise HTTPException(
                status_code=403, detail='Access denied to this integration'
            )

        results = []
        errors = []
        successful_count = 0

        for action_item_id in action_item_ids:
            try:
                jira_result = (
                    await jira_integration_service.create_issue_from_action_item(
                        db, integration, action_item_id, jira_config
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
                    results.append(
                        {
                            'action_item_id': str(action_item_id),
                            'status': 'failed',
                            'error': jira_result.get('message'),
                        }
                    )
                    errors.append(
                        f"Action item {action_item_id}: {jira_result.get('message')}"
                    )

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
        if str(integration.project_id) != str(current_user.project_id):
            raise HTTPException(
                status_code=403, detail='Access denied to this integration'
            )

        from app.repositories.roadmap_repository import (
            roadmap_action_item_integration_repository,
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
        if str(integration.project_id) != str(current_user.project_id):
            raise HTTPException(
                status_code=403, detail='Access denied to this integration'
            )

        from app.repositories.roadmap_repository import (
            roadmap_action_item_integration_repository,
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
                'jira_issue_closed': close_jira_issue,
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
        if str(integration.project_id) != str(current_user.project_id):
            raise HTTPException(
                status_code=403, detail='Access denied to this integration'
            )

        from app.repositories.roadmap_repository import (
            roadmap_action_item_integration_repository,
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
        if str(integration.project_id) != str(current_user.project_id):
            raise HTTPException(
                status_code=403, detail='Access denied to this integration'
            )

        result = await jira_integration_service.sync_action_item_to_jira(
            db, integration, feature_id, force_sync
        )

        if result.get('status') == 'success':
            return {
                'success': True,
                'data': {
                    'issue_key': result.get('external_id'),
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
