from typing import List, Optional
from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from app.models.integration_model import Integration, IntegrationMapping, IntegrationType
from app.models.webhook_model import Webhook
from app.repositories.base_repository import BaseRepository


class IntegrationRepository(BaseRepository[Integration]):
    def __init__(self):
        super().__init__(Integration)

    async def get_by_project(
        self, db: AsyncSession, project_id: UUID, skip: int = 0, limit: int = 100
    ) -> List[Integration]:
        return await self.get_multi(db, project_id=project_id, skip=skip, limit=limit)

    async def get_by_type(
        self, db: AsyncSession, project_id: UUID, integration_type: IntegrationType
    ) -> List[Integration]:
        return await self.get_multi(db, project_id=project_id, integration_type=integration_type)

    async def get_active_integrations(
        self, db: AsyncSession, project_id: UUID
    ) -> List[Integration]:
        return await self.get_multi(db, project_id=project_id, is_active=True)

    async def get_with_mappings(
        self, db: AsyncSession, integration_id: UUID
    ) -> Optional[Integration]:
        stmt = (
            select(Integration)
            .where(Integration.id == integration_id)
            .options(selectinload(Integration.mappings))
        )
        result = await db.execute(stmt)
        return result.scalar_one_or_none()


class IntegrationMappingRepository(BaseRepository[IntegrationMapping]):
    def __init__(self):
        super().__init__(IntegrationMapping)

    async def get_by_integration(
        self, db: AsyncSession, integration_id: UUID, skip: int = 0, limit: int = 100
    ) -> List[IntegrationMapping]:
        return await self.get_multi(db, integration_id=integration_id, skip=skip, limit=limit)

    async def get_by_internal_id(
        self, db: AsyncSession, internal_id: UUID
    ) -> List[IntegrationMapping]:
        return await self.get_multi(db, internal_id=internal_id)

    async def get_by_external_id(
        self, db: AsyncSession, integration_id: UUID, external_id: str
    ) -> Optional[IntegrationMapping]:
        stmt = select(IntegrationMapping).where(
            IntegrationMapping.integration_id == integration_id,
            IntegrationMapping.external_id == external_id
        )
        result = await db.execute(stmt)
        return result.scalar_one_or_none()

    async def get_active_mappings(
        self, db: AsyncSession, integration_id: UUID
    ) -> List[IntegrationMapping]:
        return await self.get_multi(db, integration_id=integration_id, is_active=True)


class WebhookRepository(BaseRepository[Webhook]):
    def __init__(self):
        super().__init__(Webhook)

    async def get_by_project(
        self, db: AsyncSession, project_id: UUID, skip: int = 0, limit: int = 100
    ) -> List[Webhook]:
        return await self.get_multi(db, project_id=project_id, skip=skip, limit=limit)

    async def get_active_webhooks(
        self, db: AsyncSession, project_id: UUID
    ) -> List[Webhook]:
        from app.models.webhook_model import WebhookStatus
        return await self.get_multi(db, project_id=project_id, status=WebhookStatus.ACTIVE)

    async def get_webhooks_for_event(
        self, db: AsyncSession, project_id: UUID, event_type: str
    ) -> List[Webhook]:
        stmt = (
            select(Webhook)
            .where(
                Webhook.project_id == project_id,
                Webhook.events.contains([event_type])
            )
        )
        result = await db.execute(stmt)
        return list(result.scalars().all())


integration_repository = IntegrationRepository()
integration_mapping_repository = IntegrationMappingRepository()
webhook_repository = WebhookRepository()