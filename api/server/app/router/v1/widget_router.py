from typing import Any, List
from uuid import UUID
from fastapi import APIRouter, Depends, status, Response, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.db import get_db
from app.core.auth import get_current_user
from app.models.user_model import User
from app.schemas.widget_schema import WidgetCreate, WidgetUpdate, WidgetRead
from app.services.widget_service import widget_service, WidgetService

project_widgets_router = APIRouter()

widgets_router = APIRouter()


@project_widgets_router.post(
    '/', response_model=WidgetRead, status_code=status.HTTP_201_CREATED
)
async def create_widget(
    project_id: UUID,
    widget_in: WidgetCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
    service: WidgetService = Depends(lambda: widget_service),
) -> Any:
    if project_id != widget_in.project_id:
        raise HTTPException(status.HTTP_400_BAD_REQUEST)
    return await service.create_widget(db, user_id=current_user.id, widget_in=widget_in)


@project_widgets_router.get('/', response_model=List[WidgetRead])
async def list_widgets(
    project_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
    service: WidgetService = Depends(lambda: widget_service),
) -> Any:
    return await service.list_widgets_by_project(
        db, user_id=current_user.id, project_id=project_id
    )


@widgets_router.get('/{widget_id}', response_model=WidgetRead)
async def get_widget(
    widget_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
    service: WidgetService = Depends(lambda: widget_service),
) -> Any:
    return await service.get_widget_and_check_access(
        db, user_id=current_user.id, widget_id=widget_id
    )


@widgets_router.put('/{widget_id}', response_model=WidgetRead)
async def update_widget(
    widget_id: UUID,
    widget_in: WidgetUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
    service: WidgetService = Depends(lambda: widget_service),
) -> Any:
    return await service.update_widget(
        db, user_id=current_user.id, widget_id=widget_id, widget_in=widget_in
    )


@widgets_router.delete('/{widget_id}', status_code=status.HTTP_204_NO_CONTENT)
async def delete_widget(
    widget_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
    service: WidgetService = Depends(lambda: widget_service),
):
    await service.delete_widget(db, user_id=current_user.id, widget_id=widget_id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@widgets_router.post('/{widget_id}/activate', response_model=WidgetRead)
async def activate_widget(
    widget_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
    service: WidgetService = Depends(lambda: widget_service),
) -> Any:
    return await service.set_widget_activation(
        db, user_id=current_user.id, widget_id=widget_id, is_active=True
    )


@widgets_router.post('/{widget_id}/deactivate', response_model=WidgetRead)
async def deactivate_widget(
    widget_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
    service: WidgetService = Depends(lambda: widget_service),
) -> Any:
    # CORRECTED: Pass the user's ID
    return await service.set_widget_activation(
        db, user_id=current_user.id, widget_id=widget_id, is_active=False
    )
