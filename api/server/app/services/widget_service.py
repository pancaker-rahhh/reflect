from typing import List
from uuid import UUID, uuid4
from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.user import User
from app.models.widget import Widget, WidgetStatus
from app.repositories.widget import widget_repository, WidgetRepository
from app.schemas.widget import WidgetCreate, WidgetUpdate
from app.services.project_service import project_service, ProjectService


class WidgetService:
    def __init__(
        self,
        repository: WidgetRepository = widget_repository,
        project_service: ProjectService = project_service,
    ):
        self.repository = repository
        self.project_service = project_service

    def _generate_embed_code(self, public_key: str) -> str:
        script_url = 'https://your-app-cdn.com/widget-loader.js'
        return (
            f'<script src="{script_url}" '
            f'data-widget-key="{public_key}" async defer></script>'
        )

    async def get_widget_and_check_access(
        self, db: AsyncSession, user: User, widget_id: UUID
    ) -> Widget:
        widget = await self.repository.get(db, id=widget_id)
        if not widget:
            raise HTTPException(status.HTTP_404_NOT_FOUND)

        await self.project_service.get_project_and_check_access(
            db, user, widget.project_id
        )
        return widget

    async def list_widgets_by_project(
        self, db: AsyncSession, user: User, project_id: UUID
    ) -> List[Widget]:
        await self.project_service.get_project_and_check_access(db, user, project_id)
        return await self.repository.get_by_project(db, project_id=project_id)

    async def create_widget(
        self, db: AsyncSession, user: User, widget_in: WidgetCreate
    ) -> Widget:
        await self.project_service.get_project_and_check_access(
            db, user, widget_in.project_id
        )

        widget_data = widget_in.model_dump()

        public_key = f'widget_{str(uuid4()).replace("-", "")[:16]}'
        widget_data['public_key'] = public_key
        widget_data['embed_code'] = self._generate_embed_code(public_key)

        return await self.repository.create(db, **widget_data)

    async def update_widget(
        self, db: AsyncSession, user: User, widget_id: UUID, widget_in: WidgetUpdate
    ) -> Widget:
        await self.get_widget_and_check_access(db, user, widget_id)
        update_data = widget_in.model_dump(exclude_unset=True)
        return await self.repository.update(db, id=widget_id, **update_data)

    async def delete_widget(
        self, db: AsyncSession, user: User, widget_id: UUID
    ) -> Widget:
        await self.get_widget_and_check_access(db, user, widget_id)
        return await self.repository.update(
            db, id=widget_id, status=WidgetStatus.ARCHIVED
        )

    async def set_widget_activation(
        self, db: AsyncSession, user: User, widget_id: UUID, is_active: bool
    ) -> Widget:
        await self.get_widget_and_check_access(db, user, widget_id)
        if is_active:
            return await self.repository.update(
                db, id=widget_id, status=WidgetStatus.ACTIVE, is_active=True
            )
        else:
            return await self.repository.update(
                db, id=widget_id, status=WidgetStatus.INACTIVE, is_active=False
            )


widget_service = WidgetService()
