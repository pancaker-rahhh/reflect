from typing import Any
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.db import get_db
from app.schemas.widget_public_schema import WidgetPublicRead
from app.services.widget_service import widget_service, WidgetService

public_router = APIRouter()


@public_router.get(
    '/widgets/{public_key}',
    response_model=WidgetPublicRead,
)
async def get_public_widget_config(
    public_key: str,
    db: AsyncSession = Depends(get_db),
    service: WidgetService = Depends(lambda: widget_service),
) -> Any:
    widget = await service.get_public_widget_by_key(db, public_key=public_key)
    return widget
