from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel, ConfigDict
from uuid import UUID


class GroupMetadata(BaseModel):
    name: str
    tag: Optional[str] = None
    description: Optional[str] = None
    icon_id: Optional[str] = None


class GroupCreateRequest(GroupMetadata):
    user_ids: Optional[List[str]] = []
    creator_joins: bool = True


class GroupUpdate(BaseModel):
    name: Optional[str] = None
    tag: Optional[str] = None
    description: Optional[str] = None
    icon_id: Optional[str] = None


class GroupAddUsers(BaseModel):
    user_ids: List[str]


class GroupRemoveUsers(BaseModel):
    user_ids: List[str]


class GroupMemberMetadata(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: UUID
    name: str
    email: str
    role: str


class GroupSummary(BaseModel):
    id: str
    name: str
    tag: Optional[str] = None
    description: Optional[str] = None
    user_count: int = 0


class GroupResponse(GroupMetadata):
    model_config = ConfigDict(from_attributes=True)
    id: UUID
    users: List[GroupMemberMetadata] = []
    user_count: int = 0
    is_owner: bool = False
    created_at: datetime
    updated_at: datetime


class GroupListResponse(BaseModel):
    groups: List[GroupResponse]
    total: int
