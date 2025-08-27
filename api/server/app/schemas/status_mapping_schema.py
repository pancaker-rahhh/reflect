from typing import Dict, Any, Optional, List
from pydantic import BaseModel, Field, validator
from enum import Enum


class SyncDirection(str, Enum):
    REFLECT_TO_JIRA = 'reflect_to_jira'
    JIRA_TO_REFLECT = 'jira_to_reflect'
    BIDIRECTIONAL = 'bidirectional'


class ConflictResolution(str, Enum):
    REFLECT_WINS = 'reflect_wins'
    JIRA_WINS = 'jira_wins'
    MANUAL = 'manual'


class StatusMappingConfig(BaseModel):
    status_mapping: Dict[str, str] = Field(
        ..., description='Reflect column to JIRA status mapping'
    )
    sync_direction: SyncDirection = Field(
        default=SyncDirection.BIDIRECTIONAL, description='Sync direction'
    )
    auto_sync: bool = Field(
        default=True, description='Enable automatic synchronization'
    )
    conflict_resolution: ConflictResolution = Field(
        default=ConflictResolution.REFLECT_WINS,
        description='Conflict resolution strategy',
    )
    workflow_scheme_id: Optional[str] = Field(
        None, description='JIRA workflow scheme ID'
    )
    issue_type_id: Optional[str] = Field(None, description='JIRA issue type ID')

    @validator('status_mapping')
    def validate_status_mapping(cls, v):
        valid_columns = ['backlog', 'in_progress', 'review', 'done', 'archived']
        for column in v.keys():
            if column not in valid_columns:
                raise ValueError(
                    f'Invalid column: {column}. Must be one of {valid_columns}'
                )
        return v


class StatusMappingUpdate(BaseModel):
    status_mapping: Optional[Dict[str, str]] = None
    sync_direction: Optional[SyncDirection] = None
    auto_sync: Optional[bool] = None
    conflict_resolution: Optional[ConflictResolution] = None
    workflow_scheme_id: Optional[str] = None
    issue_type_id: Optional[str] = None


class JiraWorkflowStatus(BaseModel):
    id: str
    name: str
    description: Optional[str] = None
    category: Optional[str] = None
    status_category: Optional[Dict[str, Any]] = None
    transitions: List[Dict[str, Any]] = Field(default_factory=list)


class JiraWorkflowScheme(BaseModel):
    id: str
    name: str
    description: Optional[str] = None
    default_workflow: Optional[str] = None
    workflows: Dict[str, str] = Field(default_factory=dict)


class StatusSyncRequest(BaseModel):
    action_item_id: str
    new_status: str
    old_status: Optional[str] = None
    sync_direction: SyncDirection = SyncDirection.BIDIRECTIONAL
    force_sync: bool = False


class StatusSyncResponse(BaseModel):
    success: bool
    message: str
    sync_result: Optional[Dict[str, Any]] = None
    conflicts: List[Dict[str, Any]] = Field(default_factory=list)
    errors: List[str] = Field(default_factory=list)


class ConflictInfo(BaseModel):
    action_item_id: str
    reflect_status: str
    jira_status: str
    conflict_type: str
    resolution: Optional[str] = None
    timestamp: str


class UpdateField(BaseModel):
    field_name: str
    old_value: Optional[Any] = None
    new_value: Any
    field_type: str = 'string'


class ActionItemUpdate(BaseModel):
    action_item_id: str
    fields: List[UpdateField]
    update_timestamp: str
    user_id: Optional[str] = None


class UpdateRequest(BaseModel):
    action_item_id: str
    updates: Dict[str, Any]
    force_update: bool = False
    validate_only: bool = False


class UpdateResponse(BaseModel):
    success: bool
    message: str
    updated_fields: List[str] = Field(default_factory=list)
    errors: List[str] = Field(default_factory=list)
    jira_issue_key: Optional[str] = None
    update_timestamp: str


class UpdateHistory(BaseModel):
    id: str
    action_item_id: str
    field_name: str
    old_value: Optional[Any] = None
    new_value: Any
    update_timestamp: str
    success: bool
    error_message: Optional[str] = None
    retry_count: int = 0
