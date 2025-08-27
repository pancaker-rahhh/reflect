from typing import Dict, Any, Optional
from datetime import datetime, timezone

from app.core.logging import get_logger
from app.services.jira.jira_auth_service import JiraAuthType, jira_auth_service
from app.schemas.status_mapping_schema import JiraWorkflowStatus

logger = get_logger(__name__)


class JiraWorkflowService:
    def __init__(self):
        self.cache = {}
        self.cache_ttl = {
            'workflows': 3600,
            'statuses': 1800,
            'transitions': 1800,
        }

    async def get_session(self):
        return await jira_auth_service.get_session()

    def _get_api_base_url(self, config: Dict[str, Any]) -> str:
        base_url = config.get('base_url', '').rstrip('/')
        return f'{base_url}/rest/api/3'

    async def discover_workflows(
        self,
        config: Dict[str, Any],
        auth_data: Dict[str, Any],
        project_key: str,
        issue_type_id: Optional[str] = None,
        auth_type: JiraAuthType = JiraAuthType.API_TOKEN,
    ) -> Dict[str, Any]:
        try:
            base_url = self._get_api_base_url(config)
            headers = jira_auth_service._get_auth_headers(
                jira_auth_service._decrypt_auth_data(auth_data), auth_type
            )
            session = await self.get_session()

            cache_key = f'workflows_{project_key}_{issue_type_id}'
            if cache_key in self.cache:
                cached_data = self.cache[cache_key]
                if (
                    datetime.now(timezone.utc) - cached_data['timestamp']
                ).seconds < self.cache_ttl['workflows']:
                    return {'status': 'success', 'data': cached_data['data']}

            workflows = []
            async with session.get(f'{base_url}/workflow', headers=headers) as response:
                if response.status == 200:
                    workflows_data = await response.json()
                    workflows = workflows_data.get('values', [])

            project_workflows = []
            for workflow in workflows:
                if workflow.get('projects'):
                    for project in workflow['projects']:
                        if project.get('key') == project_key:
                            if not issue_type_id or any(
                                it.get('id') == issue_type_id
                                for it in workflow.get('issueTypes', [])
                            ):
                                project_workflows.append(workflow)

            result_data = {
                'workflows': project_workflows,
                'total_count': len(project_workflows),
            }

            self.cache[cache_key] = {
                'data': result_data,
                'timestamp': datetime.now(timezone.utc),
            }

            return {'status': 'success', 'data': result_data}

        except Exception as e:
            logger.error(f'Failed to discover workflows: {str(e)}')
            return {
                'status': 'error',
                'message': f'Workflow discovery failed: {str(e)}',
                'details': {'exception': str(e)},
            }

    async def get_workflow_statuses(
        self,
        config: Dict[str, Any],
        auth_data: Dict[str, Any],
        workflow_id: str,
        auth_type: JiraAuthType = JiraAuthType.API_TOKEN,
    ) -> Dict[str, Any]:
        try:
            base_url = self._get_api_base_url(config)
            headers = jira_auth_service._get_auth_headers(
                jira_auth_service._decrypt_auth_data(auth_data), auth_type
            )
            session = await self.get_session()

            cache_key = f'workflow_statuses_{workflow_id}'
            if cache_key in self.cache:
                cached_data = self.cache[cache_key]
                if (
                    datetime.now(timezone.utc) - cached_data['timestamp']
                ).seconds < self.cache_ttl['statuses']:
                    return {'status': 'success', 'data': cached_data['data']}

            async with session.get(
                f'{base_url}/workflow/{workflow_id}', headers=headers
            ) as response:
                if response.status == 200:
                    workflow_data = await response.json()
                    statuses = workflow_data.get('statuses', [])

                    workflow_statuses = []
                    for status in statuses:
                        workflow_statuses.append(
                            JiraWorkflowStatus(
                                id=status.get('id'),
                                name=status.get('name'),
                                description=status.get('description'),
                                category=status.get('statusCategory', {}).get('name'),
                                status_category=status.get('statusCategory'),
                                transitions=[],
                            )
                        )

                    result_data = {
                        'statuses': [status.dict() for status in workflow_statuses],
                        'total_count': len(workflow_statuses),
                    }

                    self.cache[cache_key] = {
                        'data': result_data,
                        'timestamp': datetime.now(timezone.utc),
                    }

                    return {'status': 'success', 'data': result_data}
                else:
                    return {
                        'status': 'error',
                        'message': f'Failed to get workflow statuses: {response.status}',
                        'details': {'status_code': response.status},
                    }

        except Exception as e:
            logger.error(f'Failed to get workflow statuses: {str(e)}')
            return {
                'status': 'error',
                'message': f'Workflow statuses fetch failed: {str(e)}',
                'details': {'exception': str(e)},
            }

    async def get_status_transitions(
        self,
        config: Dict[str, Any],
        auth_data: Dict[str, Any],
        issue_key: str,
        auth_type: JiraAuthType = JiraAuthType.API_TOKEN,
    ) -> Dict[str, Any]:
        try:
            base_url = self._get_api_base_url(config)
            headers = jira_auth_service._get_auth_headers(
                jira_auth_service._decrypt_auth_data(auth_data), auth_type
            )
            session = await self.get_session()

            cache_key = f'transitions_{issue_key}'
            if cache_key in self.cache:
                cached_data = self.cache[cache_key]
                if (
                    datetime.now(timezone.utc) - cached_data['timestamp']
                ).seconds < self.cache_ttl['transitions']:
                    return {'status': 'success', 'data': cached_data['data']}

            async with session.get(
                f'{base_url}/issue/{issue_key}/transitions', headers=headers
            ) as response:
                if response.status == 200:
                    transitions_data = await response.json()
                    transitions = transitions_data.get('transitions', [])

                    result_data = {
                        'transitions': transitions,
                        'total_count': len(transitions),
                    }

                    self.cache[cache_key] = {
                        'data': result_data,
                        'timestamp': datetime.now(timezone.utc),
                    }

                    return {'status': 'success', 'data': result_data}
                else:
                    return {
                        'status': 'error',
                        'message': f'Failed to get status transitions: {response.status}',
                        'details': {'status_code': response.status},
                    }

        except Exception as e:
            logger.error(f'Failed to get status transitions: {str(e)}')
            return {
                'status': 'error',
                'message': f'Status transitions fetch failed: {str(e)}',
                'details': {'exception': str(e)},
            }

    async def validate_status_transition(
        self,
        config: Dict[str, Any],
        auth_data: Dict[str, Any],
        issue_key: str,
        from_status: str,
        to_status: str,
        auth_type: JiraAuthType = JiraAuthType.API_TOKEN,
    ) -> Dict[str, Any]:
        try:
            transitions_result = await self.get_status_transitions(
                config, auth_data, issue_key, auth_type
            )

            if transitions_result.get('status') != 'success':
                return transitions_result

            transitions = transitions_result.get('data', {}).get('transitions', [])
            valid_transitions = []

            for transition in transitions:
                if transition.get('to', {}).get('name') == to_status:
                    valid_transitions.append(transition)

            if valid_transitions:
                return {
                    'status': 'success',
                    'message': f'Valid transition from {from_status} to {to_status}',
                    'data': {
                        'valid': True,
                        'transitions': valid_transitions,
                        'transition_id': valid_transitions[0].get('id'),
                    },
                }
            else:
                return {
                    'status': 'error',
                    'message': f'Invalid transition from {from_status} to {to_status}',
                    'data': {
                        'valid': False,
                        'available_transitions': [
                            t.get('to', {}).get('name') for t in transitions
                        ],
                    },
                }

        except Exception as e:
            logger.error(f'Failed to validate status transition: {str(e)}')
            return {
                'status': 'error',
                'message': f'Status transition validation failed: {str(e)}',
                'details': {'exception': str(e)},
            }

    async def execute_status_transition(
        self,
        config: Dict[str, Any],
        auth_data: Dict[str, Any],
        issue_key: str,
        transition_id: str,
        auth_type: JiraAuthType = JiraAuthType.API_TOKEN,
    ) -> Dict[str, Any]:
        try:
            base_url = self._get_api_base_url(config)
            headers = jira_auth_service._get_auth_headers(
                jira_auth_service._decrypt_auth_data(auth_data), auth_type
            )
            session = await self.get_session()

            transition_data = {
                'transition': {
                    'id': transition_id,
                },
            }

            async with session.post(
                f'{base_url}/issue/{issue_key}/transitions',
                headers=headers,
                json=transition_data,
            ) as response:
                if response.status == 204:
                    return {
                        'status': 'success',
                        'message': f'Status transition executed successfully for {issue_key}',
                        'data': {
                            'issue_key': issue_key,
                            'transition_id': transition_id,
                        },
                    }
                else:
                    error_text = await response.text()
                    return {
                        'status': 'error',
                        'message': f'Failed to execute status transition: {response.status}',
                        'details': {
                            'status_code': response.status,
                            'response': error_text,
                        },
                    }

        except Exception as e:
            logger.error(f'Failed to execute status transition: {str(e)}')
            return {
                'status': 'error',
                'message': f'Status transition execution failed: {str(e)}',
                'details': {'exception': str(e)},
            }

    def clear_cache(self, cache_type: Optional[str] = None):
        if cache_type:
            keys_to_remove = [k for k in self.cache.keys() if cache_type in k]
            for key in keys_to_remove:
                del self.cache[key]
        else:
            self.cache.clear()


jira_workflow_service = JiraWorkflowService()
