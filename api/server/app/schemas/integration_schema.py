from __future__ import annotations

from typing import Optional, Dict, Any, List
from uuid import UUID
from datetime import datetime
from pydantic import BaseModel, Field

from app.models.integration_model import IntegrationType, IntegrationStatus, MappingType
from app.models.webhook_model import WebhookEventType, WebhookStatus


class IntegrationBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    integration_type: IntegrationType
    config: Dict[str, Any] = Field(default_factory=dict)
    auth_data: Dict[str, Any] = Field(default_factory=dict)
    is_active: bool = Field(default=True)
    sync_enabled: bool = Field(default=False)


class IntegrationCreate(IntegrationBase):
    project_id: UUID


class IntegrationUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    config: Optional[Dict[str, Any]] = None
    auth_data: Optional[Dict[str, Any]] = None
    is_active: Optional[bool] = None
    sync_enabled: Optional[bool] = None
    status: Optional[IntegrationStatus] = None
    error_message: Optional[str] = None


class IntegrationResponse(IntegrationBase):
    id: UUID
    project_id: UUID
    status: IntegrationStatus
    last_sync_at: Optional[datetime] = None
    error_message: Optional[str] = None
    created_by: UUID
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class IntegrationMappingBase(BaseModel):
    mapping_type: MappingType
    internal_id: UUID
    external_id: str = Field(..., max_length=255)
    external_url: Optional[str] = Field(None, max_length=500)
    metadata: Dict[str, Any] = Field(default_factory=dict)
    is_active: bool = Field(default=True)


class IntegrationMappingCreate(IntegrationMappingBase):
    integration_id: UUID


class IntegrationMappingUpdate(BaseModel):
    external_id: Optional[str] = Field(None, max_length=255)
    external_url: Optional[str] = Field(None, max_length=500)
    metadata: Optional[Dict[str, Any]] = None
    sync_status: Optional[str] = None
    is_active: Optional[bool] = None


class IntegrationMappingResponse(IntegrationMappingBase):
    id: UUID
    integration_id: UUID
    sync_status: str
    last_synced_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class WebhookBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    url: str = Field(..., max_length=500)
    events: List[WebhookEventType] = Field(default_factory=list)
    headers: Dict[str, str] = Field(default_factory=dict)
    secret: Optional[str] = Field(None, max_length=255)
    retry_count: int = Field(default=3, ge=0, le=10)
    timeout_seconds: int = Field(default=30, ge=5, le=300)


class WebhookCreate(WebhookBase):
    project_id: UUID


class WebhookUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    url: Optional[str] = Field(None, max_length=500)
    events: Optional[List[WebhookEventType]] = None
    headers: Optional[Dict[str, str]] = None
    status: Optional[WebhookStatus] = None
    secret: Optional[str] = Field(None, max_length=255)
    retry_count: Optional[int] = Field(None, ge=0, le=10)
    timeout_seconds: Optional[int] = Field(None, ge=5, le=300)


class WebhookResponse(WebhookBase):
    id: UUID
    project_id: UUID
    status: WebhookStatus
    last_triggered_at: Optional[str] = None
    last_response_code: Optional[int] = None
    error_message: Optional[str] = None
    created_by: UUID
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class JIRAConfig(BaseModel):
    base_url: str = Field(..., description="JIRA instance base URL")
    username: str = Field(..., description="JIRA username")
    api_token: str = Field(..., description="JIRA API token")
    project_key: str = Field(..., description="JIRA project key")


class GitHubConfig(BaseModel):
    repo_owner: str = Field(..., description="GitHub repository owner")
    repo_name: str = Field(..., description="GitHub repository name")
    access_token: str = Field(..., description="GitHub access token")


class SyncRequest(BaseModel):
    integration_id: UUID
    sync_type: str = Field(..., description="Type of sync: full, incremental")
    options: Dict[str, Any] = Field(default_factory=dict)


class SyncResponse(BaseModel):
    integration_id: UUID
    status: str
    items_synced: int
    errors: List[str] = Field(default_factory=list)
    started_at: datetime
    completed_at: Optional[datetime] = None


class WebhookDelivery(BaseModel):
    webhook_id: UUID
    event_type: WebhookEventType
    payload: Dict[str, Any]
    response_code: Optional[int] = None
    response_body: Optional[str] = None
    error_message: Optional[str] = None
    delivered_at: datetime
    retry_count: int = Field(default=0)