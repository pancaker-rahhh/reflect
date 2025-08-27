from typing import Dict, Any, Optional
from datetime import datetime, timezone, timedelta

from app.core.logging import get_logger
from app.services.jira.jira_auth_service import JiraAuthType, jira_auth_service

logger = get_logger(__name__)


class JiraProjectService:
    def __init__(self):
        self.cache = {}
        self.cache_ttl = {
            'projects': 3600,
            'project_details': 86400,
            'issue_types': 86400,
            'components': 86400,
            'workflows': 86400,
        }

    def _get_api_base_url(self, config: Dict[str, Any]) -> str:
        base_url = config.get('base_url', '').rstrip('/')
        jira_version = jira_auth_service.detect_jira_instance_type(base_url)

        if jira_version.value == 'cloud':
            return f'{base_url}/rest/api/3'
        else:
            return f'{base_url}/rest/api/3'

    async def discover_projects(
        self,
        config: Dict[str, Any],
        auth_data: Dict[str, Any],
        auth_type: JiraAuthType = JiraAuthType.API_TOKEN,
        force_refresh: bool = False,
    ) -> Dict[str, Any]:
        try:
            cache_key = f'projects_{hash(str(config) + str(auth_data))}'

            if not force_refresh and cache_key in self.cache:
                cache_entry = self.cache[cache_key]
                if datetime.now(timezone.utc) < cache_entry['expires_at']:
                    return {
                        'status': 'success',
                        'message': 'Projects loaded from cache',
                        'data': cache_entry['data'],
                        'cached': True,
                    }

            base_url = self._get_api_base_url(config)
            headers = jira_auth_service._get_auth_headers(
                jira_auth_service._decrypt_auth_data(auth_data), auth_type
            )
            session = await jira_auth_service.get_session()

            all_projects = []
            start_at = 0
            max_results = 50

            while True:
                params = {
                    'startAt': start_at,
                    'maxResults': max_results,
                    'expand': 'lead,avatarUrls',
                }

                async with session.get(
                    f'{base_url}/project', headers=headers, params=params
                ) as response:
                    if response.status == 200:
                        projects_data = await response.json()
                        projects = projects_data.get('values', [])
                        all_projects.extend(projects)

                        if len(projects) < max_results:
                            break
                        start_at += max_results
                    else:
                        return {
                            'status': 'error',
                            'message': f'Failed to fetch projects: {response.status}',
                            'details': await response.text(),
                        }

            enriched_projects = []
            for project in all_projects:
                project_details = await self._get_project_details(
                    base_url, headers, project['key']
                )
                enriched_projects.append(
                    {
                        **project,
                        'issue_types': project_details.get('issue_types', []),
                        'components': project_details.get('components', []),
                        'workflow_statuses': project_details.get(
                            'workflow_statuses', []
                        ),
                    }
                )

            result_data = {
                'projects': enriched_projects,
                'total_count': len(enriched_projects),
                'discovered_at': datetime.now(timezone.utc).isoformat(),
            }

            self.cache[cache_key] = {
                'data': result_data,
                'expires_at': datetime.now(timezone.utc)
                + timedelta(seconds=self.cache_ttl['projects']),
            }

            return {
                'status': 'success',
                'message': f'Discovered {len(enriched_projects)} projects',
                'data': result_data,
                'cached': False,
            }

        except Exception as e:
            logger.error(f'Project discovery failed: {str(e)}')
            return {
                'status': 'error',
                'message': f'Project discovery failed: {str(e)}',
                'details': {'exception': str(e)},
            }

    async def _get_project_details(
        self, base_url: str, headers: Dict[str, str], project_key: str
    ) -> Dict[str, Any]:
        try:
            session = await jira_auth_service.get_session()

            issue_types = []
            try:
                async with session.get(
                    f'{base_url}/project/{project_key}', headers=headers
                ) as response:
                    if response.status == 200:
                        project_data = await response.json()
                        issue_types = project_data.get('issueTypes', [])
            except Exception as e:
                logger.warning(
                    f'Failed to fetch issue types for {project_key}: {str(e)}'
                )

            components = []
            try:
                async with session.get(
                    f'{base_url}/project/{project_key}/components', headers=headers
                ) as response:
                    if response.status == 200:
                        components = await response.json()
            except Exception as e:
                logger.warning(
                    f'Failed to fetch components for {project_key}: {str(e)}'
                )

            workflow_statuses = []
            try:
                async with session.get(
                    f'{base_url}/project/{project_key}/statuses', headers=headers
                ) as response:
                    if response.status == 200:
                        statuses_data = await response.json()
                        for issue_type in statuses_data:
                            workflow_statuses.extend(issue_type.get('statuses', []))
            except Exception as e:
                logger.warning(
                    f'Failed to fetch workflow statuses for {project_key}: {str(e)}'
                )

            return {
                'issue_types': issue_types,
                'components': components,
                'workflow_statuses': workflow_statuses,
            }

        except Exception as e:
            logger.error(f'Failed to get project details for {project_key}: {str(e)}')
            return {'issue_types': [], 'components': [], 'workflow_statuses': []}

    async def validate_project_access(
        self,
        config: Dict[str, Any],
        auth_data: Dict[str, Any],
        project_key: str,
        auth_type: JiraAuthType = JiraAuthType.API_TOKEN,
    ) -> Dict[str, Any]:
        try:
            base_url = self._get_api_base_url(config)
            headers = jira_auth_service._get_auth_headers(
                jira_auth_service._decrypt_auth_data(auth_data), auth_type
            )
            session = await jira_auth_service.get_session()

            async with session.get(
                f'{base_url}/project/{project_key}', headers=headers
            ) as response:
                if response.status == 200:
                    project_data = await response.json()
                    return {
                        'status': 'success',
                        'message': f'Access validated for project {project_key}',
                        'project': project_data,
                        'can_create_issues': True,
                        'can_edit_project': True,
                    }
                elif response.status == 404:
                    return {
                        'status': 'error',
                        'message': f'Project {project_key} not found',
                        'details': {'error': 'Project does not exist'},
                    }
                elif response.status == 403:
                    return {
                        'status': 'error',
                        'message': f'No access to project {project_key}',
                        'details': {'error': 'Insufficient permissions'},
                    }
                else:
                    return {
                        'status': 'error',
                        'message': f'Failed to validate project access: {response.status}',
                        'details': await response.text(),
                    }

        except Exception as e:
            logger.error(f'Project access validation failed: {str(e)}')
            return {
                'status': 'error',
                'message': f'Project access validation failed: {str(e)}',
                'details': {'exception': str(e)},
            }

    def clear_cache(self, cache_type: Optional[str] = None):
        if cache_type:
            keys_to_remove = [k for k in self.cache.keys() if cache_type in k]
            for key in keys_to_remove:
                del self.cache[key]
        else:
            self.cache.clear()


jira_project_service = JiraProjectService()
