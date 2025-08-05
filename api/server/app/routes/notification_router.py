from typing import Optional
from uuid import UUID

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from ..core.auth import get_current_user_id
from ..db import get_db
from ..models.schemas.notification_schemas import (
    DeviceRegisterRequest,
    DeviceResponse,
    NotificationPreferencesRequest,
    NotificationPreferencesResponse,
    NotificationListResponse,
    NotificationResponse,
    UnreadCountResponse,
)
from ..services.notification_service import NotificationService

router = APIRouter(prefix='/notifications', tags=['notifications'])


@router.post('/register-device', response_model=DeviceResponse)
def register_device(
    request: DeviceRegisterRequest,
    current_user_id: UUID = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    service = NotificationService(db)
    device = service.register_device(
        user_id=current_user_id,
        onesignal_player_id=request.onesignal_player_id,
        device_type=request.device_type,
    )
    return device


@router.delete('/unregister-device/{device_id}')
def unregister_device(
    device_id: UUID,
    current_user_id: UUID = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    service = NotificationService(db)
    service.unregister_device(current_user_id, device_id)
    return {'message': 'Device unregistered successfully'}


@router.get('', response_model=NotificationListResponse)
def get_notifications(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    type: Optional[str] = None,
    unread_only: bool = False,
    current_user_id: UUID = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    service = NotificationService(db)
    return service.get_user_notifications(
        user_id=current_user_id,
        page=page,
        page_size=page_size,
        type_filter=type,
        unread_only=unread_only,
    )


@router.get('/unread-count', response_model=UnreadCountResponse)
def get_unread_count(
    current_user_id: UUID = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    service = NotificationService(db)
    count = service.get_unread_count(current_user_id)
    return UnreadCountResponse(unread_count=count)


@router.put('/{notification_id}/read', response_model=NotificationResponse)
def mark_notification_as_read(
    notification_id: UUID,
    current_user_id: UUID = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    service = NotificationService(db)
    return service.mark_as_read(current_user_id, notification_id)


@router.put('/mark-all-read')
def mark_all_as_read(
    current_user_id: UUID = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    service = NotificationService(db)
    count = service.mark_all_as_read(current_user_id)
    return {'message': f'Marked {count} notifications as read'}


@router.get('/preferences', response_model=NotificationPreferencesResponse)
def get_preferences(
    current_user_id: UUID = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    service = NotificationService(db)
    preferences = service.get_preferences(current_user_id)
    return preferences


@router.put('/preferences', response_model=NotificationPreferencesResponse)
def update_preferences(
    request: NotificationPreferencesRequest,
    current_user_id: UUID = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    service = NotificationService(db)
    preferences = service.update_preferences(
        user_id=current_user_id,
        feedback_reminders=request.feedback_reminders,
        group_updates=request.group_updates,
        action_items=request.action_items,
    )
    return preferences
