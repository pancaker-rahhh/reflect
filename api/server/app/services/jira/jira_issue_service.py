import aiohttp
from typing import Dict, Any, Optional
from datetime import datetime, timezone
from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.logging import get_logger
from app.services.jira.jira_auth_service import JiraAuthType, jira_auth_service
from app.models.integration_model import Integration
from app.repositories.roadmap_repository import roadmap_feature_repository

logger = get_logger(__name__)


class JiraIssueService:
    def __init__(self):
        self.session: Optional[aiohttp.ClientSession] = None
        self.rate_limit_delay = 1.0
        self.max_retries = 3
        self.retry_delay = 2.0

    async def get_session(self) -> aiohttp.ClientSession:
        return await jira_auth_service.get_session()

    def _get_api_base_url(self, config: Dict[str, Any]) -> str:
        base_url = config.get('base_url', '').rstrip('/')
        jira_version = jira_auth_service.detect_jira_instance_type(base_url)

        if jira_version.value == 'cloud':
            return f'{base_url}/rest/api/3'
        else:
            return f'{base_url}/rest/api/3'

    async def create_issue_from_action_item(
        self,
        db: AsyncSession,
        integration: Integration,
        action_item_id: UUID,
        jira_config: Dict[str, Any],
        auth_type: JiraAuthType = JiraAuthType.API_TOKEN,
    ) -> Dict[str, Any]:
        try:
            action_item = await roadmap_feature_repository.get(db, action_item_id)
            if not action_item:
                return {
                    'status': 'error',
                    'message': 'Action item not found',
                    'details': {'action_item_id': str(action_item_id)},
                }

            project_validation = await self._validate_project_access(
                integration.config,
                integration.auth_data,
                jira_config.get('project_key'),
                auth_type,
            )
            if not project_validation['status'] == 'success':
                return project_validation

            issue_data = self._map_action_item_to_jira_issue(action_item, jira_config)
            validation_result = self._validate_issue_data(issue_data)
            if not validation_result['valid']:
                return {
                    'status': 'error',
                    'message': 'Issue data validation failed',
                    'details': validation_result['errors'],
                }

            result = await self._create_jira_issue(
                integration.config, integration.auth_data, issue_data, auth_type
            )

            if result['status'] == 'success':
                await self._store_integration_record(
                    db, action_item, integration, result, jira_config
                )

            return result

        except Exception as e:
            logger.error(f'Failed to create JIRA issue from action item: {str(e)}')
            return {
                'status': 'error',
                'message': f'Issue creation failed: {str(e)}',
                'details': {'exception': str(e)},
            }

    def _map_action_item_to_jira_issue(
        self, action_item, jira_config: Dict[str, Any]
    ) -> Dict[str, Any]:
        tags = [tag.name for tag in action_item.tags] if action_item.tags else []

        description = self._generate_issue_description(action_item, jira_config)

        issue_data = {
            'title': action_item.title,
            'description': description,
            'issue_type': jira_config.get('issue_type', 'Task'),
            'labels': tags,
            'project_key': jira_config.get('project_key'),
        }

        # Only include priority if it's enabled in the JIRA config
        if jira_config.get('enable_priority', True):
            priority = self._map_priority(getattr(action_item, 'priority', 'Medium'))
            if priority:
                issue_data['priority'] = priority

        if jira_config.get('components'):
            issue_data['components'] = jira_config.get('components')

        if jira_config.get('assignee'):
            issue_data['assignee'] = jira_config.get('assignee')

        if jira_config.get('reporter'):
            issue_data['reporter'] = jira_config.get('reporter')

        return issue_data

    def _generate_issue_description(
        self, action_item, jira_config: Dict[str, Any]
    ) -> str:
        description_parts = []

        if action_item.description:
            description_parts.append(f'## Description\n{action_item.description}')

        description_parts.append('## Reflect Metadata')
        description_parts.append(
            f"**Project:** {getattr(action_item.column.roadmap.project, 'name', 'Unknown')}"
        )
        description_parts.append(f'**Column:** {action_item.column.name}')
        description_parts.append(
            f"**Submitted by:** {action_item.submitter_name or 'Unknown'}"
        )
        description_parts.append(f'**Vote count:** {action_item.vote_count}')

        if action_item.tags:
            tag_names = [tag.name for tag in action_item.tags]
            description_parts.append(f"**Tags:** {', '.join(tag_names)}")

        description_parts.append(
            f"**Created:** {action_item.created_at.strftime('%Y-%m-%d %H:%M:%S UTC')}"
        )

        if action_item.converted_feedback:
            feedback = (
                action_item.converted_feedback[0]
                if action_item.converted_feedback
                else None
            )
            if feedback:
                description_parts.append('## Original Feedback')
                description_parts.append(f'**Type:** {feedback.feedback_type.value}')
                if feedback.message:
                    description_parts.append(f'**Message:** {feedback.message}')
                if feedback.submitter_name:
                    description_parts.append(
                        f'**Original submitter:** {feedback.submitter_name}'
                    )

        description_parts.append('\n---\n*Created from Reflect Action Item*')

        return '\n\n'.join(description_parts)

    def _map_priority(self, reflect_priority: str) -> str:
        priority_mapping = {
            'low': 'Low',
            'medium': 'Medium',
            'high': 'High',
            'critical': 'Critical',
        }
        return priority_mapping.get(reflect_priority.lower(), 'Medium')

    def _validate_issue_data(self, issue_data: Dict[str, Any]) -> Dict[str, Any]:
        errors = []

        if not issue_data.get('title'):
            errors.append('Title is required')
        elif len(issue_data['title']) > 255:
            errors.append('Title exceeds 255 characters')

        if not issue_data.get('project_key'):
            errors.append('Project key is required')

        if not issue_data.get('issue_type'):
            errors.append('Issue type is required')

        if issue_data.get('description') and len(issue_data['description']) > 32767:
            errors.append('Description exceeds 32767 characters')

        if issue_data.get('labels') and len(issue_data['labels']) > 100:
            errors.append('Too many labels (max 100)')

        return {'valid': len(errors) == 0, 'errors': errors}

    async def _validate_project_access(
        self,
        config: Dict[str, Any],
        auth_data: Dict[str, Any],
        project_key: str,
        auth_type: JiraAuthType,
    ) -> Dict[str, Any]:
        try:
            base_url = self._get_api_base_url(config)
            headers = jira_auth_service._get_auth_headers(
                jira_auth_service._decrypt_auth_data(auth_data), auth_type
            )
            session = await self.get_session()

            async with session.get(
                f'{base_url}/project/{project_key}', headers=headers
            ) as response:
                if response.status == 200:
                    return {'status': 'success'}
                elif response.status == 404:
                    return {
                        'status': 'error',
                        'message': f'Project {project_key} not found',
                    }
                elif response.status == 403:
                    return {
                        'status': 'error',
                        'message': f'No access to project {project_key}',
                    }
                else:
                    return {
                        'status': 'error',
                        'message': f'Project validation failed: {response.status}',
                    }

        except Exception as e:
            return {
                'status': 'error',
                'message': f'Project validation failed: {str(e)}',
            }

    async def _create_jira_issue(
        self,
        config: Dict[str, Any],
        auth_data: Dict[str, Any],
        issue_data: Dict[str, Any],
        auth_type: JiraAuthType,
    ) -> Dict[str, Any]:
        try:
            base_url = self._get_api_base_url(config)
            headers = jira_auth_service._get_auth_headers(
                jira_auth_service._decrypt_auth_data(auth_data), auth_type
            )
            session = await self.get_session()

            jira_issue = {
                'fields': {
                    'project': {'key': issue_data['project_key']},
                    'summary': issue_data['title'],
                    'description': self._format_description(issue_data['description']),
                    'issuetype': {'name': issue_data['issue_type']},
                }
            }

            if issue_data.get('priority'):
                jira_issue['fields']['priority'] = {'name': issue_data['priority']}

            if issue_data.get('labels'):
                jira_issue['fields']['labels'] = issue_data['labels']

            if issue_data.get('components'):
                jira_issue['fields']['components'] = [
                    {'name': component} for component in issue_data['components']
                ]

            if issue_data.get('assignee'):
                jira_issue['fields']['assignee'] = {'name': issue_data['assignee']}

            if issue_data.get('reporter'):
                jira_issue['fields']['reporter'] = {'name': issue_data['reporter']}

            # First attempt with priority
            response = await session.post(
                f'{base_url}/issue', headers=headers, json=jira_issue
            )

            if response.status == 201:
                created_issue = await response.json()
                issue_key = created_issue.get('key')
                issue_url = (
                    f"{config.get('base_url', '').rstrip('/')}/browse/{issue_key}"
                )

                logger.info(f'Successfully created JIRA issue {issue_key}')
                logger.debug(f'JIRA response: {created_issue}')
                return {
                    'status': 'success',
                    'message': 'JIRA issue created successfully',
                    'issue_key': issue_key,
                    'issue_url': issue_url,
                    'issue_id': created_issue.get('id'),
                    'issue_data': created_issue,
                }
            else:
                error_text = await response.text()

                # If it's a priority-related error, try again without priority
                if (
                    'priority' in error_text.lower()
                    and 'priority' in jira_issue['fields']
                ):
                    logger.warning(
                        f'Priority field not available, retrying without priority: {error_text}'
                    )

                    # Remove priority field and try again
                    del jira_issue['fields']['priority']

                    async with session.post(
                        f'{base_url}/issue', headers=headers, json=jira_issue
                    ) as retry_response:
                        if retry_response.status == 201:
                            created_issue = await retry_response.json()
                            issue_key = created_issue.get('key')
                            issue_url = f"{config.get('base_url', '').rstrip('/')}/browse/{issue_key}"

                            logger.info(
                                f'Successfully created JIRA issue {issue_key} (without priority)'
                            )
                            logger.debug(f'JIRA response: {created_issue}')
                            return {
                                'status': 'success',
                                'message': 'JIRA issue created successfully (without priority)',
                                'issue_key': issue_key,
                                'issue_url': issue_url,
                                'issue_id': created_issue.get('id'),
                                'issue_data': created_issue,
                            }
                        else:
                            retry_error_text = await retry_response.text()
                            logger.error(
                                f'JIRA issue creation failed even without priority: {retry_error_text}'
                            )
                            return {
                                'status': 'error',
                                'message': f'Failed to create issue: {retry_error_text}',
                                'details': {
                                    'status_code': retry_response.status,
                                    'response_text': retry_error_text,
                                },
                            }
                else:
                    logger.error(f'JIRA issue creation failed: {error_text}')
                    return {
                        'status': 'error',
                        'message': f'Failed to create issue: {error_text}',
                        'details': {
                            'status_code': response.status,
                            'response_text': error_text,
                        },
                    }

        except Exception as e:
            logger.error(f'Failed to create JIRA issue: {str(e)}')
            return {
                'status': 'error',
                'message': f'Issue creation failed: {str(e)}',
                'details': {'exception': str(e)},
            }

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

    async def _store_integration_record(
        self,
        db: AsyncSession,
        action_item,
        integration: Integration,
        result: Dict[str, Any],
        jira_config: Dict[str, Any],
    ):
        try:
            from app.repositories.roadmap_repository import (
                roadmap_action_item_integration_repository,
            )

            integration_data = {
                'action_item_id': action_item.id,
                'integration_id': integration.id,
                'external_id': result.get('issue_key'),
                'external_url': result.get('issue_url'),
                'external_status': 'To Do',
                'integration_metadata': {
                    'project_key': jira_config.get('project_key'),
                    'issue_type': jira_config.get('issue_type', 'Task'),
                    'priority': jira_config.get('priority'),
                    'components': jira_config.get('components', []),
                    'assignee': jira_config.get('assignee'),
                    'created_at': datetime.now(timezone.utc).isoformat(),
                },
                'last_synced_at': datetime.now(timezone.utc),
                'sync_status': 'synced',
            }

            await roadmap_action_item_integration_repository.create(
                db, **integration_data
            )
            logger.info(
                f'Stored integration record for action item {action_item.id} and JIRA issue {result.get("issue_key")}'
            )

        except Exception as e:
            logger.error(f'Failed to store integration record: {str(e)}')

    async def update_issue(
        self,
        config: Dict[str, Any],
        auth_data: Dict[str, Any],
        issue_key: str,
        update_data: Dict[str, Any],
        auth_type: JiraAuthType = JiraAuthType.API_TOKEN,
    ) -> Dict[str, Any]:
        try:
            base_url = self._get_api_base_url(config)
            headers = jira_auth_service._get_auth_headers(
                jira_auth_service._decrypt_auth_data(auth_data), auth_type
            )
            session = await self.get_session()

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

            async with session.put(
                f'{base_url}/issue/{issue_key}', headers=headers, json=jira_update
            ) as response:
                if response.status == 204:
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
    ) -> Dict[str, Any]:
        try:
            base_url = self._get_api_base_url(config)
            headers = jira_auth_service._get_auth_headers(
                jira_auth_service._decrypt_auth_data(auth_data), auth_type
            )
            session = await self.get_session()

            async with session.get(
                f'{base_url}/issue/{issue_key}', headers=headers
            ) as response:
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


jira_issue_service = JiraIssueService()
