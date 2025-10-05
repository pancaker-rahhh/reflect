from uuid import UUID
from pydantic import BaseModel, Field, validator
from typing import Optional, List
from datetime import datetime
import re


class RoadmapTagBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=50, description='Tag name')
    color: str = Field(
        '#6B7280', pattern=r'^#[0-9a-fA-F]{6}$', description='Tag color in hex format'
    )

    @validator('name')
    def validate_name(cls, v):
        if not v.strip():
            raise ValueError('Tag name cannot be empty or whitespace only')
        return v.strip()

    @validator('color')
    def validate_color(cls, v):
        if not re.match(r'^#[0-9a-fA-F]{6}$', v):
            raise ValueError('Color must be a valid hex color code (e.g., #FF0000)')
        return v


class RoadmapTagCreate(RoadmapTagBase):
    roadmap_id: UUID = Field(..., description='ID of the roadmap this tag belongs to')


class RoadmapTagUpdate(BaseModel):
    name: Optional[str] = Field(
        None, min_length=1, max_length=50, description='Tag name'
    )
    color: Optional[str] = Field(
        None, pattern=r'^#[0-9a-fA-F]{6}$', description='Tag color in hex format'
    )

    @validator('name')
    def validate_name(cls, v):
        if v is not None and not v.strip():
            raise ValueError('Tag name cannot be empty or whitespace only')
        return v.strip() if v else v

    @validator('color')
    def validate_color(cls, v):
        if v is not None and not re.match(r'^#[0-9a-fA-F]{6}$', v):
            raise ValueError('Color must be a valid hex color code (e.g., #FF0000)')
        return v


class RoadmapTagRead(RoadmapTagBase):
    id: UUID = Field(..., description='Unique identifier for the tag')
    roadmap_id: UUID = Field(..., description='ID of the roadmap this tag belongs to')
    created_at: datetime = Field(..., description='Timestamp when the tag was created')
    updated_at: datetime = Field(
        ..., description='Timestamp when the tag was last updated'
    )

    class Config:
        from_attributes = True
        json_encoders = {datetime: lambda v: v.isoformat()}


class RoadmapActionItemBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=255, description='Feature title')
    description: Optional[str] = Field(
        None, max_length=2000, description='Feature description'
    )
    priority: Optional[str] = Field(None, description='Feature priority level')
    feedback_id: Optional[UUID] = Field(None, description='Associated feedback ID')
    submitter_name: Optional[str] = Field(
        None, max_length=255, description='Name of the person who submitted the feature'
    )
    submitter_email: Optional[str] = Field(
        None,
        max_length=255,
        description='Email of the person who submitted the feature',
    )

    @validator('title')
    def validate_title(cls, v):
        if not v.strip():
            raise ValueError('Feature title cannot be empty or whitespace only')
        return v.strip()

    @validator('description')
    def validate_description(cls, v):
        if v is not None and v.strip() == '' and v != '':
            raise ValueError('Feature description cannot be whitespace only')
        return v.strip() if v and v.strip() else v

    @validator('priority')
    def validate_priority(cls, v):
        if v is not None and v not in ['low', 'medium', 'high', 'critical']:
            raise ValueError('Priority must be one of: low, medium, high, critical')
        return v

    @validator('submitter_email')
    def validate_email(cls, v):
        if v is not None:
            email_pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
            if not re.match(email_pattern, v):
                raise ValueError('Invalid email format')
        return v


class RoadmapActionItemCreate(RoadmapActionItemBase):
    column_id: UUID = Field(
        ..., description='ID of the column where the feature will be placed'
    )
    tag_ids: Optional[List[UUID]] = Field(
        default_factory=list,
        description='List of tag IDs to associate with the feature',
    )

    @validator('tag_ids')
    def validate_tag_ids(cls, v):
        if v is not None and len(v) > 10:
            raise ValueError('A feature cannot have more than 10 tags')
        return v or []


class RoadmapActionItemUpdate(BaseModel):
    title: Optional[str] = Field(
        None, min_length=1, max_length=255, description='Feature title'
    )
    description: Optional[str] = Field(
        None, max_length=2000, description='Feature description'
    )
    priority: Optional[str] = Field(None, description='Feature priority level')
    column_id: Optional[UUID] = Field(
        None, description='ID of the column where the feature should be moved'
    )
    order: Optional[int] = Field(
        None, ge=0, description='Feature order within the column'
    )
    tag_ids: Optional[List[UUID]] = Field(
        None, description='List of tag IDs to associate with the feature'
    )
    submitter_name: Optional[str] = Field(
        None, max_length=255, description='Name of the person who submitted the feature'
    )
    submitter_email: Optional[str] = Field(
        None,
        max_length=255,
        description='Email of the person who submitted the feature',
    )

    @validator('title')
    def validate_title(cls, v):
        if v is not None and not v.strip():
            raise ValueError('Feature title cannot be empty or whitespace only')
        return v.strip() if v else v

    @validator('description')
    def validate_description(cls, v):
        if v is not None and v.strip() == '' and v != '':
            raise ValueError('Feature description cannot be whitespace only')
        return v.strip() if v and v.strip() else v

    @validator('priority')
    def validate_priority(cls, v):
        if v is not None and v not in ['low', 'medium', 'high', 'critical']:
            raise ValueError('Priority must be one of: low, medium, high, critical')
        return v

    @validator('order')
    def validate_order(cls, v):
        if v is not None and v < 0:
            raise ValueError('Order must be a non-negative integer')
        return v

    @validator('tag_ids')
    def validate_tag_ids(cls, v):
        if v is not None and len(v) > 10:
            raise ValueError('A feature cannot have more than 10 tags')
        return v

    @validator('submitter_email')
    def validate_email(cls, v):
        if v is not None:
            email_pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
            if not re.match(email_pattern, v):
                raise ValueError('Invalid email format')
        return v


class RoadmapActionItemRead(RoadmapActionItemBase):
    id: UUID = Field(..., description='Unique identifier for the feature')
    column_id: UUID = Field(
        ..., description='ID of the column where the feature is located'
    )
    order: int = Field(..., ge=0, description='Feature order within the column')
    vote_count: int = Field(..., ge=0, description='Number of votes for this feature')
    tags: List[RoadmapTagRead] = Field(
        default_factory=list, description='List of tags associated with the feature'
    )
    created_at: datetime = Field(
        ..., description='Timestamp when the feature was created'
    )
    updated_at: datetime = Field(
        ..., description='Timestamp when the feature was last updated'
    )

    class Config:
        from_attributes = True
        json_encoders = {datetime: lambda v: v.isoformat()}


class RoadmapColumnBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=100, description='Column name')
    color: str = Field(
        '#FFFFFF',
        pattern=r'^#[0-9a-fA-F]{6}$',
        description='Column color in hex format',
    )

    @validator('name')
    def validate_name(cls, v):
        if not v.strip():
            raise ValueError('Column name cannot be empty or whitespace only')
        return v.strip()

    @validator('color')
    def validate_color(cls, v):
        if not re.match(r'^#[0-9a-fA-F]{6}$', v):
            raise ValueError('Color must be a valid hex color code (e.g., #FF0000)')
        return v


class RoadmapColumnCreate(RoadmapColumnBase):
    roadmap_id: UUID = Field(
        ..., description='ID of the roadmap this column belongs to'
    )
    order: int = Field(..., ge=0, description='Column order within the roadmap')

    @validator('order')
    def validate_order(cls, v):
        if v < 0:
            raise ValueError('Order must be a non-negative integer')
        return v


class RoadmapColumnUpdate(BaseModel):
    name: Optional[str] = Field(
        None, min_length=1, max_length=100, description='Column name'
    )
    color: Optional[str] = Field(
        None, pattern=r'^#[0-9a-fA-F]{6}$', description='Column color in hex format'
    )
    order: Optional[int] = Field(
        None, ge=0, description='Column order within the roadmap'
    )

    @validator('name')
    def validate_name(cls, v):
        if v is not None and not v.strip():
            raise ValueError('Column name cannot be empty or whitespace only')
        return v.strip() if v else v

    @validator('color')
    def validate_color(cls, v):
        if v is not None and not re.match(r'^#[0-9a-fA-F]{6}$', v):
            raise ValueError('Color must be a valid hex color code (e.g., #FF0000)')
        return v

    @validator('order')
    def validate_order(cls, v):
        if v is not None and v < 0:
            raise ValueError('Order must be a non-negative integer')
        return v


class RoadmapColumnRead(RoadmapColumnBase):
    id: UUID = Field(..., description='Unique identifier for the column')
    roadmap_id: UUID = Field(
        ..., description='ID of the roadmap this column belongs to'
    )
    order: int = Field(..., ge=0, description='Column order within the roadmap')
    action_items: List[RoadmapActionItemRead] = Field(
        default_factory=list, description='List of action items in this column'
    )

    class Config:
        from_attributes = True
        json_encoders = {datetime: lambda v: v.isoformat()}


class RoadmapBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=255, description='Roadmap name')
    is_public: bool = Field(
        False, description='Whether the roadmap is publicly accessible'
    )
    subdomain: Optional[str] = Field(
        None,
        min_length=1,
        max_length=100,
        pattern=r'^[a-z0-9\-]+$',
        description='Custom subdomain for the roadmap (optional)',
    )
    logo_url: Optional[str] = Field(
        None, max_length=100000, description='URL to the roadmap logo'
    )

    @validator('name')
    def validate_name(cls, v):
        if not v.strip():
            raise ValueError('Roadmap name cannot be empty or whitespace only')
        return v.strip()

    @validator('subdomain')
    def validate_subdomain(cls, v):
        if v is not None:
            if not re.match(r'^[a-z0-9\-]+$', v):
                raise ValueError(
                    'Subdomain can only contain lowercase letters, numbers, and hyphens'
                )
            if v.startswith('-') or v.endswith('-'):
                raise ValueError('Subdomain cannot start or end with a hyphen')
            if '--' in v:
                raise ValueError('Subdomain cannot contain consecutive hyphens')
        return v

    @validator('logo_url')
    def validate_logo_url(cls, v):
        if v is not None:
            # Allow both HTTP/HTTPS URLs and data URLs for base64 images
            http_pattern = r'^https?://[^\s/$.?#].[^\s]*$'
            data_pattern = r'^data:image/[a-zA-Z]+;base64,[A-Za-z0-9+/=]+$'
            if not (re.match(http_pattern, v) or re.match(data_pattern, v)):
                raise ValueError(
                    'Logo URL must be a valid HTTP/HTTPS URL or base64 data URL'
                )
        return v


class RoadmapCreate(RoadmapBase):
    project_id: UUID = Field(
        ..., description='ID of the project this roadmap belongs to'
    )


class RoadmapUpdate(BaseModel):
    name: Optional[str] = Field(
        None, min_length=1, max_length=255, description='Roadmap name'
    )
    is_public: Optional[bool] = Field(
        None, description='Whether the roadmap is publicly accessible'
    )
    subdomain: Optional[str] = Field(
        None,
        min_length=1,
        max_length=100,
        pattern=r'^[a-z0-9\-]+$',
        description='Custom subdomain for the roadmap (optional)',
    )
    logo_url: Optional[str] = Field(
        None, max_length=100000, description='URL to the roadmap logo'
    )

    @validator('name')
    def validate_name(cls, v):
        if v is not None and not v.strip():
            raise ValueError('Roadmap name cannot be empty or whitespace only')
        return v.strip() if v else v

    @validator('subdomain')
    def validate_subdomain(cls, v):
        if v is not None:
            if not re.match(r'^[a-z0-9\-]+$', v):
                raise ValueError(
                    'Subdomain can only contain lowercase letters, numbers, and hyphens'
                )
            if v.startswith('-') or v.endswith('-'):
                raise ValueError('Subdomain cannot start or end with a hyphen')
            if '--' in v:
                raise ValueError('Subdomain cannot contain consecutive hyphens')
        return v

    @validator('logo_url')
    def validate_logo_url(cls, v):
        if v is not None:
            # Allow both HTTP/HTTPS URLs and data URLs for base64 images
            http_pattern = r'^https?://[^\s/$.?#].[^\s]*$'
            data_pattern = r'^data:image/[a-zA-Z]+;base64,[A-Za-z0-9+/=]+$'
            if not (re.match(http_pattern, v) or re.match(data_pattern, v)):
                raise ValueError(
                    'Logo URL must be a valid HTTP/HTTPS URL or base64 data URL'
                )
        return v


class RoadmapRead(RoadmapBase):
    id: UUID = Field(..., description='Unique identifier for the roadmap')
    project_id: UUID = Field(
        ..., description='ID of the project this roadmap belongs to'
    )
    public_slug: str = Field(..., description='Public slug for accessing the roadmap')
    columns: List[RoadmapColumnRead] = Field(
        default_factory=list, description='List of columns in the roadmap'
    )
    tags: List[RoadmapTagRead] = Field(
        default_factory=list, description='List of tags available in the roadmap'
    )
    created_at: datetime = Field(
        ..., description='Timestamp when the roadmap was created'
    )
    updated_at: datetime = Field(
        ..., description='Timestamp when the roadmap was last updated'
    )

    class Config:
        from_attributes = True
        json_encoders = {datetime: lambda v: v.isoformat()}


class RoadmapAssignmentCreate(BaseModel):
    roadmap_feature_id: UUID = Field(
        ..., description='ID of the roadmap feature to assign'
    )
    user_id: UUID = Field(..., description='ID of the user to assign to the feature')
    role: str = Field(
        default='contributor',
        max_length=50,
        description='Role of the assigned user (e.g., contributor, reviewer, owner)',
    )
    assigned_by: Optional[UUID] = Field(
        None, description='ID of the user who made the assignment'
    )

    @validator('role')
    def validate_role(cls, v):
        valid_roles = ['contributor', 'reviewer', 'owner', 'assignee']
        if v.lower() not in valid_roles:
            raise ValueError(f'Role must be one of: {", ".join(valid_roles)}')
        return v.lower()


class RoadmapAssignmentUpdate(BaseModel):
    role: Optional[str] = Field(
        None, max_length=50, description='Role of the assigned user'
    )

    @validator('role')
    def validate_role(cls, v):
        if v is not None:
            valid_roles = ['contributor', 'reviewer', 'owner', 'assignee']
            if v.lower() not in valid_roles:
                raise ValueError(f'Role must be one of: {", ".join(valid_roles)}')
            return v.lower()
        return v


class RoadmapAssignmentResponse(BaseModel):
    id: UUID = Field(..., description='Unique identifier for the assignment')
    roadmap_feature_id: UUID = Field(..., description='ID of the roadmap feature')
    user_id: UUID = Field(..., description='ID of the assigned user')
    role: str = Field(..., description='Role of the assigned user')
    assigned_by: Optional[UUID] = Field(
        None, description='ID of the user who made the assignment'
    )
    created_at: datetime = Field(
        ..., description='Timestamp when the assignment was created'
    )
    updated_at: datetime = Field(
        ..., description='Timestamp when the assignment was last updated'
    )

    class Config:
        from_attributes = True
        json_encoders = {datetime: lambda v: v.isoformat()}


class RoadmapActionItemTagCreate(BaseModel):
    action_item_id: UUID = Field(..., description='ID of the roadmap feature')
    tag_id: UUID = Field(..., description='ID of the tag to associate')


class RoadmapActionItemTagResponse(BaseModel):
    action_item_id: UUID = Field(..., description='ID of the roadmap feature')
    tag_id: UUID = Field(..., description='ID of the associated tag')
    created_at: datetime = Field(
        ..., description='Timestamp when the association was created'
    )

    class Config:
        from_attributes = True
        json_encoders = {datetime: lambda v: v.isoformat()}


class RoadmapVoteCreate(BaseModel):
    feature_id: UUID = Field(..., description='ID of the roadmap feature to vote for')


class RoadmapVoteResponse(BaseModel):
    id: UUID = Field(..., description='Unique identifier for the vote')
    feature_id: UUID = Field(..., description='ID of the voted feature')
    user_id: Optional[UUID] = Field(
        None, description='ID of the user who voted (if authenticated)'
    )
    created_at: datetime = Field(..., description='Timestamp when the vote was created')

    class Config:
        from_attributes = True
        json_encoders = {datetime: lambda v: v.isoformat()}


class RoadmapSummary(BaseModel):
    id: UUID = Field(..., description='Unique identifier for the roadmap')
    name: str = Field(..., description='Roadmap name')
    is_public: bool = Field(
        ..., description='Whether the roadmap is publicly accessible'
    )
    public_slug: str = Field(..., description='Public slug for accessing the roadmap')
    subdomain: Optional[str] = Field(
        None, description='Custom subdomain for the roadmap'
    )
    column_count: int = Field(..., description='Number of columns in the roadmap')
    feature_count: int = Field(
        ..., description='Total number of features in the roadmap'
    )
    created_at: datetime = Field(
        ..., description='Timestamp when the roadmap was created'
    )
    updated_at: datetime = Field(
        ..., description='Timestamp when the roadmap was last updated'
    )

    class Config:
        from_attributes = True
        json_encoders = {datetime: lambda v: v.isoformat()}


class RoadmapStats(BaseModel):
    """Roadmap statistics for analytics and reporting."""

    total_features: int = Field(..., description='Total number of features')
    completed_features: int = Field(..., description='Number of completed features')
    in_progress_features: int = Field(..., description='Number of features in progress')
    planned_features: int = Field(..., description='Number of planned features')
    total_votes: int = Field(
        ..., description='Total number of votes across all features'
    )
    average_votes_per_feature: float = Field(
        ..., description='Average votes per feature'
    )
    most_voted_feature: Optional[RoadmapActionItemRead] = Field(
        None, description='Feature with the most votes'
    )

    class Config:
        from_attributes = True
