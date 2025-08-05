import logging
from datetime import datetime
from typing import List, Optional
from uuid import UUID
import httpx
from sqlalchemy import select, update, func, and_
from sqlalchemy.orm import Session
from ..core.config import get_settings
from ..core.exceptions import NotFoundError
from ..models.models import (
    Notification,
    NotificationDevice,
    NotificationPreferences,
)
from ..models.schemas.notification_schemas import (
    CreateNotificationRequest,
    NotificationListResponse,
    NotificationResponse,
)

logger = logging.getLogger(__name__)
settings = get_settings()


class NotificationService:
    def __init__(self, db: Session):
        self.db = db

    def register_device(
        self, user_id: UUID, onesignal_player_id: str, device_type: str
    ) -> NotificationDevice:
        # Check if device already exists
        stmt = select(NotificationDevice).where(
            NotificationDevice.onesignal_player_id == onesignal_player_id
        )
        existing = self.db.execute(stmt)
        device = existing.scalar_one_or_none()

        if device:
            # Update existing device @keshav, Ik you will comment to remove this, I am not removing, hehehehehe, coz it helps me understand everything in one glance
            device.user_id = user_id
            device.device_type = device_type
            device.is_active = True
            device.updated_at = datetime.utcnow()
        else:
            # Create new device
            device = NotificationDevice(
                user_id=user_id,
                onesignal_player_id=onesignal_player_id,
                device_type=device_type,
            )
            self.db.add(device)

        self.db.commit()
        self.db.refresh(device)
        return device

    def unregister_device(self, user_id: UUID, device_id: UUID) -> None:
        stmt = select(NotificationDevice).where(
            and_(
                NotificationDevice.id == device_id,
                NotificationDevice.user_id == user_id,
            )
        )
        result = self.db.execute(stmt)
        device = result.scalar_one_or_none()

        if not device:
            raise NotFoundError('Device not found')

        device.is_active = False
        device.updated_at = datetime.utcnow()
        self.db.commit()

    def get_user_devices(self, user_id: UUID) -> List[NotificationDevice]:
        stmt = select(NotificationDevice).where(
            and_(
                NotificationDevice.user_id == user_id,
                NotificationDevice.is_active,
            )
        )
        result = self.db.execute(stmt)
        return result.scalars().all()

    def send_notification(
        self, user_id: UUID, title: str, message: str, data: Optional[dict] = None
    ) -> bool:
        devices = self.get_user_devices(user_id)
        if not devices:
            logger.info(f'No devices found for user {user_id}')
            return False

        player_ids = [device.onesignal_player_id for device in devices]

        payload = {
            'app_id': settings.ONESIGNAL_APP_ID,
            'include_player_ids': player_ids,
            'headings': {'en': title},
            'contents': {'en': message},
        }

        if data:
            payload['data'] = data

        headers = {
            'Authorization': f'Basic {settings.ONESIGNAL_REST_API_KEY}',
            'Content-Type': 'application/json',
        }

        try:
            with httpx.Client() as client:
                response = client.post(
                    'https://onesignal.com/api/v1/notifications',
                    json=payload,
                    headers=headers,
                )
                response.raise_for_status()
                return True
        except Exception as e:
            logger.error(f'Failed to send notification: {e}')
            return False

    def create_notification(
        self, notification_data: CreateNotificationRequest
    ) -> Notification:
        notification = Notification(
            user_id=notification_data.user_id,
            type=notification_data.type,
            title=notification_data.title,
            message=notification_data.message,
            data=notification_data.data,
        )
        self.db.add(notification)
        self.db.commit()
        self.db.refresh(notification)
        return notification

    def send_and_save_notification(
        self,
        user_id: UUID,
        type: str,
        title: str,
        message: str,
        data: Optional[dict] = None,
    ) -> Notification:
        notification_data = CreateNotificationRequest(
            user_id=user_id, type=type, title=title, message=message, data=data
        )
        notification = self.create_notification(notification_data)

        self.send_notification(user_id, title, message, data)

        return notification

    def get_user_notifications(
        self,
        user_id: UUID,
        page: int = 1,
        page_size: int = 20,
        type_filter: Optional[str] = None,
        unread_only: bool = False,
    ) -> NotificationListResponse:
        query = select(Notification).where(Notification.user_id == user_id)

        if type_filter:
            query = query.where(Notification.type == type_filter)

        if unread_only:
            query = query.where(Notification.is_read == False)

        count_query = select(func.count()).select_from(query.subquery())
        total_result = self.db.execute(count_query)
        total = total_result.scalar()

        # Apply pagination
        offset = (page - 1) * page_size
        query = (
            query.order_by(Notification.created_at.desc())
            .limit(page_size)
            .offset(offset)
        )

        result = self.db.execute(query)
        notifications = result.scalars().all()

        return NotificationListResponse(
            notifications=[
                NotificationResponse.model_validate(n) for n in notifications
            ],
            total=total,
            page=page,
            page_size=page_size,
            total_pages=(total + page_size - 1) // page_size,
        )

    def mark_as_read(
        self, user_id: UUID, notification_id: UUID
    ) -> NotificationResponse:
        stmt = select(Notification).where(
            and_(Notification.id == notification_id, Notification.user_id == user_id)
        )
        result = self.db.execute(stmt)
        notification = result.scalar_one_or_none()

        if not notification:
            raise NotFoundError('Notification not found')

        notification.is_read = True
        notification.read_at = datetime.utcnow()
        notification.updated_at = datetime.utcnow()

        self.db.commit()
        self.db.refresh(notification)

        return NotificationResponse.model_validate(notification)

    def mark_all_as_read(self, user_id: UUID) -> int:
        stmt = (
            update(Notification)
            .where(and_(Notification.user_id == user_id, Notification.is_read == False))
            .values(
                is_read=True, read_at=datetime.utcnow(), updated_at=datetime.utcnow()
            )
        )
        result = self.db.execute(stmt)
        self.db.commit()
        return result.rowcount

    def get_unread_count(self, user_id: UUID) -> int:
        stmt = select(func.count()).where(
            and_(Notification.user_id == user_id, Notification.is_read == False)
        )
        result = self.db.execute(stmt)
        return result.scalar() or 0

    def get_preferences(self, user_id: UUID) -> NotificationPreferences:
        stmt = select(NotificationPreferences).where(
            NotificationPreferences.user_id == user_id
        )
        result = self.db.execute(stmt)
        preferences = result.scalar_one_or_none()

        if not preferences:
            # Create default preferences
            preferences = NotificationPreferences(user_id=user_id)
            self.db.add(preferences)
            self.db.commit()
            self.db.refresh(preferences)

        return preferences

    def update_preferences(self, user_id: UUID, **kwargs) -> NotificationPreferences:
        preferences = self.get_preferences(user_id)

        for key, value in kwargs.items():
            if value is not None and hasattr(preferences, key):
                setattr(preferences, key, value)

        preferences.updated_at = datetime.utcnow()
        self.db.commit()
        self.db.refresh(preferences)

        return preferences
