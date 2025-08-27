from typing import Dict, Any, Optional
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, Query, Body
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.auth import get_current_user
from app.models.user_model import User
from app.services.integration_setup_service import integration_setup_service
from app.schemas.jira_schema import (
    JiraConnectionTestRequest,
    JiraConnectionTestResponse,
    JiraProjectsResponse,
    JiraConfig,
    JiraConfigUpdate,
    JiraIssueTypesResponse,
    JiraPrioritiesResponse,
    JiraStatusesResponse,
    JiraComponentsResponse,
)
from app.services.jira_integration_service import JiraAuthType

router = APIRouter(prefix='/integrations/jira', tags=['JIRA Integration'])


@router.post('/')
async def create_jira_integration(
    project_id: UUID = Body(..., embed=True),
    name: str = Body(..., embed=True),
    jira_url: str = Body(..., embed=True),
    auth_type: JiraAuthType = Body(..., embed=True),
    auth_data: Dict[str, Any] = Body(..., embed=True),
    config: Dict[str, Any] = Body(..., embed=True),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        if str(project_id) != str(current_user.project_id):
            raise HTTPException(status_code=403, detail='Access denied to this project')

        jira_config = JiraConfig(
            jira_url=jira_url,
            auth_type=auth_type,
            project_key=config.get('project_key'),
            default_issue_type=config.get('default_issue_type', 'Task'),
            default_priority=config.get('default_priority', 'Medium'),
            status_mapping=config.get('status_mapping', {}),
            auto_create_issues=config.get('auto_create_issues', True),
            include_metadata=config.get('include_metadata', True),
            default_assignee=config.get('default_assignee'),
            default_reporter=config.get('default_reporter'),
            components=config.get('components', []),
            labels=config.get('labels', []),
        )

        result = await integration_setup_service.create_jira_integration(
            db, project_id, jira_config, auth_data
        )

        if result.get('status') == 'success':
            return {
                'success': True,
                'data': {
                    'integration_id': result.get('integration_id'),
                    'integration': result.get('integration'),
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
            status_code=500, detail=f'Failed to create integration: {str(e)}'
        )


@router.get('/{integration_id}')
async def get_jira_integration(
    integration_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        result = await integration_setup_service.get_jira_integration_config(
            db, integration_id
        )

        if result.get('status') == 'success':
            integration = result.get('integration')
            if str(integration.project_id) != str(current_user.project_id):
                raise HTTPException(
                    status_code=403, detail='Access denied to this integration'
                )

            return {
                'success': True,
                'data': {
                    'integration': integration,
                    'config': result.get('config'),
                    'project_info': {
                        'id': integration.project.id,
                        'name': integration.project.name,
                    },
                },
                'message': result.get('message'),
                'errors': [],
            }
        else:
            raise HTTPException(status_code=404, detail=result.get('message'))

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f'Failed to get integration: {str(e)}'
        )


@router.put('/{integration_id}')
async def update_jira_integration(
    integration_id: UUID,
    config_update: JiraConfigUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        result = await integration_setup_service.update_jira_integration(
            db, integration_id, config_update
        )

        if result.get('status') == 'success':
            integration = result.get('integration')
            if str(integration.project_id) != str(current_user.project_id):
                raise HTTPException(
                    status_code=403, detail='Access denied to this integration'
                )

            return {
                'success': True,
                'data': {'integration': integration},
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
            status_code=500, detail=f'Failed to update integration: {str(e)}'
        )


@router.delete('/{integration_id}')
async def delete_jira_integration(
    integration_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        config_result = await integration_setup_service.get_jira_integration_config(
            db, integration_id
        )
        if config_result.get('status') == 'success':
            integration = config_result.get('integration')
            if str(integration.project_id) != str(current_user.project_id):
                raise HTTPException(
                    status_code=403, detail='Access denied to this integration'
                )

        result = await integration_setup_service.delete_jira_integration(
            db, integration_id
        )

        if result.get('status') == 'success':
            return {
                'success': True,
                'data': None,
                'message': result.get('message'),
                'errors': [],
            }
        else:
            raise HTTPException(status_code=404, detail=result.get('message'))

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f'Failed to delete integration: {str(e)}'
        )


@router.post('/{integration_id}/test')
async def test_jira_integration(
    integration_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        config_result = await integration_setup_service.get_jira_integration_config(
            db, integration_id
        )

        if config_result.get('status') != 'success':
            raise HTTPException(status_code=404, detail=config_result.get('message'))

        integration = config_result.get('integration')
        if str(integration.project_id) != str(current_user.project_id):
            raise HTTPException(
                status_code=403, detail='Access denied to this integration'
            )

        config = integration.config
        auth_data = integration.auth_data

        result = await integration_setup_service.test_jira_connection(
            config.get('base_url'), JiraAuthType.API_TOKEN, auth_data
        )

        if result.get('status') == 'success':
            return {
                'success': True,
                'data': {
                    'connection_status': result.get('connection_status'),
                    'user_info': result.get('user_info'),
                    'jira_version': result.get('jira_version'),
                    'permissions': result.get('permissions'),
                },
                'message': result.get('message'),
                'errors': [],
            }
        else:
            return {
                'success': False,
                'data': {
                    'connection_status': result.get('connection_status'),
                    'details': result.get('details'),
                },
                'message': result.get('message'),
                'errors': [result.get('details', {})],
            }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f'Failed to test integration: {str(e)}'
        )


@router.post('/test-connection', response_model=JiraConnectionTestResponse)
async def test_jira_connection(
    request: JiraConnectionTestRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        auth_data = {}

        if request.auth_type == JiraAuthType.API_TOKEN:
            if not request.username or not request.api_token:
                raise HTTPException(
                    status_code=400,
                    detail='Username and API token are required for API token authentication',
                )
            auth_data = {'username': request.username, 'api_token': request.api_token}
        elif request.auth_type == JiraAuthType.BASIC_AUTH:
            if not request.username or not request.password:
                raise HTTPException(
                    status_code=400,
                    detail='Username and password are required for basic authentication',
                )
            auth_data = {'username': request.username, 'password': request.password}
        elif request.auth_type == JiraAuthType.OAUTH2:
            if (
                not request.authorization_code
                or not request.client_id
                or not request.client_secret
            ):
                raise HTTPException(
                    status_code=400,
                    detail='Authorization code, client ID, and client secret are required for OAuth2',
                )
            auth_data = {
                'client_id': request.client_id,
                'client_secret': request.client_secret,
                'authorization_code': request.authorization_code,
                'redirect_uri': request.redirect_uri,
            }

        result = await integration_setup_service.test_jira_connection(
            request.jira_url, request.auth_type, auth_data
        )

        if result.get('status') == 'success':
            return JiraConnectionTestResponse(
                success=True,
                message=result.get('message', 'Connection successful'),
                connection_status=result.get('connection_status', 'connected'),
                user_info=result.get('user_info'),
                jira_version=result.get('jira_version'),
                permissions=result.get('permissions'),
            )
        else:
            return JiraConnectionTestResponse(
                success=False,
                message=result.get('message', 'Connection failed'),
                connection_status=result.get('connection_status', 'unknown_error'),
                details=result.get('details'),
            )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f'Connection test failed: {str(e)}')


@router.get('/projects', response_model=JiraProjectsResponse)
async def get_jira_projects(
    jira_url: str = Query(..., description='JIRA instance URL'),
    auth_type: JiraAuthType = Query(..., description='Authentication type'),
    username: Optional[str] = Query(
        None, description='Username for API token or basic auth'
    ),
    api_token: Optional[str] = Query(None, description='API token for authentication'),
    password: Optional[str] = Query(None, description='Password for basic auth'),
    force_refresh: bool = Query(False, description='Force refresh project cache'),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        auth_data = {}

        if auth_type == JiraAuthType.API_TOKEN:
            if not username or not api_token:
                raise HTTPException(
                    status_code=400, detail='Username and API token are required'
                )
            auth_data = {'username': username, 'api_token': api_token}
        elif auth_type == JiraAuthType.BASIC_AUTH:
            if not username or not password:
                raise HTTPException(
                    status_code=400, detail='Username and password are required'
                )
            auth_data = {'username': username, 'password': password}
        else:
            raise HTTPException(
                status_code=400, detail='OAuth2 not supported for project discovery'
            )

        result = await integration_setup_service.get_jira_projects(
            jira_url, auth_type, auth_data, force_refresh
        )

        if result.get('status') == 'success':
            data = result.get('data', {})
            return JiraProjectsResponse(
                success=True,
                message=result.get('message', 'Projects retrieved successfully'),
                projects=data.get('projects', []),
                total_count=data.get('total_count', 0),
                cached=data.get('cached', False),
            )
        else:
            raise HTTPException(
                status_code=400, detail=result.get('message', 'Failed to get projects')
            )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f'Failed to get projects: {str(e)}')


@router.get('/{integration_id}/projects', response_model=JiraProjectsResponse)
async def get_integration_projects(
    integration_id: UUID,
    force_refresh: bool = Query(False, description='Force refresh project cache'),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        config_result = await integration_setup_service.get_jira_integration_config(
            db, integration_id
        )

        if config_result.get('status') != 'success':
            raise HTTPException(status_code=404, detail=config_result.get('message'))

        integration = config_result.get('integration')
        if str(integration.project_id) != str(current_user.project_id):
            raise HTTPException(
                status_code=403, detail='Access denied to this integration'
            )

        config = integration.config
        auth_data = integration.auth_data

        result = await integration_setup_service.get_jira_projects(
            config.get('base_url'), JiraAuthType.API_TOKEN, auth_data, force_refresh
        )

        if result.get('status') == 'success':
            data = result.get('data', {})
            return JiraProjectsResponse(
                success=True,
                message=result.get('message', 'Projects retrieved successfully'),
                projects=data.get('projects', []),
                total_count=data.get('total_count', 0),
                cached=data.get('cached', False),
            )
        else:
            raise HTTPException(
                status_code=400, detail=result.get('message', 'Failed to get projects')
            )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f'Failed to get projects: {str(e)}')


@router.get('/{integration_id}/issue-types', response_model=JiraIssueTypesResponse)
async def get_jira_issue_types(
    integration_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        config_result = await integration_setup_service.get_jira_integration_config(
            db, integration_id
        )

        if config_result.get('status') != 'success':
            raise HTTPException(status_code=404, detail=config_result.get('message'))

        integration = config_result.get('integration')
        if str(integration.project_id) != str(current_user.project_id):
            raise HTTPException(
                status_code=403, detail='Access denied to this integration'
            )

        config = integration.config
        auth_data = integration.auth_data

        from app.services.jira_integration_service import jira_integration_service

        result = await jira_integration_service.discover_projects(
            config, auth_data, JiraAuthType.API_TOKEN
        )

        if result.get('status') == 'success':
            projects_data = result.get('data', {})
            projects = projects_data.get('projects', [])

            issue_types = []
            for project in projects:
                if project.get('key') == config.get('project_key'):
                    issue_types = project.get('issue_types', [])
                    break

            return JiraIssueTypesResponse(
                success=True,
                message=f'Found {len(issue_types)} issue types',
                issue_types=issue_types,
            )
        else:
            raise HTTPException(status_code=400, detail=result.get('message'))

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f'Failed to get issue types: {str(e)}'
        )


@router.get('/{integration_id}/priorities', response_model=JiraPrioritiesResponse)
async def get_jira_priorities(
    integration_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        config_result = await integration_setup_service.get_jira_integration_config(
            db, integration_id
        )

        if config_result.get('status') != 'success':
            raise HTTPException(status_code=404, detail=config_result.get('message'))

        integration = config_result.get('integration')
        if str(integration.project_id) != str(current_user.project_id):
            raise HTTPException(
                status_code=403, detail='Access denied to this integration'
            )

        config = integration.config
        auth_data = integration.auth_data

        from app.services.jira_integration_service import jira_integration_service

        base_url = config.get('base_url')
        headers = jira_integration_service.auth_service._get_auth_headers(
            jira_integration_service.auth_service._decrypt_auth_data(auth_data),
            JiraAuthType.API_TOKEN,
        )

        session = await jira_integration_service.auth_service.get_session()
        async with session.get(
            f'{base_url}/rest/api/3/priority', headers=headers
        ) as response:
            if response.status == 200:
                priorities_data = await response.json()
                priorities = [
                    {
                        'id': p.get('id'),
                        'name': p.get('name'),
                        'description': p.get('description'),
                        'icon_url': p.get('iconUrl'),
                    }
                    for p in priorities_data
                ]

                return JiraPrioritiesResponse(
                    success=True,
                    message=f'Found {len(priorities)} priorities',
                    priorities=priorities,
                )
            else:
                raise HTTPException(status_code=400, detail='Failed to get priorities')

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f'Failed to get priorities: {str(e)}'
        )


@router.get('/{integration_id}/statuses', response_model=JiraStatusesResponse)
async def get_jira_statuses(
    integration_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        config_result = await integration_setup_service.get_jira_integration_config(
            db, integration_id
        )

        if config_result.get('status') != 'success':
            raise HTTPException(status_code=404, detail=config_result.get('message'))

        integration = config_result.get('integration')
        if str(integration.project_id) != str(current_user.project_id):
            raise HTTPException(
                status_code=403, detail='Access denied to this integration'
            )

        config = integration.config
        auth_data = integration.auth_data

        from app.services.jira_integration_service import jira_integration_service

        base_url = config.get('base_url')
        project_key = config.get('project_key')
        headers = jira_integration_service.auth_service._get_auth_headers(
            jira_integration_service.auth_service._decrypt_auth_data(auth_data),
            JiraAuthType.API_TOKEN,
        )

        session = await jira_integration_service.auth_service.get_session()
        async with session.get(
            f'{base_url}/rest/api/3/project/{project_key}/statuses', headers=headers
        ) as response:
            if response.status == 200:
                statuses_data = await response.json()
                statuses = []

                for issue_type in statuses_data:
                    for status in issue_type.get('statuses', []):
                        statuses.append(
                            {
                                'id': status.get('id'),
                                'name': status.get('name'),
                                'description': status.get('description'),
                                'category': status.get('statusCategory', {}).get(
                                    'name'
                                ),
                            }
                        )

                return JiraStatusesResponse(
                    success=True,
                    message=f'Found {len(statuses)} statuses',
                    statuses=statuses,
                )
            else:
                raise HTTPException(status_code=400, detail='Failed to get statuses')

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f'Failed to get statuses: {str(e)}')


@router.get('/{integration_id}/components', response_model=JiraComponentsResponse)
async def get_jira_components(
    integration_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        config_result = await integration_setup_service.get_jira_integration_config(
            db, integration_id
        )

        if config_result.get('status') != 'success':
            raise HTTPException(status_code=404, detail=config_result.get('message'))

        integration = config_result.get('integration')
        if str(integration.project_id) != str(current_user.project_id):
            raise HTTPException(
                status_code=403, detail='Access denied to this integration'
            )

        config = integration.config
        auth_data = integration.auth_data

        from app.services.jira_integration_service import jira_integration_service

        base_url = config.get('base_url')
        project_key = config.get('project_key')
        headers = jira_integration_service.auth_service._get_auth_headers(
            jira_integration_service.auth_service._decrypt_auth_data(auth_data),
            JiraAuthType.API_TOKEN,
        )

        session = await jira_integration_service.auth_service.get_session()
        async with session.get(
            f'{base_url}/rest/api/3/project/{project_key}/components', headers=headers
        ) as response:
            if response.status == 200:
                components_data = await response.json()
                components = [
                    {
                        'id': c.get('id'),
                        'name': c.get('name'),
                        'description': c.get('description'),
                        'lead': c.get('lead'),
                    }
                    for c in components_data
                ]

                return JiraComponentsResponse(
                    success=True,
                    message=f'Found {len(components)} components',
                    components=components,
                )
            else:
                raise HTTPException(status_code=400, detail='Failed to get components')

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f'Failed to get components: {str(e)}'
        )
