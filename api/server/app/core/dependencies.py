from functools import lru_cache
from app.services.action_item_service import ActionItemService
from app.services.bulk_conversion_service import BulkConversionService


@lru_cache()
def get_action_item_service() -> ActionItemService:
    return ActionItemService()


@lru_cache()
def get_bulk_conversion_service() -> BulkConversionService:
    action_item_service = get_action_item_service()
    return BulkConversionService(action_item_service)
