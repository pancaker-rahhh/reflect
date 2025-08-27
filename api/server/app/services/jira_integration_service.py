from typing import Dict, Any, Optional
from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.logging import get_logger
from app.services.jira.jira_auth_service import JiraAuthType, jira_auth_service
from app.services.jira.jira_project_service import jira_project_service
from app.services.jira.jira_issue_service import jira_issue_service
from app.models.integration_model import Integration, IntegrationType

logger = get_logger(__name__)


class JiraIntegrationService:
    def __init__(self):
        self.auth_service = jira_auth_service
        self.project_service = jira_project_service
        self.issue_service = jira_issue_service

    async def test_connection(
        self,
        config: Dict[str, Any],
        auth_data: Dict[str, Any],
        auth_type: JiraAuthType = JiraAuthType.API_TOKEN,
    ) -> Dict[str, Any]:
        return await self.auth_service.test_connection_comprehensive(
            config, auth_data, auth_type
        )

    async def discover_projects(
        self,
        config: Dict[str, Any],
        auth_data: Dict[str, Any],
        auth_type: JiraAuthType = JiraAuthType.API_TOKEN,
        force_refresh: bool = False,
    ) -> Dict[str, Any]:
        return await self.project_service.discover_projects(
            config, auth_data, auth_type, force_refresh
        )

    async def validate_project_access(
        self,
        config: Dict[str, Any],
        auth_data: Dict[str, Any],
        project_key: str,
        auth_type: JiraAuthType = JiraAuthType.API_TOKEN,
    ) -> Dict[str, Any]:
        return await self.project_service.validate_project_access(
            config, auth_data, project_key, auth_type
        )

    async def create_issue_from_action_item(
        self,
        db: AsyncSession,
        integration: Integration,
        action_item_id: UUID,
        jira_config: Dict[str, Any],
        auth_type: JiraAuthType = JiraAuthType.API_TOKEN,
    ) -> Dict[str, Any]:
        return await self.issue_service.create_issue_from_action_item(
            db, integration, action_item_id, jira_config, auth_type
        )

    async def update_issue(
        self,
        config: Dict[str, Any],
        auth_data: Dict[str, Any],
        issue_key: str,
        update_data: Dict[str, Any],
        auth_type: JiraAuthType = JiraAuthType.API_TOKEN,
    ) -> Dict[str, Any]:
        return await self.issue_service.update_issue(
            config, auth_data, issue_key, update_data, auth_type
        )

    async def get_issue_status(
        self,
        config: Dict[str, Any],
        auth_data: Dict[str, Any],
        issue_key: str,
        auth_type: JiraAuthType = JiraAuthType.API_TOKEN,
    ) -> Dict[str, Any]:
        return await self.issue_service.get_issue_status(
            config, auth_data, issue_key, auth_type
        )

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

            jira_config = {
                'project_key': integration.config.get('project_key'),
                'issue_type': integration.config.get('issue_type', 'Task'),
                'priority': integration.config.get('priority'),
                'components': integration.config.get('components', []),
                'assignee': integration.config.get('default_assignee'),
                'reporter': integration.config.get('default_reporter'),
            }

            if existing_integration:
                result = await self.issue_service.update_issue(
                    integration.config,
                    integration.auth_data,
                    existing_integration.external_id,
                    {
                        'title': action_item.title,
                        'description': action_item.description,
                        'priority': jira_config.get('priority'),
                        'labels': [tag.name for tag in action_item.tags]
                        if action_item.tags
                        else [],
                    },
                )
            else:
                result = await self.issue_service.create_issue_from_action_item(
                    db, integration, action_item_id, jira_config
                )

            return result

        except Exception as e:
            logger.error(f'Failed to sync action item to JIRA: {str(e)}')
            return {'status': 'error', 'message': str(e)}

    def get_oauth_authorization_url(
        self,
        base_url: str,
        client_id: str,
        redirect_uri: str,
        state: Optional[str] = None,
    ) -> Dict[str, Any]:
        return self.auth_service.get_oauth_authorization_url(
            base_url, client_id, redirect_uri, state
        )

    async def exchange_oauth_code_for_tokens(
        self,
        base_url: str,
        client_id: str,
        client_secret: str,
        authorization_code: str,
        redirect_uri: str,
    ) -> Dict[str, Any]:
        return await self.auth_service.exchange_oauth_code_for_tokens(
            base_url, client_id, client_secret, authorization_code, redirect_uri
        )

    async def refresh_oauth_token(
        self, base_url: str, client_id: str, client_secret: str, refresh_token: str
    ) -> Dict[str, Any]:
        return await self.auth_service.refresh_oauth_token(
            base_url, client_id, client_secret, refresh_token
        )

    def detect_jira_instance_type(self, base_url: str):
        return self.auth_service.detect_jira_instance_type(base_url)

    def clear_cache(self, cache_type: Optional[str] = None):
        self.project_service.clear_cache(cache_type)

    async def close(self):
        await self.auth_service.close()


jira_integration_service = JiraIntegrationService()
