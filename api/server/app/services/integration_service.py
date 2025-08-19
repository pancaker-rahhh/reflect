from typing import List, Optional, Dict, Any
from uuid import UUID
from datetime import datetime, timezone
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException

from app.models.integration_model import IntegrationType, IntegrationStatus
from app.repositories.integration_repository import (
    integration_repository,
    integration_mapping_repository,
    webhook_repository,
)
from app.schemas.integration_schema import (
    IntegrationCreate,
    IntegrationUpdate,
    IntegrationResponse,
    IntegrationMappingCreate,
    IntegrationMappingResponse,
    WebhookCreate,
    WebhookUpdate,
    WebhookResponse,
)
from app.services.organization_service import organization_service
from app.core.logging import get_logger

logger = get_logger(__name__)


class IntegrationService:
    async def create_integration(
        self, db: AsyncSession, user_id: UUID, integration_data: IntegrationCreate
    ) -> IntegrationResponse:
        await organization_service.check_project_access(
            db, user_id, integration_data.project_id, required_role='Admin'
        )

        integration_dict = integration_data.model_dump()
        integration_dict['created_by'] = user_id
        integration_dict['status'] = IntegrationStatus.PENDING

        integration = await integration_repository.create(db, **integration_dict)
        logger.info(
            f'Created integration {integration.id} for project {integration_data.project_id}'
        )

        return IntegrationResponse.model_validate(integration)

    async def get_integration(
        self, db: AsyncSession, user_id: UUID, integration_id: UUID
    ) -> Optional[IntegrationResponse]:
        integration = await integration_repository.get(db, integration_id)
        if not integration:
            return None

        await organization_service.check_project_access(
            db, user_id, integration.project_id
        )
        return IntegrationResponse.model_validate(integration)

    async def list_integrations(
        self,
        db: AsyncSession,
        user_id: UUID,
        project_id: UUID,
        skip: int = 0,
        limit: int = 100,
    ) -> List[IntegrationResponse]:
        await organization_service.check_project_access(db, user_id, project_id)

        integrations = await integration_repository.get_by_project(
            db, project_id, skip, limit
        )
        return [
            IntegrationResponse.model_validate(integration)
            for integration in integrations
        ]

    async def update_integration(
        self,
        db: AsyncSession,
        user_id: UUID,
        integration_id: UUID,
        integration_data: IntegrationUpdate,
    ) -> Optional[IntegrationResponse]:
        integration = await integration_repository.get(db, integration_id)
        if not integration:
            return None

        await organization_service.check_project_access(
            db, user_id, integration.project_id, required_role='Admin'
        )

        update_dict = integration_data.model_dump(exclude_unset=True)
        updated_integration = await integration_repository.update(
            db, integration_id, **update_dict
        )

        if updated_integration:
            logger.info(f'Updated integration {integration_id}')
            return IntegrationResponse.model_validate(updated_integration)
        return None

    async def delete_integration(
        self, db: AsyncSession, user_id: UUID, integration_id: UUID
    ) -> bool:
        integration = await integration_repository.get(db, integration_id)
        if not integration:
            return False

        await organization_service.check_project_access(
            db, user_id, integration.project_id, required_role='Admin'
        )

        success = await integration_repository.delete(db, integration_id)
        if success:
            logger.info(f'Deleted integration {integration_id}')
        return success

    async def test_integration(
        self, db: AsyncSession, user_id: UUID, integration_id: UUID
    ) -> Dict[str, Any]:
        integration = await integration_repository.get(db, integration_id)
        if not integration:
            raise HTTPException(status_code=404, detail='Integration not found')

        await organization_service.check_project_access(
            db, user_id, integration.project_id
        )

        if integration.integration_type == IntegrationType.JIRA:
            from app.services.jira_integration_service import jira_service

            return await jira_service.test_connection(
                integration.config, integration.auth_data
            )
        elif integration.integration_type == IntegrationType.GITHUB:
            from app.services.github_integration_service import github_service

            return await github_service.test_connection(
                integration.config, integration.auth_data
            )
        else:
            return {
                'status': 'error',
                'message': f'Testing not supported for {integration.integration_type}',
            }

    async def sync_integration(
        self,
        db: AsyncSession,
        user_id: UUID,
        integration_id: UUID,
        sync_type: str = 'incremental',
    ) -> Dict[str, Any]:
        integration = await integration_repository.get_with_mappings(db, integration_id)
        if not integration:
            raise HTTPException(status_code=404, detail='Integration not found')

        await organization_service.check_project_access(
            db, user_id, integration.project_id
        )

        if not integration.sync_enabled:
            raise HTTPException(
                status_code=400, detail='Sync is not enabled for this integration'
            )

        try:
            await integration_repository.update(
                db, integration_id, status=IntegrationStatus.ACTIVE
            )

            if integration.integration_type == IntegrationType.JIRA:
                from app.services.jira_integration_service import jira_service

                result = await jira_service.sync_data(db, integration, sync_type)
            elif integration.integration_type == IntegrationType.GITHUB:
                from app.services.github_integration_service import github_service

                result = await github_service.sync_data(db, integration, sync_type)
            else:
                raise HTTPException(
                    status_code=400,
                    detail=f'Sync not supported for {integration.integration_type}',
                )

            await integration_repository.update(
                db,
                integration_id,
                last_sync_at=datetime.now(timezone.utc),
                error_message=None,
            )

            logger.info(f'Synced integration {integration_id}: {result}')
            return result

        except Exception as e:
            error_msg = str(e)
            await integration_repository.update(
                db,
                integration_id,
                status=IntegrationStatus.ERROR,
                error_message=error_msg,
            )
            logger.error(f'Integration sync failed for {integration_id}: {error_msg}')
            raise HTTPException(status_code=500, detail=f'Sync failed: {error_msg}')

    async def create_mapping(
        self, db: AsyncSession, user_id: UUID, mapping_data: IntegrationMappingCreate
    ) -> IntegrationMappingResponse:
        integration = await integration_repository.get(db, mapping_data.integration_id)
        if not integration:
            raise HTTPException(status_code=404, detail='Integration not found')

        await organization_service.check_project_access(
            db, user_id, integration.project_id
        )

        mapping = await integration_mapping_repository.create(
            db, **mapping_data.model_dump()
        )
        return IntegrationMappingResponse.model_validate(mapping)

    async def list_mappings(
        self, db: AsyncSession, user_id: UUID, integration_id: UUID
    ) -> List[IntegrationMappingResponse]:
        integration = await integration_repository.get(db, integration_id)
        if not integration:
            raise HTTPException(status_code=404, detail='Integration not found')

        await organization_service.check_project_access(
            db, user_id, integration.project_id
        )

        mappings = await integration_mapping_repository.get_by_integration(
            db, integration_id
        )
        return [
            IntegrationMappingResponse.model_validate(mapping) for mapping in mappings
        ]

    async def create_webhook(
        self, db: AsyncSession, user_id: UUID, webhook_data: WebhookCreate
    ) -> WebhookResponse:
        await organization_service.check_project_access(
            db, user_id, webhook_data.project_id, required_role='Admin'
        )

        webhook_dict = webhook_data.model_dump()
        webhook_dict['created_by'] = user_id

        webhook = await webhook_repository.create(db, **webhook_dict)
        logger.info(
            f'Created webhook {webhook.id} for project {webhook_data.project_id}'
        )

        return WebhookResponse.model_validate(webhook)

    async def list_webhooks(
        self, db: AsyncSession, user_id: UUID, project_id: UUID
    ) -> List[WebhookResponse]:
        await organization_service.check_project_access(db, user_id, project_id)

        webhooks = await webhook_repository.get_by_project(db, project_id)
        return [WebhookResponse.model_validate(webhook) for webhook in webhooks]

    async def update_webhook(
        self,
        db: AsyncSession,
        user_id: UUID,
        webhook_id: UUID,
        webhook_data: WebhookUpdate,
    ) -> Optional[WebhookResponse]:
        webhook = await webhook_repository.get(db, webhook_id)
        if not webhook:
            return None

        await organization_service.check_project_access(
            db, user_id, webhook.project_id, required_role='Admin'
        )

        update_dict = webhook_data.model_dump(exclude_unset=True)
        updated_webhook = await webhook_repository.update(db, webhook_id, **update_dict)

        if updated_webhook:
            return WebhookResponse.model_validate(updated_webhook)
        return None

    async def delete_webhook(
        self, db: AsyncSession, user_id: UUID, webhook_id: UUID
    ) -> bool:
        webhook = await webhook_repository.get(db, webhook_id)
        if not webhook:
            return False

        await organization_service.check_project_access(
            db, user_id, webhook.project_id, required_role='Admin'
        )

        return await webhook_repository.delete(db, webhook_id)


integration_service = IntegrationService()
