import aiohttp
import asyncio
from typing import Dict, Any, List, Optional
from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession
from datetime import datetime, timezone
from fastapi import BackgroundTasks

from app.models.integration_model import Integration, MappingType
from app.repositories.integration_repository import (
    integration_repository,
    integration_mapping_repository,
)
from app.repositories.feedback_repository import feedback_repository
from app.services.tasks.executor_factory import task_executor_factory
from app.core.logging import get_logger

logger = get_logger(__name__)


class GitHubIntegrationService:
    def __init__(self):
        self.session: Optional[aiohttp.ClientSession] = None
        self.base_url = 'https://api.github.com'

    async def get_session(self) -> aiohttp.ClientSession:
        if self.session is None or self.session.closed:
            self.session = aiohttp.ClientSession()
        return self.session

    def _get_auth_header(self, auth_data: Dict[str, Any]) -> Dict[str, str]:
        access_token = auth_data.get('access_token')
        if not access_token:
            raise ValueError('GitHub access token is required')

        return {
            'Authorization': f'Bearer {access_token}',
            'Accept': 'application/vnd.github.v3+json',
            'Content-Type': 'application/json',
        }

    async def test_connection(
        self, config: Dict[str, Any], auth_data: Dict[str, Any]
    ) -> Dict[str, Any]:
        try:
            headers = self._get_auth_header(auth_data)
            session = await self.get_session()

            async with session.get(
                f'{self.base_url}/user', headers=headers
            ) as response:
                if response.status == 200:
                    user_info = await response.json()
                    return {
                        'status': 'success',
                        'message': f"Connected to GitHub as {user_info.get('login', 'Unknown')}",
                        'user_info': user_info,
                    }
                else:
                    error_text = await response.text()
                    return {
                        'status': 'error',
                        'message': f'GitHub connection failed: {response.status}',
                        'details': error_text,
                    }
        except Exception as e:
            logger.error(f'GitHub connection test failed: {str(e)}')
            return {'status': 'error', 'message': f'Connection failed: {str(e)}'}

    async def get_repository_info(
        self, config: Dict[str, Any], auth_data: Dict[str, Any]
    ) -> Dict[str, Any]:
        try:
            repo_owner = config.get('repo_owner')
            repo_name = config.get('repo_name')

            if not repo_owner or not repo_name:
                return {
                    'status': 'error',
                    'message': 'GitHub repo owner and name are required',
                }

            headers = self._get_auth_header(auth_data)
            session = await self.get_session()

            async with session.get(
                f'{self.base_url}/repos/{repo_owner}/{repo_name}', headers=headers
            ) as response:
                if response.status == 200:
                    repo_info = await response.json()
                    return {'status': 'success', 'repository': repo_info}
                else:
                    error_text = await response.text()
                    return {
                        'status': 'error',
                        'message': f'Failed to get repository info: {error_text}',
                    }

        except Exception as e:
            logger.error(f'Failed to get GitHub repository info: {str(e)}')
            return {'status': 'error', 'message': str(e)}

    async def create_issue(
        self,
        config: Dict[str, Any],
        auth_data: Dict[str, Any],
        issue_data: Dict[str, Any],
    ) -> Dict[str, Any]:
        try:
            repo_owner = config.get('repo_owner')
            repo_name = config.get('repo_name')

            headers = self._get_auth_header(auth_data)
            session = await self.get_session()

            github_issue = {
                'title': issue_data.get('title', 'Feedback from Product'),
                'body': issue_data.get('description', 'No description provided'),
            }

            if 'labels' in issue_data:
                github_issue['labels'] = issue_data['labels']

            if 'assignees' in issue_data:
                github_issue['assignees'] = issue_data['assignees']

            async with session.post(
                f'{self.base_url}/repos/{repo_owner}/{repo_name}/issues',
                headers=headers,
                json=github_issue,
            ) as response:
                if response.status == 201:
                    created_issue = await response.json()
                    return {
                        'status': 'success',
                        'issue': created_issue,
                        'number': created_issue.get('number'),
                        'url': created_issue.get('html_url'),
                    }
                else:
                    error_text = await response.text()
                    logger.error(f'GitHub issue creation failed: {error_text}')
                    return {
                        'status': 'error',
                        'message': f'Failed to create issue: {error_text}',
                    }

        except Exception as e:
            logger.error(f'Failed to create GitHub issue: {str(e)}')
            return {'status': 'error', 'message': str(e)}

    async def update_issue(
        self,
        config: Dict[str, Any],
        auth_data: Dict[str, Any],
        issue_number: str,
        update_data: Dict[str, Any],
    ) -> Dict[str, Any]:
        try:
            repo_owner = config.get('repo_owner')
            repo_name = config.get('repo_name')

            headers = self._get_auth_header(auth_data)
            session = await self.get_session()

            github_update = {}

            if 'title' in update_data:
                github_update['title'] = update_data['title']

            if 'description' in update_data:
                github_update['body'] = update_data['description']

            if 'state' in update_data:
                github_update['state'] = update_data['state']

            async with session.patch(
                f'{self.base_url}/repos/{repo_owner}/{repo_name}/issues/{issue_number}',
                headers=headers,
                json=github_update,
            ) as response:
                if response.status == 200:
                    updated_issue = await response.json()
                    return {
                        'status': 'success',
                        'message': f'Issue #{issue_number} updated successfully',
                        'url': updated_issue.get('html_url'),
                    }
                else:
                    error_text = await response.text()
                    return {
                        'status': 'error',
                        'message': f'Failed to update issue: {error_text}',
                    }

        except Exception as e:
            logger.error(f'Failed to update GitHub issue: {str(e)}')
            return {'status': 'error', 'message': str(e)}

    async def export_feedback_to_github(
        self, db: AsyncSession, integration: Integration, feedback_id: UUID
    ) -> Dict[str, Any]:
        try:
            feedback = await feedback_repository.get(db, feedback_id)
            if not feedback:
                return {'status': 'error', 'message': 'Feedback not found'}

            issue_data = {
                'title': feedback.title or f'Feedback: {feedback.message[:50]}...',
                'description': feedback.message or 'No description provided',
                'labels': ['feedback', 'product-feedback'],
            }

            result = await self.create_issue(
                integration.config, integration.auth_data, issue_data
            )

            if result.get('status') == 'success':
                mapping_data = {
                    'integration_id': integration.id,
                    'mapping_type': MappingType.FEEDBACK_TO_ISSUE,
                    'internal_id': feedback_id,
                    'external_id': str(result.get('number')),
                    'external_url': result.get('url'),
                    'mapping_metadata': {
                        'created_at': datetime.now(timezone.utc).isoformat()
                    },
                }

                await integration_mapping_repository.create(db, **mapping_data)
                logger.info(
                    f"Exported feedback {feedback_id} to GitHub issue #{result.get('number')}"
                )

            return result

        except Exception as e:
            logger.error(f'Failed to export feedback to GitHub: {str(e)}')
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
                                        f"Failed to sync issue #{mapping.external_id}: {result.get('message')}"
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
            logger.error(f'GitHub sync failed: {str(e)}')
            return {'status': 'error', 'message': str(e)}

    async def close(self):
        if self.session and not self.session.closed:
            await self.session.close()

    async def create_issue_from_feedback_async(
        self,
        db: AsyncSession,
        background_tasks: BackgroundTasks,
        integration_id: UUID,
        feedback_id: UUID,
        title: Optional[str] = None,
        labels: Optional[List[str]] = None,
    ) -> Dict[str, Any]:
        try:
            integration = await integration_repository.get(db, integration_id)
            if not integration:
                return {'status': 'error', 'message': 'Integration not found'}

            feedback = await feedback_repository.get(db, feedback_id)
            if not feedback:
                return {'status': 'error', 'message': 'Feedback not found'}

            issue_data = {
                'title': title or feedback.title or f'Feedback: {feedback.id}',
                'body': feedback.message or '',
                'labels': labels or ['feedback'],
            }

            executor = task_executor_factory(background_tasks)
            task_payload = {
                'integration_id': integration_id,
                'feedback_id': feedback_id,
                'issue_data': issue_data,
            }

            asyncio.create_task(
                self._execute_issue_creation_task(
                    executor, integration_id, feedback_id, task_payload
                )
            )

            logger.info(
                'github_issue.creation.queued',
                integration_id=str(integration_id),
                feedback_id=str(feedback_id),
            )

            return {
                'status': 'queued',
                'message': 'GitHub issue creation has been queued',
            }

        except Exception as e:
            logger.error(
                'github_issue.creation.failed',
                integration_id=str(integration_id),
                feedback_id=str(feedback_id),
                error=str(e),
            )
            return {
                'status': 'error',
                'message': f'Failed to queue issue creation: {str(e)}',
            }

    async def _execute_issue_creation_task(
        self,
        executor,
        integration_id: UUID,
        feedback_id: UUID,
        task_payload: Dict[str, Any],
    ):
        try:
            await executor.execute('create_external_issue', task_payload)
        except Exception as e:
            logger.error(
                'github_issue.creation.execute_failed',
                integration_id=str(integration_id),
                feedback_id=str(feedback_id),
                error=str(e),
            )

    async def sync_repository_data_async(
        self, db: AsyncSession, background_tasks: BackgroundTasks, integration_id: UUID
    ) -> Dict[str, Any]:
        try:
            integration = await integration_repository.get(db, integration_id)
            if not integration:
                return {'status': 'error', 'message': 'Integration not found'}

            executor = task_executor_factory(background_tasks)

            asyncio.create_task(self._execute_sync_task(executor, integration_id))

            logger.info('github.sync.queued', integration_id=str(integration_id))

            return {
                'status': 'queued',
                'message': 'GitHub repository sync has been queued',
            }

        except Exception as e:
            logger.error(
                'github.sync.failed', integration_id=str(integration_id), error=str(e)
            )
            return {
                'status': 'error',
                'message': f'Failed to queue repository sync: {str(e)}',
            }

    async def _execute_sync_task(self, executor, integration_id: UUID):
        """Execute the GitHub repository sync task, wrapped in exception handling."""
        try:
            await executor.execute(
                'sync_integration_data', {'integration_id': integration_id}
            )
        except Exception as e:
            logger.error(
                'github.sync.execute_failed',
                integration_id=str(integration_id),
                error=str(e),
            )


github_integration_service = GitHubIntegrationService()
