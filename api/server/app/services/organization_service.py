from typing import Optional, List
from uuid import UUID
from datetime import datetime, timezone
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.exc import IntegrityError
from sqlalchemy import select
from app.models.organization_model import (
    Organization,
    OrganizationMember,
    OrganizationRole,
)
from app.models.invitation import PendingMember
from app.repositories.organization_repository import (
    organization_repository,
    organization_member_repository,
)
from app.repositories.user_repository import user_repository
from app.schemas.organization_schema import (
    OrganizationCreate,
    OrganizationUpdate,
    OrganizationResponse,
    OrganizationDetailResponse,
    OrganizationMemberResponse,
    OrganizationListResponse,
    OrganizationInviteRequest,
    OrganizationMemberUpdate,
)
from app.core.logging import get_logger
from app.core.exceptions import (
    NotFoundError,
    ForbiddenError,
    ConflictError,
    ValidationError,
)

logger = get_logger(__name__)


class OrganizationService:
    async def create_organization(
        self, user_id: UUID, org_data: OrganizationCreate, db: AsyncSession
    ) -> OrganizationResponse:
        try:
            org_dict = org_data.model_dump()

            if not org_dict.get('slug'):
                org = Organization(**org_dict)
                org_dict['slug'] = org.generate_slug(org_dict['name'])

            new_org = await organization_repository.create(db, **org_dict)

            await organization_member_repository.add_member(
                db, new_org.id, user_id, OrganizationRole.OWNER
            )

            logger.info(f'Created organization {new_org.id} with owner {user_id}')
            return OrganizationResponse.model_validate(new_org)

        except IntegrityError as e:
            logger.error(f'Failed to create organization: {e}')
            raise ConflictError('Organization with this slug already exists')

    async def get_organization(
        self,
        org_id: UUID,
        user_id: UUID,
        db: AsyncSession,
        include_members: bool = False,
    ) -> OrganizationResponse:
        await self._check_user_access(db, org_id, user_id)

        if include_members:
            org = await organization_repository.get_with_members(db, org_id)
            if not org:
                raise NotFoundError('Organization not found')
            return OrganizationDetailResponse.model_validate(org)
        else:
            org = await organization_repository.get_with_counts(db, org_id)
            if not org:
                raise NotFoundError('Organization not found')
            return OrganizationResponse.model_validate(org)

    async def get_user_organizations(
        self, user_id: UUID, db: AsyncSession, skip: int = 0, limit: int = 100
    ) -> OrganizationListResponse:
        try:
            organizations = await organization_repository.get_user_organizations(
                db, user_id, skip, limit
            )
            total = await organization_repository.count_user_organizations(db, user_id)

            org_responses = []
            for org in organizations:
                try:
                    org_with_counts = await organization_repository.get_with_counts(
                        db, org.id
                    )
                    if org_with_counts:
                        org_responses.append(
                            OrganizationResponse.model_validate(org_with_counts)
                        )
                except Exception as e:
                    logger.warning(
                        f'Failed to get counts for organization {org.id}: {e}'
                    )
                    # Fallback to basic organization data
                    org_responses.append(OrganizationResponse.model_validate(org))

            total_pages = (total + limit - 1) // limit if limit > 0 else 1

            return OrganizationListResponse(
                organizations=org_responses,
                total=total,
                page=(skip // limit) + 1 if limit > 0 else 1,
                page_size=limit,
                total_pages=total_pages,
            )
        except Exception as e:
            logger.error(f'Error getting user organizations for user {user_id}: {e}')
            # Return empty response for new users instead of failing
            return OrganizationListResponse(
                organizations=[],
                total=0,
                page=1,
                page_size=limit,
                total_pages=0,
            )

    async def update_organization(
        self,
        org_id: UUID,
        user_id: UUID,
        update_data: OrganizationUpdate,
        db: AsyncSession,
    ) -> OrganizationResponse:
        await self._check_admin_access(db, org_id, user_id)

        update_dict = update_data.model_dump(exclude_unset=True)
        if not update_dict:
            return await self.get_organization(org_id, user_id, db)

        update_dict['updated_at'] = datetime.now(timezone.utc)

        try:
            updated_org = await organization_repository.update(
                db, org_id, **update_dict
            )
            if not updated_org:
                raise NotFoundError('Organization not found')

            return OrganizationResponse.model_validate(updated_org)
        except IntegrityError:
            raise ConflictError('Organization with this slug already exists')

    async def delete_organization(
        self, org_id: UUID, user_id: UUID, db: AsyncSession
    ) -> bool:
        await self._check_owner_access(db, org_id, user_id)

        success = await organization_repository.soft_delete(db, org_id)
        if success:
            logger.info(f'Soft deleted organization {org_id} by user {user_id}')
        return success is not None

    async def invite_member(
        self,
        org_id: UUID,
        user_id: UUID,
        invite_data: OrganizationInviteRequest,
        db: AsyncSession,
    ) -> OrganizationMemberResponse:
        await self._check_admin_access(db, org_id, user_id)

        invited_user = await user_repository.get_by_email(db, invite_data.email)

        if invited_user:
            # User exists - check if already a member
            existing_member = await organization_member_repository.get_by_org_and_user(
                db, org_id, invited_user.id
            )
            if existing_member:
                raise ConflictError('User is already a member of this organization')

            member = await organization_member_repository.add_member(
                db, org_id, invited_user.id, invite_data.role
            )

            logger.info(
                f'Added existing user {invited_user.id} to organization {org_id}'
            )

            response = OrganizationMemberResponse.model_validate(member)
            response.user_name = invited_user.name
            response.user_email = invited_user.email
            response.is_pending = False
            return response
        else:
            # User doesn't exist - create invitation
            from app.services.invitation_service import invitation_service
            from app.schemas.invitation_schema import InvitationEntry

            if not invite_data.email or not invite_data.email.strip():
                raise ValidationError('Email address is required')

            invitation_entry = InvitationEntry(
                email=invite_data.email.strip(),
                role=invite_data.role,
                name=None,  # We don't have the name yet
            )

            result = await invitation_service._process_single_invitation(
                user_id=user_id,
                organization_id=org_id,
                invitation_entry=invitation_entry,
                db=db,
            )

            if result.status != 'sent':
                raise ValidationError(f'Failed to send invitation: {result.error}')

            logger.info(
                f'Sent invitation to {invite_data.email} for organization {org_id}'
            )

            response = OrganizationMemberResponse(
                id=result.invitation_id,
                user_id=None,
                organization_id=org_id,
                role=invite_data.role,
                user_name='Pending User',
                user_email=invite_data.email,
                is_pending=True,
                created_at=datetime.now(timezone.utc),
                updated_at=datetime.now(timezone.utc),
            )
            return response

    async def get_members(
        self,
        org_id: UUID,
        user_id: UUID,
        db: AsyncSession,
        skip: int = 0,
        limit: int = 100,
    ) -> List[OrganizationMemberResponse]:
        await self._check_user_access(db, org_id, user_id)

        members = await organization_member_repository.get_org_members(
            db, org_id, skip, limit
        )

        member_responses = []
        for member in members:
            response = OrganizationMemberResponse(
                id=member.id,
                user_id=member.user_id,
                organization_id=member.organization_id,
                role=member.role,
                created_at=member.created_at,
                updated_at=member.updated_at,
                user_name=member.user.name if member.user else None,
                user_email=member.user.email if member.user else None,
                is_pending=False,
            )
            member_responses.append(response)

        stmt = select(PendingMember).where(PendingMember.organization_id == org_id)
        result = await db.execute(stmt)
        pending_members = result.scalars().all()

        for pending in pending_members:
            response = OrganizationMemberResponse(
                id=pending.id,
                user_id=None,  # No user yet
                organization_id=org_id,
                role=pending.role,
                user_name=pending.name or 'Pending User',
                user_email=pending.email,
                is_pending=True,
                created_at=pending.created_at,
                updated_at=pending.created_at,
            )
            member_responses.append(response)

        return member_responses

    async def get_user_membership(
        self, org_id: UUID, user_id: UUID, db: AsyncSession
    ) -> Optional[OrganizationMemberResponse]:
        org = await organization_repository.get(db, org_id)
        if not org:
            logger.warning(f'Organization {org_id} not found')
            return None

        member = await organization_member_repository.get_by_org_and_user(
            db, org_id, user_id
        )
        if not member:
            logger.warning(f'User {user_id} is not a member of organization {org_id}')
            return None

        response = OrganizationMemberResponse.model_validate(member)
        if member.user:
            response.user_name = member.user.name
            response.user_email = member.user.email
        return response

    async def update_member(
        self,
        org_id: UUID,
        member_user_id: UUID,
        user_id: UUID,
        update_data: OrganizationMemberUpdate,
        db: AsyncSession,
    ) -> OrganizationMemberResponse:
        await self._check_admin_access(db, org_id, user_id)

        if user_id == member_user_id:
            current_member = await organization_member_repository.get_by_org_and_user(
                db, org_id, user_id
            )
            if current_member and current_member.role == OrganizationRole.OWNER:
                raise ForbiddenError('Organization owner cannot change their own role')

        updated_member = await organization_member_repository.update_member_role(
            db, org_id, member_user_id, update_data.role
        )

        if not updated_member:
            raise NotFoundError('Member not found')

        logger.info(f'Updated member {member_user_id} role in organization {org_id}')
        return OrganizationMemberResponse.model_validate(updated_member)

    async def remove_member(
        self, org_id: UUID, member_user_id: UUID, user_id: UUID, db: AsyncSession
    ) -> bool:
        await self._check_admin_access(db, org_id, user_id)

        if user_id == member_user_id:
            current_member = await organization_member_repository.get_by_org_and_user(
                db, org_id, user_id
            )
            if current_member and current_member.role == OrganizationRole.OWNER:
                raise ForbiddenError('Organization owner cannot remove themselves')

        success = await organization_member_repository.remove_member(
            db, org_id, member_user_id
        )

        if success:
            logger.info(f'Removed member {member_user_id} from organization {org_id}')

        return success

    async def leave_organization(
        self, org_id: UUID, user_id: UUID, db: AsyncSession
    ) -> bool:
        member = await organization_member_repository.get_by_org_and_user(
            db, org_id, user_id
        )

        if not member:
            raise NotFoundError('You are not a member of this organization')

        if member.role == OrganizationRole.OWNER:
            member_count = await organization_member_repository.count_org_members(
                db, org_id
            )
            if member_count > 1:
                raise ForbiddenError(
                    'Organization owner cannot leave. Transfer ownership first or delete the organization.'
                )

        success = await organization_member_repository.remove_member(
            db, org_id, user_id
        )
        if success:
            logger.info(f'User {user_id} left organization {org_id}')

        return success

    async def _check_user_access(
        self, db: AsyncSession, org_id: UUID, user_id: UUID
    ) -> OrganizationMember:
        member = await organization_repository.check_user_access(db, org_id, user_id)
        if not member:
            raise ForbiddenError('You do not have access to this organization')
        return member

    async def _check_admin_access(
        self, db: AsyncSession, org_id: UUID, user_id: UUID
    ) -> OrganizationMember:
        member = await self._check_user_access(db, org_id, user_id)
        if member.role not in [OrganizationRole.OWNER, OrganizationRole.ADMIN]:
            raise ForbiddenError('You do not have admin access to this organization')
        return member

    async def _check_owner_access(
        self, db: AsyncSession, org_id: UUID, user_id: UUID
    ) -> OrganizationMember:
        member = await self._check_user_access(db, org_id, user_id)
        if member.role != OrganizationRole.OWNER:
            raise ForbiddenError('Only organization owner can perform this action')
        return member

    async def check_project_access(
        self,
        db: AsyncSession,
        user_id: UUID,
        project_id: UUID,
        required_role: Optional[str] = None,
    ) -> None:
        from app.repositories.project_repository import project_repository

        project = await project_repository.get(db, project_id)
        if not project:
            raise NotFoundError('Project not found')

        member = await self._check_user_access(db, project.organization_id, user_id)

        if required_role:
            if required_role == 'Admin' and member.role not in [
                OrganizationRole.OWNER,
                OrganizationRole.ADMIN,
            ]:
                raise ForbiddenError('Admin access required')
            elif required_role == 'Owner' and member.role != OrganizationRole.OWNER:
                raise ForbiddenError('Owner access required')


organization_service = OrganizationService()
