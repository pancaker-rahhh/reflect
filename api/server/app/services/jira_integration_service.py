import aiohttp
from typing import Dict, Any, Optional
from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession
from datetime import datetime, timezone
import base64

from app.models.integration_model import Integration, MappingType
from app.repositories.integration_repository import integration_mapping_repository
from app.repositories.feedback_repository import feedback_repository
from app.core.logging import get_logger

logger = get_logger(__name__)


class JIRAIntegrationService:
    def __init__(self):
        self.session: Optional[aiohttp.ClientSession] = None

    async def get_session(self) -> aiohttp.ClientSession:
        if self.session is None or self.session.closed:
            self.session = aiohttp.ClientSession()
        return self.session

    def _get_auth_header(self, auth_data: Dict[str, Any]) -> Dict[str, str]:
        username = auth_data.get('username')
        api_token = auth_data.get('api_token')
        if not username or not api_token:
            raise ValueError('JIRA username and api_token are required')

        credentials = f'{username}:{api_token}'
        encoded_credentials = base64.b64encode(credentials.encode()).decode()

        return {
            'Authorization': f'Basic {encoded_credentials}',
            'Accept': 'application/json',
            'Content-Type': 'application/json',
        }

    async def test_connection(
        self, config: Dict[str, Any], auth_data: Dict[str, Any]
    ) -> Dict[str, Any]:
        try:
            base_url = config.get('base_url')
            if not base_url:
                return {'status': 'error', 'message': 'JIRA base URL is required'}

            headers = self._get_auth_header(auth_data)
            session = await self.get_session()

            async with session.get(
                f'{base_url}/rest/api/3/myself', headers=headers
            ) as response:
                if response.status == 200:
                    user_info = await response.json()
                    return {
                        'status': 'success',
                        'message': f'Connected to JIRA as {user_info.get("displayName", "Unknown")}',
                        'user_info': user_info,
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
        self, config: Dict[str, Any], auth_data: Dict[str, Any]
    ) -> Dict[str, Any]:
        try:
            base_url = config.get('base_url')
            project_key = config.get('project_key')

            if not base_url or not project_key:
                return {
                    'status': 'error',
                    'message': 'JIRA base URL and project key are required',
                }

            headers = self._get_auth_header(auth_data)
            session = await self.get_session()

            async with session.get(
                f'{base_url}/rest/api/3/project/{project_key}', headers=headers
            ) as response:
                if response.status == 200:
                    project_info = await response.json()
                    return {'status': 'success', 'project': project_info}
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
    ) -> Dict[str, Any]:
        try:
            base_url = config.get('base_url')
            project_key = config.get('project_key')

            headers = self._get_auth_header(auth_data)
            session = await self.get_session()

            jira_issue = {
                'fields': {
                    'project': {'key': project_key},
                    'summary': issue_data.get('title', 'Feedback from Product'),
                    'description': {
                        'type': 'doc',
                        'version': 1,
                        'content': [
                            {
                                'type': 'paragraph',
                                'content': [
                                    {
                                        'type': 'text',
                                        'text': issue_data.get(
                                            'description', 'No description provided'
                                        ),
                                    }
                                ],
                            }
                        ],
                    },
                    'issuetype': {'name': issue_data.get('issue_type', 'Task')},
                }
            }

            if 'priority' in issue_data:
                jira_issue['fields']['priority'] = {'name': issue_data['priority']}

            if 'labels' in issue_data:
                jira_issue['fields']['labels'] = issue_data['labels']

            async with session.post(
                f'{base_url}/rest/api/3/issue', headers=headers, json=jira_issue
            ) as response:
                if response.status == 201:
                    created_issue = await response.json()
                    return {
                        'status': 'success',
                        'issue': created_issue,
                        'key': created_issue.get('key'),
                        'url': f'{base_url}/browse/{created_issue.get("key")}',
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

    async def update_issue(
        self,
        config: Dict[str, Any],
        auth_data: Dict[str, Any],
        issue_key: str,
        update_data: Dict[str, Any],
    ) -> Dict[str, Any]:
        try:
            base_url = config.get('base_url')
            headers = self._get_auth_header(auth_data)
            session = await self.get_session()

            jira_update = {'fields': {}}

            if 'title' in update_data:
                jira_update['fields']['summary'] = update_data['title']

            if 'description' in update_data:
                jira_update['fields']['description'] = {
                    'type': 'doc',
                    'version': 1,
                    'content': [
                        {
                            'type': 'paragraph',
                            'content': [
                                {'type': 'text', 'text': update_data['description']}
                            ],
                        }
                    ],
                }

            async with session.put(
                f'{base_url}/rest/api/3/issue/{issue_key}',
                headers=headers,
                json=jira_update,
            ) as response:
                if response.status == 204:
                    return {
                        'status': 'success',
                        'message': f'Issue {issue_key} updated successfully',
                        'url': f'{base_url}/browse/{issue_key}',
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

    async def export_feedback_to_jira(
        self, db: AsyncSession, integration: Integration, feedback_id: UUID
    ) -> Dict[str, Any]:
        try:
            feedback = await feedback_repository.get(db, feedback_id)
            if not feedback:
                return {'status': 'error', 'message': 'Feedback not found'}

            project_key = integration.config.get('project_key')
            if not project_key:
                return {'status': 'error', 'message': 'Project key not configured in integration'}

            issue_type = 'Story' # Default issue type
            if feedback.issue_type:
                issue_type = feedback.issue_type

            # Map feedback fields to JIRA fields
            issue_data = {
                'summary': feedback.title or 'Feedback Submission',
                'description': feedback.message or 'No description provided',
                'project': {'key': project_key},
                'issuetype': {'name': issue_type},
            }

            # Add severity for bug reports
            if hasattr(feedback, 'severity_level') and feedback.severity_level:
                severity_mapping = {
                    'low': 'Low',
                    'medium': 'Medium',
                    'high': 'High',
                    'critical': 'Critical'
                }
                issue_data['priority'] = {'name': severity_mapping.get(
                    feedback.severity_level.value.lower(), 'Medium'
                )}

            result = await self.create_issue(
                integration.config, integration.auth_data, issue_data
            )

            if result.get('status') == 'success':
                mapping_data = {
                    'integration_id': integration.id,
                    'mapping_type': MappingType.FEEDBACK_TO_ISSUE,
                    'internal_id': feedback_id,
                    'external_id': result.get('key'),
                    'external_url': result.get('url'),
                    'mapping_metadata': {
                        'created_at': datetime.now(timezone.utc).isoformat()
                    },
                }

                await integration_mapping_repository.create(db, **mapping_data)
                logger.info(
                    f'Exported feedback {feedback_id} to JIRA issue {result.get("key")}'
                )

            return result

        except Exception as e:
            logger.error(f'Failed to export feedback to JIRA: {str(e)}')
            return {'status': 'error', 'message': str(e)}

    async def sync_data(
        self, db: AsyncSession, integration: Integration, sync_type: str = 'incremental'
    ) -> Dict[str, Any]:
        try:
            synced_count = 0
            errors = []

            if sync_type == 'full':
                mappings = await integration_mapping_repository.get_by_integration(
                    db, integration.id
                )

                for mapping in mappings:
                    try:
                        if mapping.mapping_type == MappingType.FEEDBACK_TO_ISSUE:
                            feedback = await feedback_repository.get(
                                db, mapping.internal_id
                            )
                            if feedback:
                                result = await self.update_issue(
                                    integration.config,
                                    integration.auth_data,
                                    mapping.external_id,
                                    {
                                        'title': feedback.title,
                                        'description': feedback.message,
                                    },
                                )

                                if result.get('status') == 'success':
                                    synced_count += 1
                                    await integration_mapping_repository.update(
                                        db,
                                        mapping.id,
                                        last_synced_at=datetime.now(timezone.utc),
                                    )
                                else:
                                    errors.append(
                                        f'Failed to sync {mapping.external_id}: {result.get("message")}'
                                    )

                    except Exception as e:
                        errors.append(f'Error syncing mapping {mapping.id}: {str(e)}')

            return {
                'status': 'success',
                'items_synced': synced_count,
                'errors': errors,
                'sync_type': sync_type,
            }

        except Exception as e:
            logger.error(f'JIRA sync failed: {str(e)}')
            return {'status': 'error', 'message': str(e)}

    async def close(self):
        if self.session and not self.session.closed:
            await self.session.close()


jira_service = JIRAIntegrationService()
