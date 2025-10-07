from typing import Dict, Any, Optional
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, Query, Body
from sqlalchemy.ext.asyncio import AsyncSession

from app.db import get_db
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
from app.services.organization_service import organization_service
from app.core.logging import get_logger

logger = get_logger(__name__)

router = APIRouter(prefix='/integrations', tags=['Integrations'])

jira_router = APIRouter(prefix='/jira', tags=['JIRA Integration'])


@router.get('')
async def get_integrations(
    project_id: Optional[UUID] = Query(None, description='Project ID'),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        if not project_id:
            return []

        result = await integration_setup_service.get_project_integrations(
            db, project_id
        )

        if result.get('status') == 'success':
            return result['integrations']
        else:
            raise HTTPException(
                status_code=500,
                detail=result.get('message', 'Failed to retrieve integrations'),
            )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f'Failed to retrieve integrations: {str(e)}', exc_info=True)
        raise HTTPException(status_code=500, detail='Failed to retrieve integrations')


@jira_router.post('')
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
        await organization_service.check_project_access(db, current_user.id, project_id)

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
            db, project_id, jira_config, auth_data, current_user.id
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


@jira_router.get('/{integration_id}')
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
            await organization_service.check_project_access(
                db, current_user.id, integration.project_id
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


@jira_router.put('/{integration_id}')
async def update_jira_integration(
    integration_id: UUID,
    config_update: JiraConfigUpdate = Body(..., embed=True),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        result = await integration_setup_service.update_jira_integration(
            db, integration_id, config_update
        )

        if result.get('status') == 'success':
            integration = result.get('integration')
            await organization_service.check_project_access(
                db, current_user.id, integration.project_id
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


@jira_router.delete('/{integration_id}')
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
            await organization_service.check_project_access(
                db, current_user.id, integration.project_id
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


@jira_router.post('/{integration_id}/test')
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
        await organization_service.check_project_access(
            db, current_user.id, integration.project_id
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


@jira_router.post('/test-connection', response_model=JiraConnectionTestResponse)
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
                connection_status=result.get('connection_status', 'failed'),
                details=result.get('details'),
            )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f'Failed to test connection: {str(e)}'
        )


@jira_router.get('/discover/projects', response_model=JiraProjectsResponse)
async def discover_jira_projects(
    jira_url: str = Query(..., description='JIRA URL'),
    auth_type: JiraAuthType = Query(..., description='Authentication type'),
    username: Optional[str] = Query(None, description='Username'),
    api_token: Optional[str] = Query(None, description='API token'),
    password: Optional[str] = Query(None, description='Password'),
    authorization_code: Optional[str] = Query(
        None, description='OAuth2 authorization code'
    ),
    client_id: Optional[str] = Query(None, description='OAuth2 client ID'),
    client_secret: Optional[str] = Query(None, description='OAuth2 client secret'),
    redirect_uri: Optional[str] = Query(None, description='OAuth2 redirect URI'),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        auth_data = {}

        if auth_type == JiraAuthType.API_TOKEN:
            if not username or not api_token:
                raise HTTPException(
                    status_code=400,
                    detail='Username and API token are required for API token authentication',
                )
            auth_data = {'username': username, 'api_token': api_token}
        elif auth_type == JiraAuthType.BASIC_AUTH:
            if not username or not password:
                raise HTTPException(
                    status_code=400,
                    detail='Username and password are required for basic authentication',
                )
            auth_data = {'username': username, 'password': password}
        elif auth_type == JiraAuthType.OAUTH2:
            if not authorization_code or not client_id or not client_secret:
                raise HTTPException(
                    status_code=400,
                    detail='Authorization code, client ID, and client secret are required for OAuth2',
                )
            auth_data = {
                'client_id': client_id,
                'client_secret': client_secret,
                'authorization_code': authorization_code,
                'redirect_uri': redirect_uri,
            }

        result = await integration_setup_service.get_jira_projects(
            jira_url, auth_type, auth_data
        )

        if result.get('status') == 'success':
            data = result.get('data', {})
            return JiraProjectsResponse(
                success=True,
                message=result.get('message', 'Projects discovered successfully'),
                projects=data.get('projects', []),
                total_count=data.get('total_count', 0),
                cached=result.get('cached', False),
            )
        else:
            return JiraProjectsResponse(
                success=False,
                message=result.get('message', 'Failed to discover projects'),
                projects=[],
                total_count=0,
                cached=False,
            )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f'Failed to discover projects: {str(e)}'
        )


@jira_router.get('/{integration_id}/projects', response_model=JiraProjectsResponse)
async def get_integration_projects(
    integration_id: UUID,
    force_refresh: bool = Query(False, description='Force refresh projects cache'),
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
        await organization_service.check_project_access(
            db, current_user.id, integration.project_id
        )

        projects_result = await integration_setup_service.get_integration_projects(
            db, integration_id, force_refresh
        )

        if projects_result.get('status') == 'success':
            data = projects_result.get('data', {})
            projects = data.get('projects', [])
            return JiraProjectsResponse(
                success=True,
                message=projects_result.get(
                    'message', 'Projects retrieved successfully'
                ),
                projects=projects,
                total_count=data.get('total_count', len(projects)),
                cached=projects_result.get('cached', False),
            )
        else:
            return JiraProjectsResponse(
                success=False,
                message=projects_result.get('message', 'Failed to retrieve projects'),
                projects=[],
                total_count=0,
                cached=False,
            )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f'Failed to get integration projects: {str(e)}'
        )


@jira_router.get('/{integration_id}/issue-types', response_model=JiraIssueTypesResponse)
async def get_integration_issue_types(
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
        await organization_service.check_project_access(
            db, current_user.id, integration.project_id
        )

        issue_types_result = (
            await integration_setup_service.get_integration_issue_types(
                db, integration_id
            )
        )

        if issue_types_result.get('status') == 'success':
            return JiraIssueTypesResponse(
                success=True,
                message=issue_types_result.get(
                    'message', 'Issue types retrieved successfully'
                ),
                issue_types=issue_types_result.get('issue_types', []),
            )
        else:
            return JiraIssueTypesResponse(
                success=False,
                message=issue_types_result.get(
                    'message', 'Failed to retrieve issue types'
                ),
                issue_types=[],
                details=issue_types_result.get('details'),
            )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f'Failed to get integration issue types: {str(e)}'
        )


@jira_router.get('/{integration_id}/priorities', response_model=JiraPrioritiesResponse)
async def get_integration_priorities(
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
        await organization_service.check_project_access(
            db, current_user.id, integration.project_id
        )

        priorities_result = await integration_setup_service.get_integration_priorities(
            db, integration_id
        )

        if priorities_result.get('status') == 'success':
            return JiraPrioritiesResponse(
                success=True,
                message=priorities_result.get(
                    'message', 'Priorities retrieved successfully'
                ),
                priorities=priorities_result.get('priorities', []),
            )
        else:
            return JiraPrioritiesResponse(
                success=False,
                message=priorities_result.get(
                    'message', 'Failed to retrieve priorities'
                ),
                priorities=[],
                details=priorities_result.get('details'),
            )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f'Failed to get integration priorities: {str(e)}'
        )


@jira_router.get('/{integration_id}/statuses', response_model=JiraStatusesResponse)
async def get_integration_statuses(
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
        await organization_service.check_project_access(
            db, current_user.id, integration.project_id
        )

        statuses_result = await integration_setup_service.get_integration_statuses(
            db, integration_id
        )

        if statuses_result.get('status') == 'success':
            return JiraStatusesResponse(
                success=True,
                message=statuses_result.get(
                    'message', 'Statuses retrieved successfully'
                ),
                statuses=statuses_result.get('statuses', []),
            )
        else:
            return JiraStatusesResponse(
                success=False,
                message=statuses_result.get('message', 'Failed to retrieve statuses'),
                statuses=[],
                details=statuses_result.get('details'),
            )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f'Failed to get integration statuses: {str(e)}'
        )


@jira_router.get('/{integration_id}/components', response_model=JiraComponentsResponse)
async def get_integration_components(
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
        await organization_service.check_project_access(
            db, current_user.id, integration.project_id
        )

        components_result = await integration_setup_service.get_integration_components(
            db, integration_id
        )

        if components_result.get('status') == 'success':
            return JiraComponentsResponse(
                success=True,
                message=components_result.get(
                    'message', 'Components retrieved successfully'
                ),
                components=components_result.get('components', []),
            )
        else:
            return JiraComponentsResponse(
                success=False,
                message=components_result.get(
                    'message', 'Failed to retrieve components'
                ),
                components=[],
                details=components_result.get('details'),
            )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f'Failed to get integration components: {str(e)}'
        )


router.include_router(jira_router)
