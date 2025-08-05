from typing import Any, Dict, Optional
from uuid import UUID
from pydantic import BaseModel, ConfigDict, EmailStr


class UserInfo(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: UUID
    name: str
    email: str


class UserResponse(BaseModel):
    id: str
    email: Optional[str] = None
    phone: Optional[str] = None
    user_metadata: Dict[str, Any] = {}
    app_metadata: Dict[str, Any] = {}


class UserProfileUpdate(BaseModel):
    display_name: Optional[str] = None
    avatar_url: Optional[str] = None
    phone: Optional[str] = None


class AdminUserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    role: Optional[str] = None
    banned: Optional[bool] = None


class UserMetadata(BaseModel):
    id: str
    email: Optional[str] = None
    name: Optional[str] = None
    role: Optional[str] = None
    organization_id: Optional[str] = None
