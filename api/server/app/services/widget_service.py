from typing import List, cast
from uuid import UUID
from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.subscription_plans import PLAN_LIMITS
from app.models.widget_model import Widget, WidgetStatus
from app.repositories.widget_repository import widget_repository, WidgetRepository
from app.schemas.widget_schema import WidgetCreate, WidgetUpdate
from app.services.project_service import project_service, ProjectService
from app.services.cdn_deployment_service import cdn_deployment_service
from app.core.settings import get_settings
from app.core.logging import get_logger
from app.core.exceptions import SubscriptionLimitExceededError
from app.services.usage_tracking_service import usage_tracking_service

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

    def _generate_embed_code(self, public_key: str, position: str = None) -> str:
        widget_cdn_url = self._get_cdn_url(public_key)

        # Convert position from enum format to frontend format
        position_map = {
            'BOTTOM_RIGHT': 'bottom_right',
            'BOTTOM_LEFT': 'bottom_left',
            'MID_RIGHT': 'mid_right',
            'MID_LEFT': 'mid_left',
            'WidgetPosition.MID_RIGHT': 'mid_right',
            'WidgetPosition.MID_LEFT': 'mid_left',
            'WidgetPosition.BOTTOM_RIGHT': 'bottom_right',
            'WidgetPosition.BOTTOM_LEFT': 'bottom_left',
        }
        position_str = position_map.get(position, 'bottom_right')

        embed_code = (
            f'<script>\n'
            f'  window.reflectConfig = {{ key: "{public_key}", position: "{position_str}" }};\n'
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

        await self.project_service.get_project_and_check_access(
            db, user_id, widget.project_id
        )
        return widget

    async def list_widgets_by_project(
        self, db: AsyncSession, user_id: UUID, project_id: UUID
    ) -> List[Widget]:
        await self.project_service.get_project_and_check_access(db, user_id, project_id)
        return await self.repository.get_by_project(db, project_id=project_id)

    async def create_widget(
        self, db: AsyncSession, user_id: UUID, widget_in: WidgetCreate
    ) -> Widget:
        project = await self.project_service.get_project_and_check_access(
            db, user_id, widget_in.project_id
        )

        organization = await usage_tracking_service.get_organization_subscription(
            db, project.organization_id
        )
        if not organization:
            limits = PLAN_LIMITS['free']
        else:
            plan = organization.subscription_plan or 'free'
            limits = PLAN_LIMITS.get(plan, PLAN_LIMITS['free'])

        limit = limits.get('widgets', 0)
        can_create = (
            limit >= 999
            or await usage_tracking_service.get_current_usage(
                db, project.organization_id, 'widgets'
            )
            < limit
        )

        if not can_create:
            current_usage = await usage_tracking_service.get_current_usage(
                db, project.organization_id, 'widgets'
            )
            raise SubscriptionLimitExceededError(
                resource_type='widgets',
                current_usage=current_usage,
                limit=limits.get('widgets', 0),
                message='Upgrade to Pro plan for unlimited widgets',
            )

        widget_data = widget_in.model_dump()

        temp_widget = Widget(**widget_data)
        public_key = temp_widget.public_key

        widget_data['public_key'] = public_key
        widget_data['embed_code'] = self._generate_embed_code(
            public_key, widget_data.get('position')
        )
        widget_data['status'] = WidgetStatus.ACTIVE
        widget_data['cdn_url'] = self._get_cdn_url(public_key)

        widget = await self.repository.create(db, **widget_data)

        await usage_tracking_service.increment_usage(
            db, project.organization_id, 'widgets'
        )
        await self._deploy_to_cdn(widget)

        return widget

    async def update_widget(
        self, db: AsyncSession, user_id: UUID, widget_id: UUID, widget_in: WidgetUpdate
    ) -> Widget:
        await self.get_widget_and_check_access(db, user_id, widget_id)
        update_data = widget_in.model_dump(exclude_unset=True)

        configuration_changed = any(
            key in update_data
            for key in [
                'configuration',
                'theme_configuration',
                'widget_type',
                'position',
            ]
        )

        updated_widget = await self.repository.update(db, id=widget_id, **update_data)

        if configuration_changed:
            # Regenerate embed code with updated position
            updated_widget.embed_code = self._generate_embed_code(
                updated_widget.public_key, str(updated_widget.position)
            )
            await self.repository.update(
                db, id=widget_id, embed_code=updated_widget.embed_code
            )

            await self._deploy_to_cdn(updated_widget)
            logger.info(
                f'Widget {updated_widget.public_key} updated and redeployed to R2 + CDN'
            )

        return updated_widget

    async def delete_widget(
        self, db: AsyncSession, user_id: UUID, widget_id: UUID
    ) -> Widget:
        widget = await self.get_widget_and_check_access(db, user_id, widget_id)

        # Delete widget files from CDN before soft deleting from database
        try:
            success = await cdn_deployment_service.delete_widget(widget.public_key)
            if success:
                logger.info(f'Widget {widget.public_key} deleted from CDN successfully')
            else:
                logger.error(f'Failed to delete widget {widget.public_key} from CDN')
        except Exception as e:
            logger.error(
                f'Failed to delete widget {widget.public_key} from CDN: {str(e)}'
            )
            # Continue with database deletion even if CDN cleanup fails

        # Soft delete the widget (usage tracking handled by database trigger)
        deleted_widget = await self.repository.soft_delete(db, id=widget_id)
        return deleted_widget

    async def get_public_widget_by_key(
        self, db: AsyncSession, public_key: str
    ) -> Widget:
        widget = await self.repository.get_by_public_key(db, public_key=public_key)

        if not widget:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail='Active widget not found for this key.',
            )

        if cast(WidgetStatus, widget.status) != WidgetStatus.ACTIVE:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail='Active widget not found for this key.',
            )
        return widget

    async def get_public_widget_config(self, db: AsyncSession, public_key: str):
        from app.schemas.widget_schema import WidgetReadPublic

        widget = await self.get_public_widget_by_key(db, public_key)
        return WidgetReadPublic.from_widget(widget)

    def _get_cdn_url(self, public_key: str) -> str:
        return f'{settings.CDN_BASE_URL}/widgets/{public_key}/widget.js'

    async def _deploy_to_cdn(self, widget) -> bool:
        try:
            success = await cdn_deployment_service.deploy_widget(widget)
            if success:
                logger.info(f'Widget {widget.public_key} deployed successfully')
            else:
                logger.error(f'Failed to deploy widget {widget.public_key}')
            return success
        except Exception as e:
            logger.error(f'CDN deployment error for {widget.public_key}: {str(e)}')
            return False


widget_service = WidgetService()
