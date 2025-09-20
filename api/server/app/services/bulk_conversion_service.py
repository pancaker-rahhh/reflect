from __future__ import annotations
from typing import List, Dict, Any, Tuple
from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession
from app.schemas.feedback_schema import BulkFeedbackConversionRequest
from app.services.action_item_service import ActionItemService
from app.core.exceptions import NotFoundError, ValidationError
from app.core.logging import get_logger
from app.core.settings import get_settings
from app.core.sanitization import InputSanitizer

logger = get_logger(__name__)


class BulkConversionService:
    def __init__(self, action_item_service: ActionItemService):
        self.action_item_service = action_item_service
        self.settings = get_settings()

    async def process_bulk_conversion(
        self,
        bulk_request: BulkFeedbackConversionRequest,
        user_id: str,
        db: AsyncSession,
    ) -> Dict[str, Any]:
        self._validate_bulk_request(bulk_request)

        sanitized_data = self._sanitize_conversion_data(bulk_request)

        converted_items, failed_items = await self._process_conversions(
            bulk_request.feedback_ids, sanitized_data, user_id, db
        )

        return self._build_response(
            converted_items, failed_items, len(bulk_request.feedback_ids)
        )

    def _validate_bulk_request(
        self, bulk_request: BulkFeedbackConversionRequest
    ) -> None:
        if len(bulk_request.feedback_ids) > self.settings.MAX_BULK_CONVERSION_ITEMS:
            raise ValidationError(
                f'Maximum {self.settings.MAX_BULK_CONVERSION_ITEMS} feedback items allowed per bulk operation'
            )

    def _sanitize_conversion_data(
        self, bulk_request: BulkFeedbackConversionRequest
    ) -> Dict[str, Any]:
        sanitized_priority = InputSanitizer.sanitize_priority(bulk_request.priority)
        sanitized_notes = InputSanitizer.sanitize_text(
            bulk_request.conversion_notes, InputSanitizer.MAX_LENGTHS['message']
        )
        sanitized_tags = []
        if bulk_request.custom_tags:
            for tag in bulk_request.custom_tags:
                sanitized_tag = InputSanitizer.sanitize_text(tag, 50)
                if sanitized_tag:
                    sanitized_tags.append(sanitized_tag)

        return {
            'priority': sanitized_priority,
            'notes': sanitized_notes,
            'tags': sanitized_tags,
            'column_id': bulk_request.column_id,
        }

    async def _process_conversions(
        self,
        feedback_ids: List[str],
        sanitized_data: Dict[str, Any],
        user_id: str,
        db: AsyncSession,
    ) -> Tuple[List[Dict[str, str]], List[Dict[str, str]]]:
        converted_items = []
        failed_items = []

        for feedback_id_str in feedback_ids:
            try:
                feedback_id = UUID(feedback_id_str)
                roadmap_item = (
                    await self.action_item_service.convert_feedback_to_roadmap_item(
                        db,
                        feedback_id,
                        UUID(user_id),
                        sanitized_data['priority'],
                        sanitized_data['notes'],
                        sanitized_data['tags'],
                        sanitized_data['column_id'],
                    )
                )
                converted_items.append(
                    {
                        'feedback_id': str(feedback_id),
                        'roadmap_item_id': str(roadmap_item.id),
                    }
                )
            except (NotFoundError, ValidationError) as e:
                failed_items.append(
                    {
                        'feedback_id': feedback_id_str,
                        'error': str(e),
                    }
                )

        return converted_items, failed_items

    def _build_response(
        self,
        converted_items: List[Dict[str, str]],
        failed_items: List[Dict[str, str]],
        total_processed: int,
    ) -> Dict[str, Any]:
        return {
            'message': f'Bulk conversion completed: {len(converted_items)} successful, {len(failed_items)} failed',
            'converted_items': converted_items,
            'failed_items': failed_items,
            'total_processed': total_processed,
        }
