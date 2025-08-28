from typing import Dict, Any, Optional, List
from pydantic import BaseModel, Field, validator
from enum import Enum


class JiraAuthType(str, Enum):
    OAUTH2 = 'oauth2'
    API_TOKEN = 'api_token'
    BASIC_AUTH = 'basic_auth'


class JiraConnectionTestRequest(BaseModel):
    jira_url: str = Field(..., description='JIRA instance URL')
    auth_type: JiraAuthType = Field(..., description='Authentication type')
    username: Optional[str] = Field(
        None, description='Username for API token or basic auth'
    )
    api_token: Optional[str] = Field(None, description='API token for authentication')
    password: Optional[str] = Field(None, description='Password for basic auth')
    client_id: Optional[str] = Field(None, description='OAuth2 client ID')
    client_secret: Optional[str] = Field(None, description='OAuth2 client secret')
    authorization_code: Optional[str] = Field(
        None, description='OAuth2 authorization code'
    )
    redirect_uri: Optional[str] = Field(None, description='OAuth2 redirect URI')


class JiraConnectionTestResponse(BaseModel):
    success: bool
    message: str
    connection_status: str
    user_info: Optional[Dict[str, Any]] = None
    jira_version: Optional[str] = None
    permissions: Optional[Dict[str, Any]] = None
    details: Optional[Dict[str, Any]] = None


class JiraProjectInfo(BaseModel):
    key: str
    name: str
    project_type: str
    lead: Optional[Dict[str, Any]] = None
    avatar_urls: Optional[Dict[str, Any]] = None
    issue_types: Optional[List[Dict[str, Any]]] = None
    components: Optional[List[Dict[str, Any]]] = None
    workflow_statuses: Optional[List[Dict[str, Any]]] = None


class JiraProjectsResponse(BaseModel):
    success: bool
    message: str
    projects: List[JiraProjectInfo]
    total_count: int
    cached: bool = False


class JiraConfig(BaseModel):
    jira_url: str = Field(..., description='JIRA instance URL')
    auth_type: JiraAuthType = Field(..., description='Authentication type')
    project_key: str = Field(..., description='Default JIRA project key')
    default_issue_type: str = Field(default='Task', description='Default issue type')
    default_priority: str = Field(default='Medium', description='Default priority')
    status_mapping: Dict[str, str] = Field(
        default_factory=dict, description='Column to status mapping'
    )
    auto_create_issues: bool = Field(
        default=True, description='Auto-create JIRA issues'
    )
    include_metadata: bool = Field(default=True, description='Include Reflect metadata')
    default_assignee: Optional[str] = Field(
        None, description='Default assignee username'
    )
    default_reporter: Optional[str] = Field(
        None, description='Default reporter username'
    )
    components: List[str] = Field(
        default_factory=list, description='Default components'
    )
    labels: List[str] = Field(default_factory=list, description='Default labels')

    @validator('jira_url')
    def validate_jira_url(cls, v):
        from app.core.validation import validate_jira_url as validate_url

        return validate_url(v)

    @validator('project_key')
    def validate_project_key(cls, v):
        from app.core.validation import validate_project_key as validate_key

        return validate_key(v)

    @validator('default_issue_type')
    def validate_issue_type(cls, v):
        from app.core.validation import validate_issue_type as validate_type

        return validate_type(v)

    @validator('default_priority')
    def validate_priority(cls, v):
        from app.core.validation import validate_priority as validate_pri

        return validate_pri(v)

    @validator('default_assignee')
    def validate_assignee(cls, v):
        if v is not None:
            from app.core.validation import validate_username

            return validate_username(v)
        return v

    @validator('default_reporter')
    def validate_reporter(cls, v):
        if v is not None:
            from app.core.validation import validate_username

            return validate_username(v)
        return v

    @validator('status_mapping')
    def validate_status_mapping(cls, v):
        valid_columns = ['backlog', 'in_progress', 'done', 'archived']
        for column in v.keys():
            if column not in valid_columns:
                raise ValueError(
                    f'Invalid column: {column}. Must be one of {valid_columns}'
                )
        return v


class JiraConfigUpdate(BaseModel):
    project_key: Optional[str] = None
    default_issue_type: Optional[str] = None
    default_priority: Optional[str] = None
    status_mapping: Optional[Dict[str, str]] = None
    auto_create_issues: Optional[bool] = None
    include_metadata: Optional[bool] = None
    default_assignee: Optional[str] = None
    default_reporter: Optional[str] = None
    components: Optional[List[str]] = None
    labels: Optional[List[str]] = None


class JiraIssueTypeInfo(BaseModel):
    id: str
    name: str
    description: Optional[str] = None
    icon_url: Optional[str] = None
    subtask: bool = False


class JiraIssueTypesResponse(BaseModel):
    success: bool
    message: str
    issue_types: List[JiraIssueTypeInfo]


class JiraPriorityInfo(BaseModel):
    id: str
    name: str
    description: Optional[str] = None
    icon_url: Optional[str] = None


class JiraPrioritiesResponse(BaseModel):
    success: bool
    message: str
    priorities: List[JiraPriorityInfo]


class JiraStatusInfo(BaseModel):
    id: str
    name: str
    description: Optional[str] = None
    category: Optional[str] = None


class JiraStatusesResponse(BaseModel):
    success: bool
    message: str
    statuses: List[JiraStatusInfo]


class JiraComponentInfo(BaseModel):
    id: str
    name: str
    description: Optional[str] = None
    lead: Optional[Dict[str, Any]] = None


class JiraComponentsResponse(BaseModel):
    success: bool
    message: str
    components: List[JiraComponentInfo]
