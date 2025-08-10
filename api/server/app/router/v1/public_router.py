import re
from typing import Any
from fastapi import APIRouter, Depends, HTTPException, Path, status
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
    widget_public_key: str = Path(
        min_length=1,
        max_length=255,
        regex="^[a-zA-Z0-9_-]+$"
    ),
    db: AsyncSession = Depends(get_db),
    service: WidgetService = Depends(lambda: widget_service),
) -> Any:
    # Additional validation: ensure public_key contains only safe characters
    if not re.match(r'^[a-zA-Z0-9_-]+$', widget_public_key):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid public key format"
        )

    widget = await service.get_public_widget_by_key(db, public_key=widget_public_key)
    return widget
