from typing import List, cast
from uuid import UUID
from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

# The User model is no longer needed for type hints in method signatures
# from app.models.user_model import User
from app.models.widget_model import Widget, WidgetStatus
from app.repositories.widget_repository import widget_repository, WidgetRepository
from app.schemas.widget_schema import WidgetCreate, WidgetUpdate
from app.services.project_service import project_service, ProjectService

# Use environment-based URLs
import os
from app.services.cdn_deployment_service import cdn_deployment_service
from app.core.settings import get_settings
from app.core.logging import get_logger

logger = get_logger(__name__)
settings = get_settings()
ENVIRONMENT = settings.ENV


class WidgetService:
    def __init__(
        self,
        repository: WidgetRepository = widget_repository,
        project_service: ProjectService = project_service,
    ):
        self.repository = repository
        self.project_service = project_service

    def _generate_embed_code(self, public_key: str) -> str:
        # Use static CDN URL that never changes
        widget_cdn_url = self._get_cdn_url(public_key)
        
        embed_code = (
            f'<script>\n'
            f'  window.reflectConfig = {{ key: "{public_key}" }};\n'
            f'</script>\n'
            f'<script async src="{widget_cdn_url}"></script>'
        )
        return embed_code

    async def get_widget_and_check_access(
        self, db: AsyncSession, user_id: UUID, widget_id: UUID
    ) -> Widget:
        widget = await self.repository.get(db, id=widget_id)
        if not widget:
            raise HTTPException(status.HTTP_404_NOT_FOUND)

        await self.project_service.get_project_and_check_access(db, user_id, widget.project_id)
        return widget

    async def list_widgets_by_project(
        self, db: AsyncSession, user_id: UUID, project_id: UUID
    ) -> List[Widget]:
        await self.project_service.get_project_and_check_access(db, user_id, project_id)
        return await self.repository.get_by_project(db, project_id=project_id)

    async def create_widget(
        self, db: AsyncSession, user_id: UUID, widget_in: WidgetCreate
    ) -> Widget:
        await self.project_service.get_project_and_check_access(
            db, user_id, widget_in.project_id
        )

        widget_data = widget_in.model_dump()

        temp_widget = Widget(**widget_data)
        public_key = temp_widget.public_key
        
        widget_data['public_key'] = public_key
        widget_data['embed_code'] = self._generate_embed_code(public_key)
        widget_data['status'] = WidgetStatus.ACTIVE
        widget_data['is_active'] = True
        widget_data['cdn_url'] = self._get_cdn_url(public_key)

        widget = await self.repository.create(db, **widget_data)
        
        # Deploy widget to R2 + CDN after creation
        await self._deploy_to_cdn(widget)
        
        return widget

    async def update_widget(
        self, db: AsyncSession, user_id: UUID, widget_id: UUID, widget_in: WidgetUpdate
    ) -> Widget:
        widget = await self.get_widget_and_check_access(db, user_id, widget_id)
        update_data = widget_in.model_dump(exclude_unset=True)
        
        # Check if configuration changes require redeployment
        configuration_changed = any(key in update_data for key in ['configuration', 'theme_configuration', 'widget_type', 'position'])
        
        updated_widget = await self.repository.update(db, id=widget_id, **update_data)
        
        # Deploy to R2 + CDN if configuration changed (updates the same file)
        if configuration_changed:
            await self._deploy_to_cdn(updated_widget)
            logger.info(f"Widget {updated_widget.public_key} updated and redeployed to R2 + CDN")
        
        return updated_widget

    async def delete_widget(
        self, db: AsyncSession, user_id: UUID, widget_id: UUID
    ) -> Widget:
        widget = await self.get_widget_and_check_access(db, user_id, widget_id)

        # Prevent deletion of active widgets
        if bool(widget.is_active) and widget.status == WidgetStatus.ACTIVE:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail='Cannot delete an active widget. Please deactivate the widget first before deleting.',
            )

        # Use soft delete to preserve feedback data
        # TODO: Implement scheduled cleanup task to permanently delete old soft-deleted widgets
        # - Retention period: 30 days (configurable)
        # - Cleanup frequency: Weekly background task
        # - Should also delete associated feedback data when permanently removing widgets
        # - Consider using Celery or similar task queue for scheduled cleanup
        return await self.repository.soft_delete(db, id=widget_id)

    async def set_widget_activation(
        self, db: AsyncSession, user_id: UUID, widget_id: UUID, is_active: bool
    ) -> Widget:
        await self.get_widget_and_check_access(db, user_id, widget_id)
        if is_active:
            return await self.repository.update(
                db, id=widget_id, status=WidgetStatus.ACTIVE, is_active=True
            )
        else:
            return await self.repository.update(
                db, id=widget_id, status=WidgetStatus.INACTIVE, is_active=False
            )

    async def get_public_widget_by_key(
        self, db: AsyncSession, public_key: str
    ) -> Widget:
        widget = await self.repository.get_by_public_key(db, public_key=public_key)

        if not widget:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail='Active widget not found for this key.',
            )

        if not bool(widget.is_active) or cast(WidgetStatus, widget.status) != WidgetStatus.ACTIVE:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail='Active widget not found for this key.',
            )
        return widget
    
    async def get_public_widget_config(
        self, db: AsyncSession, public_key: str
    ):
        """Get widget configuration formatted for public client consumption"""
        from app.schemas.widget_schema import WidgetReadPublic
        
        widget = await self.get_public_widget_by_key(db, public_key)
        return WidgetReadPublic.from_widget(widget)


    def _get_cdn_url(self, public_key: str) -> str:
        """Generate CDN URL for widget"""
        return f'{settings.CDN_BASE_URL}/widgets/{public_key}/widget.js'
    
    async def _deploy_to_cdn(self, widget) -> bool:
        """Deploy widget to Cloudflare R2 + CDN"""
        try:
            success = await cdn_deployment_service.deploy_widget(widget)
            if success:
                logger.info(f"Widget {widget.public_key} v{widget.version} deployed successfully")
            else:
                logger.error(f"Failed to deploy widget {widget.public_key} v{widget.version}")
            return success
        except Exception as e:
            logger.error(f"CDN deployment error for {widget.public_key}: {str(e)}")
            return False


widget_service = WidgetService()
