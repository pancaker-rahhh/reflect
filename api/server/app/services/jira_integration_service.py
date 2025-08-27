import aiohttp
import asyncio
from typing import Dict, Any, Optional
from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession
from datetime import datetime, timezone
import base64
from enum import Enum

from app.models.integration_model import Integration, IntegrationType
from app.core.logging import get_logger

logger = get_logger(__name__)


class JiraAuthType(str, Enum):
    OAUTH2 = 'oauth2'
    API_TOKEN = 'api_token'
    BASIC_AUTH = 'basic_auth'


class JiraVersion(str, Enum):
    CLOUD = 'cloud'
    SERVER = 'server'


class JIRAIntegrationService:
    def __init__(self):
        self.session: Optional[aiohttp.ClientSession] = None
        self.rate_limit_delay = 1.0  # seconds between requests
        self.max_retries = 3
        self.retry_delay = 2.0  # seconds

    async def get_session(self) -> aiohttp.ClientSession:
        if self.session is None or self.session.closed:
            timeout = aiohttp.ClientTimeout(total=30, connect=10)
            connector = aiohttp.TCPConnector(limit=10, limit_per_host=5)
            self.session = aiohttp.ClientSession(
                timeout=timeout,
                connector=connector,
                headers={'User-Agent': 'Reflect-JIRA-Integration/1.0'},
            )
        return self.session

    def _get_auth_headers(
        self,
        auth_data: Dict[str, Any],
        auth_type: JiraAuthType = JiraAuthType.API_TOKEN,
    ) -> Dict[str, str]:
        headers = {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
        }

        if auth_type == JiraAuthType.OAUTH2:
            access_token = auth_data.get('access_token')
            if not access_token:
                raise ValueError('OAuth2 access_token is required')
            headers['Authorization'] = f'Bearer {access_token}'

        elif auth_type == JiraAuthType.API_TOKEN:
            username = auth_data.get('username')
            api_token = auth_data.get('api_token')
            if not username or not api_token:
                raise ValueError('JIRA username and api_token are required')
            credentials = f'{username}:{api_token}'
            encoded_credentials = base64.b64encode(credentials.encode()).decode()
            headers['Authorization'] = f'Basic {encoded_credentials}'

        elif auth_type == JiraAuthType.BASIC_AUTH:
            username = auth_data.get('username')
            password = auth_data.get('password')
            if not username or not password:
                raise ValueError('JIRA username and password are required')
            credentials = f'{username}:{password}'
            encoded_credentials = base64.b64encode(credentials.encode()).decode()
            headers['Authorization'] = f'Basic {encoded_credentials}'

        else:
            raise ValueError(f'Unsupported auth type: {auth_type}')

        return headers

    def _get_api_base_url(
        self, config: Dict[str, Any], jira_version: JiraVersion = JiraVersion.CLOUD
    ) -> str:
        base_url = config.get('base_url', '').rstrip('/')

        if jira_version == JiraVersion.CLOUD:
            # JIRA Cloud: https://{domain}.atlassian.net
            if not base_url.endswith('.atlassian.net'):
                raise ValueError('JIRA Cloud base URL must end with .atlassian.net')
            return f'{base_url}/rest/api/3'

        elif jira_version == JiraVersion.SERVER:
            # JIRA Server: https://{domain}/rest/api/3
            return f'{base_url}/rest/api/3'

        else:
            raise ValueError(f'Unsupported JIRA version: {jira_version}')

    async def _make_request(
        self,
        method: str,
        url: str,
        headers: Dict[str, str],
        json_data: Optional[Dict[str, Any]] = None,
        retry_count: int = 0,
    ) -> aiohttp.ClientResponse:
        """Make HTTP request with retry logic and rate limiting."""
        session = await self.get_session()

        try:
            if retry_count > 0:
                await asyncio.sleep(self.rate_limit_delay)

            logger.debug(f'Making {method} request to {url}')

            async with session.request(
                method, url, headers=headers, json=json_data
            ) as response:
                if response.status == 429:
                    retry_after = int(
                        response.headers.get('Retry-After', self.retry_delay)
                    )
                    logger.warning(
                        f'Rate limited, retrying after {retry_after} seconds'
                    )
                    await asyncio.sleep(retry_after)

                    if retry_count < self.max_retries:
                        return await self._make_request(
                            method, url, headers, json_data, retry_count + 1
                        )
                    else:
                        raise Exception('Max retries exceeded due to rate limiting')

                elif response.status in [500, 502, 503, 504]:
                    if retry_count < self.max_retries:
                        logger.warning(f'Server error {response.status}, retrying...')
                        await asyncio.sleep(self.retry_delay * (retry_count + 1))
                        return await self._make_request(
                            method, url, headers, json_data, retry_count + 1
                        )

                return response

        except asyncio.TimeoutError:
            logger.error(f'Request timeout for {url}')
            if retry_count < self.max_retries:
                await asyncio.sleep(self.retry_delay * (retry_count + 1))
                return await self._make_request(
                    method, url, headers, json_data, retry_count + 1
                )
            raise
        except Exception as e:
            logger.error(f'Request failed for {url}: {str(e)}')
            raise

    async def test_connection(
        self,
        config: Dict[str, Any],
        auth_data: Dict[str, Any],
        auth_type: JiraAuthType = JiraAuthType.API_TOKEN,
        jira_version: JiraVersion = JiraVersion.CLOUD,
    ) -> Dict[str, Any]:
        """Test JIRA connectivity and permissions."""
        try:
            base_url = self._get_api_base_url(config, jira_version)
            headers = self._get_auth_headers(auth_data, auth_type)

            response = await self._make_request('GET', f'{base_url}/myself', headers)

            if response.status == 200:
                user_info = await response.json()
                logger.info(
                    f'Successfully connected to JIRA as {user_info.get("displayName", "Unknown")}'
                )
                return {
                    'status': 'success',
                    'message': f'Connected to JIRA as {user_info.get("displayName", "Unknown")}',
                    'user_info': user_info,
                    'jira_version': jira_version.value,
                }
            elif response.status == 401:
                return {
                    'status': 'error',
                    'message': 'Authentication failed. Please check your credentials.',
                }
            elif response.status == 403:
                return {
                    'status': 'error',
                    'message': 'Access denied. Please check your permissions.',
                }
            else:
                error_text = await response.text()
                return {
                    'status': 'error',
                    'message': f'JIRA connection failed: {response.status}',
                    'details': error_text,
                }

        except Exception as e:
            logger.error(f'JIRA connection test failed: {str(e)}')
            return {'status': 'error', 'message': f'Connection failed: {str(e)}'}

    async def get_project_info(
        self,
        config: Dict[str, Any],
        auth_data: Dict[str, Any],
        project_key: str,
        auth_type: JiraAuthType = JiraAuthType.API_TOKEN,
        jira_version: JiraVersion = JiraVersion.CLOUD,
    ) -> Dict[str, Any]:
        try:
            base_url = self._get_api_base_url(config, jira_version)
            headers = self._get_auth_headers(auth_data, auth_type)

            response = await self._make_request(
                'GET', f'{base_url}/project/{project_key}', headers
            )

            if response.status == 200:
                project_info = await response.json()

                issue_types_response = await self._make_request(
                    'GET', f'{base_url}/project/{project_key}', headers
                )

                if issue_types_response.status == 200:
                    project_details = await issue_types_response.json()
                    issue_types = project_details.get('issueTypes', [])
                else:
                    issue_types = []

                components_response = await self._make_request(
                    'GET', f'{base_url}/project/{project_key}/components', headers
                )

                if components_response.status == 200:
                    components = await components_response.json()
                else:
                    components = []

                return {
                    'status': 'success',
                    'project': project_info,
                    'issue_types': issue_types,
                    'components': components,
                }
            else:
                error_text = await response.text()
                return {
                    'status': 'error',
                    'message': f'Failed to get project info: {error_text}',
                }

        except Exception as e:
            logger.error(f'Failed to get JIRA project info: {str(e)}')
            return {'status': 'error', 'message': str(e)}

    async def create_issue(
        self,
        config: Dict[str, Any],
        auth_data: Dict[str, Any],
        issue_data: Dict[str, Any],
        auth_type: JiraAuthType = JiraAuthType.API_TOKEN,
        jira_version: JiraVersion = JiraVersion.CLOUD,
    ) -> Dict[str, Any]:
        try:
            base_url = self._get_api_base_url(config, jira_version)
            headers = self._get_auth_headers(auth_data, auth_type)
            project_key = config.get('project_key')

            if not project_key:
                return {'status': 'error', 'message': 'Project key is required'}

            jira_issue = {
                'fields': {
                    'project': {'key': project_key},
                    'summary': issue_data.get('title', 'Feedback from Reflect'),
                    'description': self._format_description(
                        issue_data.get('description', 'No description provided')
                    ),
                    'issuetype': {'name': issue_data.get('issue_type', 'Task')},
                }
            }

            if 'priority' in issue_data and issue_data['priority']:
                jira_issue['fields']['priority'] = {'name': issue_data['priority']}

            if 'labels' in issue_data and issue_data['labels']:
                jira_issue['fields']['labels'] = issue_data['labels']

            if 'components' in issue_data and issue_data['components']:
                jira_issue['fields']['components'] = [
                    {'name': component} for component in issue_data['components']
                ]

            if 'assignee' in issue_data and issue_data['assignee']:
                jira_issue['fields']['assignee'] = {'name': issue_data['assignee']}

            logger.info(f'Creating JIRA issue in project {project_key}')
            response = await self._make_request(
                'POST', f'{base_url}/issue', headers, jira_issue
            )

            if response.status == 201:
                created_issue = await response.json()
                issue_key = created_issue.get('key')
                issue_url = (
                    f"{config.get('base_url', '').rstrip('/')}/browse/{issue_key}"
                )

                logger.info(f'Successfully created JIRA issue {issue_key}')
                return {
                    'status': 'success',
                    'issue': created_issue,
                    'key': issue_key,
                    'url': issue_url,
                    'id': created_issue.get('id'),
                }
            else:
                error_text = await response.text()
                logger.error(f'JIRA issue creation failed: {error_text}')
                return {
                    'status': 'error',
                    'message': f'Failed to create issue: {error_text}',
                }

        except Exception as e:
            logger.error(f'Failed to create JIRA issue: {str(e)}')
            return {'status': 'error', 'message': str(e)}

    def _format_description(self, description: str) -> Dict[str, Any]:
        return {
            'type': 'doc',
            'version': 1,
            'content': [
                {
                    'type': 'paragraph',
                    'content': [
                        {
                            'type': 'text',
                            'text': description,
                        }
                    ],
                }
            ],
        }

    async def update_issue(
        self,
        config: Dict[str, Any],
        auth_data: Dict[str, Any],
        issue_key: str,
        update_data: Dict[str, Any],
        auth_type: JiraAuthType = JiraAuthType.API_TOKEN,
        jira_version: JiraVersion = JiraVersion.CLOUD,
    ) -> Dict[str, Any]:
        try:
            base_url = self._get_api_base_url(config, jira_version)
            headers = self._get_auth_headers(auth_data, auth_type)

            jira_update = {'fields': {}}

            if 'title' in update_data:
                jira_update['fields']['summary'] = update_data['title']

            if 'description' in update_data:
                jira_update['fields']['description'] = self._format_description(
                    update_data['description']
                )

            if 'priority' in update_data:
                jira_update['fields']['priority'] = {'name': update_data['priority']}

            if 'assignee' in update_data:
                jira_update['fields']['assignee'] = {'name': update_data['assignee']}

            if 'labels' in update_data:
                jira_update['fields']['labels'] = update_data['labels']

            if 'components' in update_data:
                jira_update['fields']['components'] = [
                    {'name': component} for component in update_data['components']
                ]

            response = await self._make_request(
                'PUT', f'{base_url}/issue/{issue_key}', headers, jira_update
            )

            if response.status == 204:
                logger.info(f'Successfully updated JIRA issue {issue_key}')
                return {
                    'status': 'success',
                    'message': f'Issue {issue_key} updated successfully',
                    'url': f"{config.get('base_url', '').rstrip('/')}/browse/{issue_key}",
                }
            else:
                error_text = await response.text()
                return {
                    'status': 'error',
                    'message': f'Failed to update issue: {error_text}',
                }

        except Exception as e:
            logger.error(f'Failed to update JIRA issue: {str(e)}')
            return {'status': 'error', 'message': str(e)}

    async def get_issue_status(
        self,
        config: Dict[str, Any],
        auth_data: Dict[str, Any],
        issue_key: str,
        auth_type: JiraAuthType = JiraAuthType.API_TOKEN,
        jira_version: JiraVersion = JiraVersion.CLOUD,
    ) -> Dict[str, Any]:
        try:
            base_url = self._get_api_base_url(config, jira_version)
            headers = self._get_auth_headers(auth_data, auth_type)

            response = await self._make_request(
                'GET', f'{base_url}/issue/{issue_key}', headers
            )

            if response.status == 200:
                issue_data = await response.json()
                status = issue_data.get('fields', {}).get('status', {}).get('name')
                return {
                    'status': 'success',
                    'issue_status': status,
                    'issue_data': issue_data,
                }
            else:
                error_text = await response.text()
                return {
                    'status': 'error',
                    'message': f'Failed to get issue status: {error_text}',
                }

        except Exception as e:
            logger.error(f'Failed to get JIRA issue status: {str(e)}')
            return {'status': 'error', 'message': str(e)}

    async def sync_action_item_to_jira(
        self,
        db: AsyncSession,
        integration: Integration,
        action_item_id: UUID,
        push_to_jira: bool = True,
    ) -> Dict[str, Any]:
        try:
            from app.repositories.roadmap_repository import roadmap_feature_repository

            action_item = await roadmap_feature_repository.get(db, action_item_id)
            if not action_item:
                return {'status': 'error', 'message': 'Action item not found'}

            existing_integration = action_item.get_integration(IntegrationType.JIRA)

            if existing_integration and not push_to_jira:
                return {
                    'status': 'success',
                    'message': 'Already synced with JIRA',
                    'external_id': existing_integration.external_id,
                }

            jira_data = self._prepare_jira_issue_data(action_item, integration)

            if existing_integration:
                result = await self.update_issue(
                    integration.config,
                    integration.auth_data,
                    existing_integration.external_id,
                    jira_data,
                )
            else:
                result = await self.create_issue(
                    integration.config, integration.auth_data, jira_data
                )

            if result.get('status') == 'success':
                await self._update_integration_record(
                    db, action_item, integration, result, existing_integration
                )

            return result

        except Exception as e:
            logger.error(f'Failed to sync action item to JIRA: {str(e)}')
            return {'status': 'error', 'message': str(e)}

    def _prepare_jira_issue_data(
        self, action_item, integration: Integration
    ) -> Dict[str, Any]:
        jira_data = {
            'title': action_item.title,
            'description': action_item.description or 'No description provided',
            'issue_type': integration.config.get('issue_type', 'Task'),
            'priority': self._map_priority(getattr(action_item, 'priority', 'Medium')),
            'labels': [tag.name for tag in action_item.tags]
            if action_item.tags
            else [],
        }

        if integration.config.get('components'):
            jira_data['components'] = integration.config.get('components')

        if integration.config.get('default_assignee'):
            jira_data['assignee'] = integration.config.get('default_assignee')

        return jira_data

    def _map_priority(self, reflect_priority: str) -> str:
        priority_mapping = {
            'low': 'Low',
            'medium': 'Medium',
            'high': 'High',
            'critical': 'Critical',
        }
        return priority_mapping.get(reflect_priority.lower(), 'Medium')

    async def _update_integration_record(
        self,
        db: AsyncSession,
        action_item,
        integration: Integration,
        result: Dict[str, Any],
        existing_record=None,
    ):
        from app.repositories.roadmap_repository import (
            roadmap_action_item_integration_repository,
        )

        integration_data = {
            'action_item_id': action_item.id,
            'integration_id': integration.id,
            'external_id': result.get('key') or result.get('external_id'),
            'external_url': result.get('url'),
            'external_status': result.get('status'),
            'integration_metadata': {
                'project_key': integration.config.get('project_key'),
                'issue_type': integration.config.get('issue_type', 'Task'),
                'priority': result.get('priority'),
                'components': integration.config.get('components', []),
                'assignee': integration.config.get('default_assignee'),
                'created_at': datetime.now(timezone.utc).isoformat(),
            },
            'last_synced_at': datetime.now(timezone.utc),
            'sync_status': 'synced',
        }

        if existing_record:
            await roadmap_action_item_integration_repository.update(
                db, existing_record.id, **integration_data
            )
        else:
            await roadmap_action_item_integration_repository.create(
                db, **integration_data
            )

    async def close(self):
        if self.session and not self.session.closed:
            await self.session.close()
            logger.info('JIRA integration service session closed')


jira_service = JIRAIntegrationService()
