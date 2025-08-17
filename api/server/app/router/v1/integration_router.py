from typing import List
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.db import get_db
from app.core.auth import get_current_token_data
from app.schemas.auth_schema import TokenData
from app.schemas.integration_schema import (
    IntegrationCreate,
    IntegrationUpdate,
    IntegrationResponse,
    IntegrationMappingCreate,
    IntegrationMappingResponse,
    WebhookCreate,
    WebhookUpdate,
    WebhookResponse,
    SyncRequest,
    SyncResponse,
    JIRAConfig,
    GitHubConfig
)
from app.services.integration_service import integration_service

router = APIRouter(prefix='/integrations', tags=['integrations'])


@router.post('/', response_model=IntegrationResponse, status_code=status.HTTP_201_CREATED)
async def create_integration(
    integration_data: IntegrationCreate,
    db: AsyncSession = Depends(get_db),
    current_user: TokenData = Depends(get_current_token_data)
):
    return await integration_service.create_integration(
        db, UUID(current_user.user_id), integration_data
    )


@router.get('/{integration_id}', response_model=IntegrationResponse)
async def get_integration(
    integration_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: TokenData = Depends(get_current_token_data)
):
    integration = await integration_service.get_integration(
        db, UUID(current_user.user_id), integration_id
    )
    if not integration:
        raise HTTPException(status_code=404, detail="Integration not found")
    return integration


@router.get('/', response_model=List[IntegrationResponse])
async def list_integrations(
    project_id: UUID,
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=100, ge=1, le=1000),
    db: AsyncSession = Depends(get_db),
    current_user: TokenData = Depends(get_current_token_data)
):
    return await integration_service.list_integrations(
        db, UUID(current_user.user_id), project_id, skip, limit
    )


@router.put('/{integration_id}', response_model=IntegrationResponse)
async def update_integration(
    integration_id: UUID,
    integration_data: IntegrationUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: TokenData = Depends(get_current_token_data)
):
    integration = await integration_service.update_integration(
        db, UUID(current_user.user_id), integration_id, integration_data
    )
    if not integration:
        raise HTTPException(status_code=404, detail="Integration not found")
    return integration


@router.delete('/{integration_id}', status_code=status.HTTP_204_NO_CONTENT)
async def delete_integration(
    integration_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: TokenData = Depends(get_current_token_data)
):
    success = await integration_service.delete_integration(
        db, UUID(current_user.user_id), integration_id
    )
    if not success:
        raise HTTPException(status_code=404, detail="Integration not found")


@router.post('/{integration_id}/test')
async def test_integration(
    integration_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: TokenData = Depends(get_current_token_data)
):
    return await integration_service.test_integration(
        db, UUID(current_user.user_id), integration_id
    )


@router.post('/{integration_id}/sync')
async def sync_integration(
    integration_id: UUID,
    sync_request: SyncRequest,
    db: AsyncSession = Depends(get_db),
    current_user: TokenData = Depends(get_current_token_data)
):
    return await integration_service.sync_integration(
        db, UUID(current_user.user_id), integration_id, sync_request.sync_type
    )


@router.post('/{integration_id}/export/feedback/{feedback_id}')
async def export_feedback(
    integration_id: UUID,
    feedback_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: TokenData = Depends(get_current_token_data)
):
    from app.services.jira_integration_service import jira_service
    from app.services.github_integration_service import github_service
    from app.repositories.integration_repository import integration_repository
    
    integration = await integration_repository.get(db, integration_id)
    if not integration:
        raise HTTPException(status_code=404, detail="Integration not found")
    
    from app.models.integration_model import IntegrationType
    
    if integration.integration_type == IntegrationType.JIRA:
        result = await jira_service.export_feedback_to_jira(db, integration, feedback_id)
    elif integration.integration_type == IntegrationType.GITHUB:
        result = await github_service.export_feedback_to_github(db, integration, feedback_id)
    else:
        raise HTTPException(status_code=400, detail=f"Export not supported for {integration.integration_type}")
    
    if result.get("status") == "error":
        raise HTTPException(status_code=400, detail=result.get("message"))
    
    return result


@router.post('/{integration_id}/mappings', response_model=IntegrationMappingResponse)
async def create_mapping(
    integration_id: UUID,
    mapping_data: IntegrationMappingCreate,
    db: AsyncSession = Depends(get_db),
    current_user: TokenData = Depends(get_current_token_data)
):
    return await integration_service.create_mapping(
        db, UUID(current_user.user_id), mapping_data
    )


@router.get('/{integration_id}/mappings', response_model=List[IntegrationMappingResponse])
async def list_mappings(
    integration_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: TokenData = Depends(get_current_token_data)
):
    return await integration_service.list_mappings(
        db, UUID(current_user.user_id), integration_id
    )


@router.post('/webhooks', response_model=WebhookResponse, status_code=status.HTTP_201_CREATED)
async def create_webhook(
    webhook_data: WebhookCreate,
    db: AsyncSession = Depends(get_db),
    current_user: TokenData = Depends(get_current_token_data)
):
    return await integration_service.create_webhook(
        db, UUID(current_user.user_id), webhook_data
    )


@router.get('/webhooks', response_model=List[WebhookResponse])
async def list_webhooks(
    project_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: TokenData = Depends(get_current_token_data)
):
    return await integration_service.list_webhooks(
        db, UUID(current_user.user_id), project_id
    )


@router.put('/webhooks/{webhook_id}', response_model=WebhookResponse)
async def update_webhook(
    webhook_id: UUID,
    webhook_data: WebhookUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: TokenData = Depends(get_current_token_data)
):
    webhook = await integration_service.update_webhook(
        db, UUID(current_user.user_id), webhook_id, webhook_data
    )
    if not webhook:
        raise HTTPException(status_code=404, detail="Webhook not found")
    return webhook


@router.delete('/webhooks/{webhook_id}', status_code=status.HTTP_204_NO_CONTENT)
async def delete_webhook(
    webhook_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: TokenData = Depends(get_current_token_data)
):
    success = await integration_service.delete_webhook(
        db, UUID(current_user.user_id), webhook_id
    )
    if not success:
        raise HTTPException(status_code=404, detail="Webhook not found")


@router.post('/webhooks/{webhook_id}/test')
async def test_webhook(
    webhook_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: TokenData = Depends(get_current_token_data)
):
    from app.services.webhook_service import webhook_service
    from app.repositories.integration_repository import webhook_repository
    
    webhook = await webhook_repository.get(db, webhook_id)
    if not webhook:
        raise HTTPException(status_code=404, detail="Webhook not found")
    
    from app.services.organization_service import organization_service
    await organization_service.check_project_access(db, UUID(current_user.user_id), webhook.project_id)
    
    result = await webhook_service.test_webhook(db, webhook)
    return result