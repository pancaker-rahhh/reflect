from typing import Tuple, List
from uuid import UUID

from sqlalchemy.ext.asyncio import AsyncSession
from app.models.project_model import Project
from app.models.organization_model import ProjectRole, OrganizationRole
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
from app.core.exceptions import NotFoundError, ForbiddenError, ConflictError, ValidationError
from app.core.logging import get_logger

logger = get_logger(__name__)


async def _check_organization_access(
    db: AsyncSession, user_id: UUID, organization_id: UUID
):
    member = await organization_service.get_user_membership(
        organization_id, user_id, db
    )
    if not member:
        raise ForbiddenError('Not authorized for this organization')
    return member


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
        await _check_organization_access(db, user_id, organization_id)

        skip = (page - 1) * size
        return await self.repository.get_all_by_organization(
            db, organization_id=organization_id, skip=skip, limit=size
        )

    async def create_project(
        self, db: AsyncSession, user_id: UUID, project_in: ProjectCreate
    ) -> Project:
        member = await _check_organization_access(
            db, user_id, project_in.organization_id
        )
        if not member or member.role not in [OrganizationRole.OWNER, OrganizationRole.ADMIN]:
            raise ForbiddenError('Only owners and admins can create projects')

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
        if not member or member.role not in [OrganizationRole.OWNER, OrganizationRole.ADMIN]:
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
        if not member or member.role not in [OrganizationRole.OWNER, OrganizationRole.ADMIN]:
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
        if not member or member.role not in [OrganizationRole.OWNER, OrganizationRole.ADMIN]:
            raise ForbiddenError('Only owners and admins can delete projects')

        return await self.repository.soft_delete(db, project_id)

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
        project = await self.get_project_and_check_access(db, user_id, project_id)
        member = await organization_service.get_user_membership(
            project.organization_id, user_id, db
        )
        if not member or member.role not in [OrganizationRole.OWNER, OrganizationRole.ADMIN]:
            raise ForbiddenError('Only owners and admins can invite project members')

        invited_user = await user_repository.get_by_email(db, invite_data.email)
        
        if invited_user:
            # User exists - check if already a member and add them
            existing_member = await project_member_repository.get_member_by_project(
                db, project_id, invited_user.id
            )
            if existing_member:
                raise ConflictError('User is already a member of this project')

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
                is_pending=False,
            )
        else:
            # User doesn't exist - create invitation for both org and project
            from app.services.invitation_service import invitation_service
            from app.schemas.invitation_schema import InvitationEntry

            if not invite_data.email or not invite_data.email.strip():
                raise ValidationError('Email address is required')

            # Create invitation entry
            invitation_entry = InvitationEntry(
                email=invite_data.email.strip(),
                role=invite_data.role,
                name=None,  # We don't have the name yet
            )

            # Process the invitation for the project (this will create invitation for the org)
            # But we also need to store that this user should be added to the specific project
            result = await invitation_service._process_single_invitation(
                user_id=user_id,
                organization_id=project.organization_id,
                invitation_entry=invitation_entry,
                db=db,
                project_id=project_id,  # Pass the project ID
            )

            if result.status != 'sent':
                raise ValueError(f'Failed to send invitation: {result.error}')

            logger.info(f'Created invitation for {invite_data.email} to project {project_id}')

            # Return a pending member response
            return ProjectMemberResponse(
                id=None,  # No actual member ID yet
                user_id=None,  # No user ID yet
                project_id=project_id,
                role=invite_data.role,
                created_at=None,  # Will be set when invitation is accepted
                updated_at=None,
                user_name='Pending User',
                user_email=invite_data.email,
                is_pending=True,
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
        if not member or member.role not in [OrganizationRole.OWNER, OrganizationRole.ADMIN]:
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
        if not member or member.role not in [OrganizationRole.OWNER, OrganizationRole.ADMIN]:
            raise ForbiddenError('Only owners and admins can remove project members')

        success = await project_member_repository.remove_member(
            db, project_id, member_user_id
        )

        if success:
            logger.info(f'Removed member {member_user_id} from project {project_id}')

        return success


project_service = ProjectService()
