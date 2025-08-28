from typing import Dict, Any
from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.logging import get_logger
from app.models.integration_model import IntegrationType
from app.repositories.integration_repository import integration_repository
from app.services.jira_integration_service import jira_integration_service, JiraAuthType
from app.schemas.jira_schema import JiraConfig, JiraConfigUpdate

logger = get_logger(__name__)


class IntegrationSetupService:
    def __init__(self):
        self.jira_service = jira_integration_service

    async def test_jira_connection(
        self, jira_url: str, auth_type: JiraAuthType, auth_data: Dict[str, Any]
    ) -> Dict[str, Any]:
        try:
            config = {'base_url': jira_url}
            result = await self.jira_service.test_connection(
                config, auth_data, auth_type
            )
            return result
        except Exception as e:
            logger.error(f'JIRA connection test failed: {str(e)}')
            return {
                'status': 'error',
                'connection_status': 'unknown_error',
                'message': f'Connection test failed: {str(e)}',
                'details': {'exception': str(e)},
            }

    async def get_jira_projects(
        self,
        jira_url: str,
        auth_type: JiraAuthType,
        auth_data: Dict[str, Any],
        force_refresh: bool = False,
    ) -> Dict[str, Any]:
        try:
            config = {'base_url': jira_url}
            result = await self.jira_service.discover_projects(
                config, auth_data, auth_type, force_refresh
            )
            return result
        except Exception as e:
            logger.error(f'Failed to get JIRA projects: {str(e)}')
            return {
                'status': 'error',
                'message': f'Failed to get projects: {str(e)}',
                'details': {'exception': str(e)},
            }

    async def validate_project_access(
        self,
        jira_url: str,
        auth_type: JiraAuthType,
        auth_data: Dict[str, Any],
        project_key: str,
    ) -> Dict[str, Any]:
        try:
            config = {'base_url': jira_url}
            result = await self.jira_service.validate_project_access(
                config, auth_data, project_key, auth_type
            )
            return result
        except Exception as e:
            logger.error(f'Project access validation failed: {str(e)}')
            return {
                'status': 'error',
                'message': f'Project validation failed: {str(e)}',
                'details': {'exception': str(e)},
            }

    async def create_jira_integration(
        self,
        db: AsyncSession,
        project_id: UUID,
        config: JiraConfig,
        auth_data: Dict[str, Any],
        created_by: UUID,
    ) -> Dict[str, Any]:
        try:
            integration_data = {
                'project_id': project_id,
                'integration_type': IntegrationType.JIRA,
                'name': f'JIRA Integration - {config.project_key}',
                'config': {
                    'base_url': config.jira_url,
                    'project_key': config.project_key,
                    'default_issue_type': config.default_issue_type,
                    'default_priority': config.default_priority,
                    'status_mapping': config.status_mapping,
                    'auto_create_issues': config.auto_create_issues,
                    'include_metadata': config.include_metadata,
                    'default_assignee': config.default_assignee,
                    'default_reporter': config.default_reporter,
                    'components': config.components,
                    'labels': config.labels,
                },
                'auth_data': auth_data,
                'is_active': True,
                'created_by': created_by,
            }

            integration = await integration_repository.create(db, **integration_data)
            logger.info(
                f'Created JIRA integration {integration.id} for project {project_id}'
            )

            return {
                'status': 'success',
                'message': 'JIRA integration created successfully',
                'integration_id': integration.id,
                'integration': integration,
            }

        except Exception as e:
            logger.error(f'Failed to create JIRA integration: {str(e)}')
            return {
                'status': 'error',
                'message': f'Failed to create integration: {str(e)}',
                'details': {'exception': str(e)},
            }

    async def update_jira_integration(
        self, db: AsyncSession, integration_id: UUID, config_update: JiraConfigUpdate
    ) -> Dict[str, Any]:
        try:
            integration = await integration_repository.get(db, integration_id)
            if not integration:
                return {
                    'status': 'error',
                    'message': 'Integration not found',
                    'details': {'integration_id': str(integration_id)},
                }

            if integration.integration_type != IntegrationType.JIRA:
                return {
                    'status': 'error',
                    'message': 'Integration is not a JIRA integration',
                    'details': {'integration_type': integration.integration_type.value},
                }

            current_config = integration.config or {}
            updated_config = {**current_config}

            for field, value in config_update.dict(exclude_unset=True).items():
                updated_config[field] = value

            update_data = {'config': updated_config}
            updated_integration = await integration_repository.update(
                db, integration_id, **update_data
            )

            logger.info(f'Updated JIRA integration {integration_id}')

            return {
                'status': 'success',
                'message': 'JIRA integration updated successfully',
                'integration': updated_integration,
            }

        except Exception as e:
            logger.error(f'Failed to update JIRA integration: {str(e)}')
            return {
                'status': 'error',
                'message': f'Failed to update integration: {str(e)}',
                'details': {'exception': str(e)},
            }

    async def get_jira_integration_config(
        self, db: AsyncSession, integration_id: UUID
    ) -> Dict[str, Any]:
        try:
            integration = await integration_repository.get_with_project(
                db, integration_id
            )

            if not integration:
                return {
                    'status': 'error',
                    'message': 'Integration not found',
                    'details': {'integration_id': str(integration_id)},
                }

            if integration.integration_type != IntegrationType.JIRA:
                return {
                    'status': 'error',
                    'message': 'Integration is not a JIRA integration',
                    'details': {'integration_type': integration.integration_type.value},
                }

            return {
                'status': 'success',
                'message': 'JIRA integration config retrieved',
                'integration': integration,
                'config': integration.config,
                'auth_data': integration.auth_data,
            }

        except Exception as e:
            logger.error(f'Failed to get JIRA integration config: {str(e)}')
            return {
                'status': 'error',
                'message': f'Failed to get integration config: {str(e)}',
                'details': {'exception': str(e)},
            }

    async def delete_jira_integration(
        self, db: AsyncSession, integration_id: UUID
    ) -> Dict[str, Any]:
        try:
            integration = await integration_repository.get(db, integration_id)
            if not integration:
                return {
                    'status': 'error',
                    'message': 'Integration not found',
                    'details': {'integration_id': str(integration_id)},
                }

            await integration_repository.delete(db, integration_id)
            logger.info(f'Deleted JIRA integration {integration_id}')

            return {
                'status': 'success',
                'message': 'JIRA integration deleted successfully',
            }

        except Exception as e:
            logger.error(f'Failed to delete JIRA integration: {str(e)}')
            return {
                'status': 'error',
                'message': f'Failed to delete integration: {str(e)}',
                'details': {'exception': str(e)},
            }

    async def get_project_integrations(
        self, db: AsyncSession, project_id: UUID
    ) -> Dict[str, Any]:
        try:
            integrations = await integration_repository.get_by_project(db, project_id)
            jira_integrations = [
                i for i in integrations if i.integration_type == IntegrationType.JIRA
            ]

            return {
                'status': 'success',
                'message': f'Found {len(jira_integrations)} JIRA integrations',
                'integrations': jira_integrations,
            }

        except Exception as e:
            logger.error(f'Failed to get project integrations: {str(e)}')
            return {
                'status': 'error',
                'message': f'Failed to get integrations: {str(e)}',
                'details': {'exception': str(e)},
            }


integration_setup_service = IntegrationSetupService()
