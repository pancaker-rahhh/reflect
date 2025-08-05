from datetime import datetime
from typing import Optional, List
from uuid import UUID

from pydantic import BaseModel, Field


class DeviceRegisterRequest(BaseModel):
    onesignal_player_id: str
    device_type: str = Field(..., pattern='^(ios|android|web)$')


class DeviceResponse(BaseModel):
    id: UUID
    user_id: UUID
    onesignal_player_id: str
    device_type: str
    is_active: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class NotificationPreferencesRequest(BaseModel):
    feedback_reminders: Optional[bool] = None
    group_updates: Optional[bool] = None
    action_items: Optional[bool] = None


class NotificationPreferencesResponse(BaseModel):
    id: UUID
    user_id: UUID
    feedback_reminders: bool
    group_updates: bool
    action_items: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class NotificationResponse(BaseModel):
    id: UUID
    user_id: UUID
    type: str
    title: str
    message: str
    data: Optional[dict] = None
    is_read: bool
    read_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class NotificationListResponse(BaseModel):
    notifications: List[NotificationResponse]
    total: int
    page: int
    page_size: int
    total_pages: int


class MarkAsReadRequest(BaseModel):
    notification_ids: Optional[List[UUID]] = None  # If None, mark all as read


class UnreadCountResponse(BaseModel):
    unread_count: int


class CreateNotificationRequest(BaseModel):
    user_id: UUID
    type: str
    title: str
    message: str
    data: Optional[dict] = None
