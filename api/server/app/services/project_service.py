from typing import Tuple, List
from uuid import UUID
from datetime import datetime

from sqlalchemy.ext.asyncio import AsyncSession
from app.core.subscription_plans import PLAN_LIMITS
from app.models.project_model import Project
from app.models.organization_model import ProjectRole, OrganizationRole
from app.models.usage_tracking_model import ResourceType
from app.repositories.project_repository import (
    project_repository,
    project_member_repository,
    ProjectRepository,
)
from app.repositories.user_repository import user_repository
from app.services.organization_service import organization_service
from app.schemas.project_schema import (
    ProjectCreate,
    ProjectUpdate,
    ProjectSettings,
    ProjectSettingsUpdate,
    ProjectMemberResponse,
    ProjectMemberInviteRequest,
    ProjectMemberUpdate,
)
from app.core.exceptions import (
    NotFoundError,
    ForbiddenError,
    ConflictError,
    SubscriptionLimitExceededError,
)
from app.core.logging import get_logger
from app.services.usage_tracking_service import usage_tracking_service

logger = get_logger(__name__)


async def _check_organization_access(
    db: AsyncSession, user_id: UUID, organization_id: UUID
):
    try:
        member = await organization_service.get_user_membership(
            organization_id, user_id, db
        )
        if not member:
            logger.warning(
                f'User {user_id} not found as member of organization {organization_id}'
            )
            raise ForbiddenError('Not authorized for this organization')
        logger.info(
            f'User {user_id} has {member.role} access to organization {organization_id}'
        )
        return member
    except Exception as e:
        logger.error(
            f'Error checking organization access for user {user_id} in org {organization_id}: {e}'
        )
        raise ForbiddenError('Unable to verify organization access')


class ProjectService:
    def __init__(self, repository: ProjectRepository = project_repository):
        self.repository = repository

    async def get_project_and_check_access(
        self, db: AsyncSession, user_id: UUID, project_id: UUID
    ) -> Project:
        project = await self.repository.get(db, id=project_id)
        if not project:
            raise NotFoundError('Project not found')

        await _check_organization_access(db, user_id, project.organization_id)
        return project

    async def list_projects_by_organization(
        self,
        db: AsyncSession,
        user_id: UUID,
        organization_id: UUID,
        page: int,
        size: int,
    ) -> Tuple[List[Project], int]:
        from app.services.permission_service import permission_service

        await _check_organization_access(db, user_id, organization_id)

        accessible_projects = await permission_service.get_accessible_projects(
            user_id, organization_id, db
        )

        total = len(accessible_projects)

        skip = (page - 1) * size
        paginated_projects = accessible_projects[skip : skip + size]

        return paginated_projects, total

    async def create_project(
        self, db: AsyncSession, user_id: UUID, project_in: ProjectCreate
    ) -> Project:
        member = await _check_organization_access(
            db, user_id, project_in.organization_id
        )

        if member.role not in [OrganizationRole.OWNER, OrganizationRole.ADMIN]:
            raise ForbiddenError('Only owners and admins can create projects')

        # Check subscription limits for project creation
        organization = await usage_tracking_service.get_organization_subscription(
            db, project_in.organization_id
        )
        if not organization:
            limits = PLAN_LIMITS['free']
        else:
            plan = organization.subscription_plan or 'free'
            limits = PLAN_LIMITS.get(plan, PLAN_LIMITS['free'])

        limit = limits.get(ResourceType.PROJECTS.value, 0)
        can_create = (
            limit >= 999
            or await usage_tracking_service.get_current_usage(
                db, project_in.organization_id, ResourceType.PROJECTS.value
            )
            < limit
        )

        if not can_create:
            current_usage = await usage_tracking_service.get_current_usage(
                db, project_in.organization_id, ResourceType.PROJECTS.value
            )
            raise SubscriptionLimitExceededError(
                resource_type=ResourceType.PROJECTS.value,
                current_usage=current_usage,
                limit=limits.get(ResourceType.PROJECTS.value, 0),
                message='Upgrade to Pro plan for unlimited projects',
            )

        base_slug = Project().generate_slug(project_in.name)
        unique_slug = base_slug
        suffix = 1
        while await self.repository.get_by_organization_and_slug(
            db, project_in.organization_id, unique_slug
        ):
            unique_slug = f'{base_slug}-{suffix}'
            suffix += 1
            if suffix > 10:
                raise ValueError('Could not generate a unique slug.')

        project_data = project_in.model_dump()
        project_data['slug'] = unique_slug
        new_project = await self.repository.create(db, **project_data)

        # Increment usage count for subscription tracking
        await usage_tracking_service.increment_usage(
            db, project_in.organization_id, ResourceType.PROJECTS.value
        )

        # Automatically add the creator as an admin to the project
        await project_member_repository.add_member(
            db, new_project.id, user_id, ProjectRole.ADMIN
        )

        return new_project

    async def update_project(
        self,
        db: AsyncSession,
        user_id: UUID,
        project_id: UUID,
        project_in: ProjectUpdate,
    ) -> Project:
        project = await self.get_project_and_check_access(db, user_id, project_id)
        member = await organization_service.get_user_membership(
            project.organization_id, user_id, db
        )
        if not member or member.role not in ['owner', 'admin']:
            raise ForbiddenError('Only owners and admins can update projects')

        update_data = project_in.model_dump(exclude_unset=True)
        updated_project = await self.repository.update(db, id=project_id, **update_data)
        if not updated_project:
            raise NotFoundError('Project not found')

        return updated_project

    async def get_project_settings(
        self, db: AsyncSession, user_id: UUID, project_id: UUID
    ) -> dict:
        project = await self.get_project_and_check_access(db, user_id, project_id)
        return ProjectSettings.model_validate(project.settings or {}).model_dump()

    async def update_project_settings(
        self,
        db: AsyncSession,
        user_id: UUID,
        project_id: UUID,
        settings_in: ProjectSettingsUpdate,
    ) -> dict:
        project = await self.get_project_and_check_access(db, user_id, project_id)
        member = await organization_service.get_user_membership(
            project.organization_id, user_id, db
        )
        if not member or member.role not in ['owner', 'admin']:
            raise ForbiddenError('Only owners and admins can update project settings')

        update_data = settings_in.model_dump(exclude_unset=True)
        current_settings = (
            project.settings.copy() if isinstance(project.settings, dict) else {}
        )
        current_settings.update(update_data)
        validated_settings = ProjectSettings.model_validate(
            current_settings
        ).model_dump()
        await self.repository.update(db, id=project_id, settings=validated_settings)

        return validated_settings

    async def delete_project(
        self, db: AsyncSession, user_id: UUID, project_id: UUID
    ) -> Project:
        project = await self.get_project_and_check_access(db, user_id, project_id)
        member = await organization_service.get_user_membership(
            project.organization_id, user_id, db
        )
        if not member or member.role not in ['owner', 'admin']:
            raise ForbiddenError('Only owners and admins can delete projects')

        # Soft delete the project (usage tracking handled by database trigger)
        deleted_project = await self.repository.soft_delete(db, project_id)
        return deleted_project

    async def get_project_members(
        self,
        db: AsyncSession,
        user_id: UUID,
        project_id: UUID,
        skip: int = 0,
        limit: int = 100,
    ) -> List[ProjectMemberResponse]:
        await self.get_project_and_check_access(db, user_id, project_id)

        members = await project_member_repository.get_project_members(
            db, project_id, skip, limit
        )

        member_responses = []
        for member in members:
            response = ProjectMemberResponse(
                id=member.id,
                user_id=member.user_id,
                project_id=member.project_id,
                role=member.role,
                created_at=member.created_at,
                updated_at=member.updated_at,
                user_name=member.user.name if member.user else None,
                user_email=member.user.email if member.user else None,
            )
            member_responses.append(response)

        return member_responses

    async def invite_project_member(
        self,
        db: AsyncSession,
        user_id: UUID,
        project_id: UUID,
        invite_data: ProjectMemberInviteRequest,
    ) -> ProjectMemberResponse:
        # Get project and validate permissions
        project = await self.get_project_and_check_access(db, user_id, project_id)
        member = await organization_service.get_user_membership(
            project.organization_id, user_id, db
        )
        if not member or member.role not in ['owner', 'admin']:
            raise ForbiddenError('Only owners and admins can invite project members')

        # Check if user exists
        invited_user = await user_repository.get_by_email(db, invite_data.email)
        
        if invited_user:
            # Case A & B: User exists - check project membership first
            existing_project_member = await project_member_repository.get_member_by_project(
                db, project_id, invited_user.id
            )
            if existing_project_member:
                raise ConflictError('User is already a member of this project')
            
            # Check if user is in organization
            org_membership = await organization_service.get_user_membership(
                project.organization_id, invited_user.id, db
            )
            
            if org_membership:
                # Case B: User exists + in org - add directly to project
                new_member = await project_member_repository.add_member(
                    db, project_id, invited_user.id, invite_data.role
                )
                
                logger.info(f'Added existing user {invited_user.id} to project {project_id}')
                
                return ProjectMemberResponse(
                    id=new_member.id,
                    user_id=new_member.user_id,
                    project_id=new_member.project_id,
                    role=new_member.role,
                    created_at=new_member.created_at,
                    updated_at=new_member.updated_at,
                    user_name=invited_user.name,
                    user_email=invited_user.email,
                )
            else:
                # Case C: User exists but not in org - send invitation
                return await self._send_project_invitation(
                    db, user_id, project, invite_data, invited_user.name
                )
        else:
            # Case D: User doesn't exist - send invitation
            return await self._send_project_invitation(
                db, user_id, project, invite_data
            )

    async def _send_project_invitation(
        self,
        db: AsyncSession,
        inviter_id: UUID,
        project,
        invite_data: ProjectMemberInviteRequest,
        invited_user_name: str = None,
    ) -> ProjectMemberResponse:
        """Send invitation for both organization and project membership."""
        from app.services.invitation_service import invitation_service
        from app.schemas.invitation_schema import InvitationEntry
        
        # Create invitation entry - org role is always 'member' for project invites
        invitation_entry = InvitationEntry(
            email=invite_data.email,
            role='member',  # Organization role
            name=invited_user_name
        )
        
        # Use existing invitation service with project_id
        result = await invitation_service._process_single_invitation(
            user_id=inviter_id,
            organization_id=project.organization_id,
            invitation_entry=invitation_entry,
            db=db,
            project_id=project.id,
            project_role=invite_data.role,
        )
        
        if result.status != 'sent':
            from fastapi import HTTPException, status
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f'Failed to send invitation: {result.error}'
            )
        
        logger.info(f'Sent project invitation to {invite_data.email} for project {project.id}')
        
        # Return placeholder response indicating invitation was sent
        return ProjectMemberResponse(
            id=result.invitation_id,
            user_id=None,  # Will be filled when accepted
            project_id=project.id,
            role=invite_data.role,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow(),
            user_name=invited_user_name or invite_data.email.split('@')[0],
            user_email=invite_data.email,
        )

    async def update_project_member(
        self,
        db: AsyncSession,
        user_id: UUID,
        project_id: UUID,
        member_user_id: UUID,
        update_data: ProjectMemberUpdate,
    ) -> ProjectMemberResponse:
        project = await self.get_project_and_check_access(db, user_id, project_id)
        member = await organization_service.get_user_membership(
            project.organization_id, user_id, db
        )
        if not member or member.role not in ['owner', 'admin']:
            raise ForbiddenError('Only owners and admins can update project members')

        updated_member = await project_member_repository.update_member_role(
            db, project_id, member_user_id, update_data.role
        )

        if not updated_member:
            raise NotFoundError('Project member not found')

        user = await user_repository.get(db, member_user_id)

        logger.info(
            f'Updated project member {member_user_id} role in project {project_id}'
        )
        return ProjectMemberResponse(
            id=updated_member.id,
            user_id=updated_member.user_id,
            project_id=updated_member.project_id,
            role=updated_member.role,
            created_at=updated_member.created_at,
            updated_at=updated_member.updated_at,
            user_name=user.name if user else None,
            user_email=user.email if user else None,
        )

    async def remove_project_member(
        self, db: AsyncSession, user_id: UUID, project_id: UUID, member_user_id: UUID
    ) -> bool:
        project = await self.get_project_and_check_access(db, user_id, project_id)
        member = await organization_service.get_user_membership(
            project.organization_id, user_id, db
        )
        if not member or member.role not in ['owner', 'admin']:
            raise ForbiddenError('Only owners and admins can remove project members')

        success = await project_member_repository.remove_member(
            db, project_id, member_user_id
        )

        if success:
            logger.info(f'Removed member {member_user_id} from project {project_id}')

        return success

    async def get_project_by_id(self, db: AsyncSession, project_id: UUID) -> Project:
        project = await self.repository.get(db, id=project_id)
        if not project:
            raise NotFoundError('Project not found')
        return project


project_service = ProjectService()
