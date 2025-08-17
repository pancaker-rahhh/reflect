import asyncio
import secrets
from typing import List, Optional, Dict, Any
from uuid import UUID, uuid4
from datetime import datetime, timedelta
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, or_
from sqlalchemy.orm import selectinload

from app.models.organization_model import Organization, OrganizationMember
from app.models.invitation import Invitation, PendingMember, InvitationTask
from app.models.user_model import User
from app.schemas.invitation_schema import (
    InvitationEntry,
    InvitationResult,
    InvitationStatusResponse,
    InvitationModel,
    InvitationValidateResponse,
    InvitationAcceptResponse,
    NewUserData,
)
from app.services.email_service import email_service
from app.core.logging import get_logger
from app.core.settings import get_settings

settings = get_settings()

logger = get_logger(__name__)


class InvitationService:
    """
    Service for handling invitations with abstracted background processing.
    Designed to work with FastAPI BackgroundTasks but can be easily migrated
    to Celery, RQ, or other task queues.
    """
    
    def __init__(self):
        self.invitation_expiry_hours = 72  # 3 days
        self.max_retries = 3
    
    async def check_invite_permission(
        self,
        user_id: UUID,
        organization_id: UUID,
        db: AsyncSession
    ) -> bool:
        """Check if user has permission to invite members to organization."""
        stmt = select(OrganizationMember).where(
            and_(
                OrganizationMember.organization_id == organization_id,
                OrganizationMember.user_id == user_id,
                OrganizationMember.role.in_(["owner", "admin"])
            )
        )
        result = await db.execute(stmt)
        member = result.scalar_one_or_none()
        return member is not None
    
    async def create_bulk_invitation_task(
        self,
        user_id: UUID,
        organization_id: Optional[UUID],
        invitations: List[InvitationEntry],
        db: AsyncSession
    ) -> str:
        """Create a task entry for tracking bulk invitation progress."""
        task_id = str(uuid4())
        
        task = InvitationTask(
            id=task_id,
            user_id=user_id,
            organization_id=organization_id,
            total_count=len(invitations),
            status="pending",
            created_at=datetime.utcnow()
        )
        
        db.add(task)
        await db.commit()
        
        return task_id
    
    async def process_bulk_invitations(
        self,
        task_id: str,
        user_id: UUID,
        organization_id: Optional[UUID],
        invitations: List[InvitationEntry]
    ):
        """
        Process bulk invitations asynchronously.
        This is the main background task that can be easily migrated
        to a different task queue system.
        """
        # Create new database session for background task
        from app.db import AsyncSessionLocal
        
        async with AsyncSessionLocal() as db:
            try:
                # Update task status to processing
                await self._update_task_status(task_id, "processing", db)
                
                results = []
                success_count = 0
                failed_count = 0
                
                for invitation_entry in invitations:
                    result = await self._process_single_invitation(
                        user_id=user_id,
                        organization_id=organization_id,
                        invitation_entry=invitation_entry,
                        db=db
                    )
                    
                    results.append(result)
                    if result.status == "sent":
                        success_count += 1
                    else:
                        failed_count += 1
                    
                    # Update progress
                    await self._update_task_progress(
                        task_id=task_id,
                        processed_count=len(results),
                        success_count=success_count,
                        failed_count=failed_count,
                        db=db
                    )
                    
                    # Small delay to prevent overwhelming email service
                    await asyncio.sleep(0.1)
                
                # Mark task as completed
                await self._update_task_status(
                    task_id=task_id,
                    status="completed",
                    db=db,
                    results=results
                )
                
                logger.info(f"Completed bulk invitation task {task_id}: {success_count} sent, {failed_count} failed")
                
            except Exception as e:
                logger.error(f"Error processing bulk invitations for task {task_id}: {str(e)}")
                await self._update_task_status(
                    task_id=task_id,
                    status="failed",
                    db=db,
                    error=str(e)
                )
    
    async def _process_single_invitation(
        self,
        user_id: UUID,
        organization_id: Optional[UUID],
        invitation_entry: InvitationEntry,
        db: AsyncSession
    ) -> InvitationResult:
        """Process a single invitation."""
        try:
            # Check if user already exists
            stmt = select(User).where(User.email == invitation_entry.email.lower())
            result = await db.execute(stmt)
            existing_user = result.scalar_one_or_none()
            
            # Check if already a member
            if organization_id and existing_user:
                stmt = select(OrganizationMember).where(
                    and_(
                        OrganizationMember.organization_id == organization_id,
                        OrganizationMember.user_id == existing_user.id
                    )
                )
                result = await db.execute(stmt)
                if result.scalar_one_or_none():
                    return InvitationResult(
                        email=invitation_entry.email,
                        status="duplicate",
                        error="User is already a member"
                    )
            
            # Check for existing pending invitation
            stmt = select(Invitation).where(
                and_(
                    Invitation.email == invitation_entry.email.lower(),
                    Invitation.organization_id == organization_id,
                    Invitation.status == "pending"
                )
            )
            result = await db.execute(stmt)
            existing_invitation = result.scalar_one_or_none()
            
            if existing_invitation:
                # Update existing invitation
                existing_invitation.expires_at = datetime.utcnow() + timedelta(hours=self.invitation_expiry_hours)
                existing_invitation.role = invitation_entry.role
                invitation_id = existing_invitation.id
                token = existing_invitation.token
            else:
                # Create new invitation
                token = secrets.token_urlsafe(32)
                invitation = Invitation(
                    id=uuid4(),
                    email=invitation_entry.email.lower(),
                    role=invitation_entry.role,
                    organization_id=organization_id,
                    invited_by=user_id,
                    token=token,
                    status="pending",
                    expires_at=datetime.utcnow() + timedelta(hours=self.invitation_expiry_hours),
                    created_at=datetime.utcnow()
                )
                db.add(invitation)
                invitation_id = invitation.id
                
                # Create pending member placeholder
                if not existing_user:
                    pending_member = PendingMember(
                        id=uuid4(),
                        email=invitation_entry.email.lower(),
                        name=invitation_entry.name,
                        role=invitation_entry.role,
                        organization_id=organization_id,
                        invitation_id=invitation_id,
                        added_by=user_id,
                        created_at=datetime.utcnow()
                    )
                    db.add(pending_member)
            
            await db.commit()
            
            # Send invitation email
            await self._send_invitation_email(
                email=invitation_entry.email,
                token=token,
                organization_id=organization_id,
                role=invitation_entry.role
            )
            
            return InvitationResult(
                email=invitation_entry.email,
                status="sent",
                invitation_id=invitation_id
            )
            
        except Exception as e:
            logger.error(f"Failed to process invitation for {invitation_entry.email}: {str(e)}")
            return InvitationResult(
                email=invitation_entry.email,
                status="failed",
                error=str(e)
            )
    
    async def _send_invitation_email(
        self,
        email: str,
        token: str,
        organization_id: Optional[UUID],
        role: str
    ):
        """Send invitation email."""
        # This is a placeholder - implement actual email sending
        invite_url = f"{settings.FRONTEND_URL}/invite?token={token}"
        
        await email_service.send_invitation(
            to_email=email,
            invite_url=invite_url,
            organization_name="Your Organization",  # Fetch actual name
            role=role
        )
    
    async def _update_task_status(
        self,
        task_id: str,
        status: str,
        db: AsyncSession,
        results: Optional[List[InvitationResult]] = None,
        error: Optional[str] = None
    ):
        """Update task status in database."""
        stmt = select(InvitationTask).where(InvitationTask.id == task_id)
        result = await db.execute(stmt)
        task = result.scalar_one_or_none()
        
        if task:
            task.status = status
            if status == "completed":
                task.completed_at = datetime.utcnow()
            if results:
                task.results = [r.dict() for r in results]
            if error:
                task.error = error
            
            await db.commit()
    
    async def _update_task_progress(
        self,
        task_id: str,
        processed_count: int,
        success_count: int,
        failed_count: int,
        db: AsyncSession
    ):
        """Update task progress in database."""
        stmt = select(InvitationTask).where(InvitationTask.id == task_id)
        result = await db.execute(stmt)
        task = result.scalar_one_or_none()
        
        if task:
            task.processed_count = processed_count
            task.success_count = success_count
            task.failed_count = failed_count
            await db.commit()
    
    async def get_invitation_task_status(
        self,
        task_id: str,
        user_id: UUID,
        db: AsyncSession
    ) -> Optional[InvitationStatusResponse]:
        """Get status of an invitation task."""
        stmt = select(InvitationTask).where(
            and_(
                InvitationTask.id == task_id,
                InvitationTask.user_id == user_id
            )
        )
        result = await db.execute(stmt)
        task = result.scalar_one_or_none()
        
        if not task:
            return None
        
        return InvitationStatusResponse(
            task_id=task.id,
            status=task.status,
            total_count=task.total_count,
            processed_count=task.processed_count or 0,
            success_count=task.success_count or 0,
            failed_count=task.failed_count or 0,
            results=[InvitationResult(**r) for r in (task.results or [])],
            created_at=task.created_at,
            completed_at=task.completed_at,
            error=task.error
        )
    
    async def get_invitation(
        self,
        invitation_id: UUID,
        user_id: UUID,
        db: AsyncSession
    ) -> Optional[InvitationModel]:
        """Get a specific invitation."""
        stmt = select(Invitation).where(
            and_(
                Invitation.id == invitation_id,
                Invitation.invited_by == user_id
            )
        )
        result = await db.execute(stmt)
        invitation = result.scalar_one_or_none()
        
        if invitation:
            return InvitationModel.from_orm(invitation)
        return None
    
    async def resend_invitation(self, invitation_id: UUID):
        """Resend an invitation email."""
        # Implementation for resending invitation
        logger.info(f"Resending invitation {invitation_id}")
    
    async def cancel_invitation(
        self,
        invitation_id: UUID,
        user_id: UUID,
        db: AsyncSession
    ) -> bool:
        """Cancel a pending invitation."""
        stmt = select(Invitation).where(
            and_(
                Invitation.id == invitation_id,
                Invitation.invited_by == user_id,
                Invitation.status == "pending"
            )
        )
        result = await db.execute(stmt)
        invitation = result.scalar_one_or_none()
        
        if invitation:
            invitation.status = "cancelled"
            
            # Remove pending member if exists
            stmt = select(PendingMember).where(
                PendingMember.invitation_id == invitation_id
            )
            result = await db.execute(stmt)
            pending_member = result.scalar_one_or_none()
            if pending_member:
                await db.delete(pending_member)
            
            await db.commit()
            return True
        
        return False
    
    async def validate_invitation_token(
        self,
        token: str,
        db: AsyncSession
    ) -> Optional[InvitationValidateResponse]:
        """Validate an invitation token and return details."""
        stmt = select(Invitation).options(
            selectinload(Invitation.organization),
            selectinload(Invitation.project),
            selectinload(Invitation.inviter)
        ).where(
            and_(
                Invitation.token == token,
                Invitation.status == "pending"
            )
        )
        result = await db.execute(stmt)
        invitation = result.scalar_one_or_none()
        
        if not invitation:
            return None
        
        # Check if user exists
        stmt = select(User).where(User.email == invitation.email.lower())
        result = await db.execute(stmt)
        user_exists = result.scalar_one_or_none() is not None
        
        # Check expiration
        is_expired = datetime.utcnow() > invitation.expires_at
        
        return InvitationValidateResponse(
            invitation_id=invitation.id,
            email=invitation.email,
            organization_name=invitation.organization.name if invitation.organization else None,
            project_name=invitation.project.name if invitation.project else None,
            role=invitation.role,
            inviter_name=invitation.inviter.name if invitation.inviter else "Unknown",
            expires_at=invitation.expires_at,
            is_expired=is_expired,
            user_exists=user_exists
        )
    
    async def accept_invitation(
        self,
        token: str,
        user_id: Optional[UUID],
        user_data: Optional[NewUserData],
        db: AsyncSession
    ) -> Optional[InvitationAcceptResponse]:
        """
        Accept an invitation and create/update user memberships.
        Handles both existing and new users.
        """
        # Validate invitation
        validation = await self.validate_invitation_token(token, db)
        if not validation:
            raise ValueError("Invalid or expired invitation token")
        
        if validation.is_expired:
            raise ValueError("Invitation has expired")
        
        # Get the invitation
        stmt = select(Invitation).where(
            and_(
                Invitation.token == token,
                Invitation.status == "pending"
            )
        )
        result = await db.execute(stmt)
        invitation = result.scalar_one_or_none()
        
        if not invitation:
            return None
        
        # Determine or create user
        if user_id:
            # Existing authenticated user
            stmt = select(User).where(User.id == user_id)
            result = await db.execute(stmt)
            user = result.scalar_one_or_none()
            if not user:
                raise ValueError("User not found")
        else:
            # Check if user exists with this email
            stmt = select(User).where(User.email == invitation.email.lower())
            result = await db.execute(stmt)
            user = result.scalar_one_or_none()
            
            if not user:
                # Create new user
                if not user_data:
                    raise ValueError("User data required for new user registration")
                
                user = await self._create_user_from_invitation(
                    invitation=invitation,
                    user_data=user_data,
                    db=db
                )
        
        # Add user to organization/project
        if invitation.organization_id:
            await self._add_to_organization(
                user_id=user.id,
                organization_id=invitation.organization_id,
                role=invitation.role,
                db=db
            )
        
        # Update invitation status
        invitation.status = "accepted"
        invitation.accepted_at = datetime.utcnow()
        invitation.accepted_by = user.id
        
        # Remove pending member
        stmt = select(PendingMember).where(
            PendingMember.invitation_id == invitation.id
        )
        result = await db.execute(stmt)
        pending_member = result.scalar_one_or_none()
        if pending_member:
            await db.delete(pending_member)
        
        await db.commit()
        
        # Generate response
        redirect_url = f"{settings.FRONTEND_URL}/dashboard"
        if invitation.organization_id:
            redirect_url = f"{settings.FRONTEND_URL}/org/{invitation.organization_id}/dashboard"
        
        return InvitationAcceptResponse(
            success=True,
            message="Invitation accepted successfully",
            user_id=user.id,
            organization_id=invitation.organization_id,
            project_id=invitation.project_id,
            role=invitation.role,
            access_token=None,  # Will be handled by auth flow
            redirect_url=redirect_url
        )
    
    async def _create_user_from_invitation(
        self,
        invitation: Invitation,
        user_data: NewUserData,
        db: AsyncSession
    ) -> User:
        """Create a new user from invitation data."""
        from app.services.supabase_service import supabase_service
        
        # Create user in Supabase first
        supabase_user = await supabase_service.create_user(
            email=invitation.email,
            password=user_data.password,
            metadata={
                "name": user_data.name,
                "phone": user_data.phone,
                "avatar_url": user_data.avatar_url,
                "invited": True,
                "invitation_id": str(invitation.id)
            }
        )
        
        if not supabase_user:
            raise ValueError("Failed to create user account")
        
        # Create user in database
        user = User(
            id=UUID(supabase_user["id"]),
            email=invitation.email.lower(),
            name=user_data.name,
            phone=user_data.phone,
            avatar_url=user_data.avatar_url,
            onboarding_completed=True,  # Skip onboarding for invited users
            user_type="team_member",
            first_login_at=datetime.utcnow(),
            last_login_at=datetime.utcnow(),
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )
        
        db.add(user)
        await db.flush()
        
        return user
    
    async def _add_to_organization(
        self,
        user_id: UUID,
        organization_id: UUID,
        role: str,
        db: AsyncSession
    ) -> None:
        """Add user to organization with specified role."""
        # Check if already a member
        stmt = select(OrganizationMember).where(
            and_(
                OrganizationMember.organization_id == organization_id,
                OrganizationMember.user_id == user_id
            )
        )
        result = await db.execute(stmt)
        existing_member = result.scalar_one_or_none()
        
        if not existing_member:
            # Add as new member
            member = OrganizationMember(
                id=uuid4(),
                organization_id=organization_id,
                user_id=user_id,
                role=role,
                created_at=datetime.utcnow(),
                updated_at=datetime.utcnow()
            )
            db.add(member)
            logger.info(f"Added user {user_id} to organization {organization_id} with role {role}")


# Singleton instance
invitation_service = InvitationService()