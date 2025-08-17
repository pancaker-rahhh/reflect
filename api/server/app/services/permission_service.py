from typing import List, Optional, Dict, Any
from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, or_
from sqlalchemy.orm import selectinload

from app.models.organization_model import Organization, OrganizationMember, ProjectMember
from app.models.project_model import Project
from app.models.user_model import User
from app.core.logging import get_logger

logger = get_logger(__name__)


class PermissionService:
    """Service for handling role-based access control and permissions."""
    
    # Define role hierarchy (higher index = more permissions)
    ROLE_HIERARCHY = {
        "viewer": 0,
        "member": 1,
        "admin": 2,
        "owner": 3
    }
    
    # Define permission matrix
    PERMISSIONS = {
        "viewer": [
            "view_organization",
            "view_projects",
            "view_members",
            "view_settings"
        ],
        "member": [
            "view_organization",
            "view_projects",
            "view_members",
            "view_settings",
            "create_projects",
            "edit_own_projects",
            "create_feedback",
            "edit_own_feedback"
        ],
        "admin": [
            "view_organization",
            "view_projects",
            "view_members",
            "view_settings",
            "create_projects",
            "edit_projects",
            "delete_projects",
            "invite_members",
            "manage_members",
            "create_feedback",
            "edit_feedback",
            "delete_feedback",
            "manage_settings"
        ],
        "owner": [
            "view_organization",
            "view_projects",
            "view_members",
            "view_settings",
            "create_projects",
            "edit_projects",
            "delete_projects",
            "invite_members",
            "manage_members",
            "remove_members",
            "create_feedback",
            "edit_feedback",
            "delete_feedback",
            "manage_settings",
            "manage_billing",
            "delete_organization",
            "transfer_ownership"
        ]
    }
    
    async def get_user_role_in_organization(
        self,
        user_id: UUID,
        organization_id: UUID,
        db: AsyncSession
    ) -> Optional[str]:
        stmt = select(OrganizationMember).where(
            and_(
                OrganizationMember.user_id == user_id,
                OrganizationMember.organization_id == organization_id
            )
        )
        result = await db.execute(stmt)
        member = result.scalar_one_or_none()
        
        return member.role if member else None
    
    async def get_user_role_in_project(
        self,
        user_id: UUID,
        project_id: UUID,
        db: AsyncSession
    ) -> Optional[str]:
        stmt = select(ProjectMember).where(
            and_(
                ProjectMember.user_id == user_id,
                ProjectMember.project_id == project_id
            )
        )
        result = await db.execute(stmt)
        member = result.scalar_one_or_none()
        
        if member:
            return member.role
        
        stmt = select(Project).where(Project.id == project_id)
        result = await db.execute(stmt)
        project = result.scalar_one_or_none()
        
        if project and project.organization_id:
            return await self.get_user_role_in_organization(
                user_id, project.organization_id, db
            )
        
        return None
    
    async def has_permission(
        self,
        user_id: UUID,
        permission: str,
        organization_id: Optional[UUID] = None,
        project_id: Optional[UUID] = None,
        db: Optional[AsyncSession] = None
    ) -> bool:
        if not db:
            return False
        
        role = None
        
        if project_id:
            role = await self.get_user_role_in_project(user_id, project_id, db)
        elif organization_id:
            role = await self.get_user_role_in_organization(user_id, organization_id, db)
        
        if not role:
            return False
        
        allowed_permissions = self.PERMISSIONS.get(role, [])
        return permission in allowed_permissions
    
    async def can_manage_member(
        self,
        manager_id: UUID,
        target_user_id: UUID,
        organization_id: UUID,
        db: AsyncSession
    ) -> bool:
        manager_role = await self.get_user_role_in_organization(
            manager_id, organization_id, db
        )
        
        if not manager_role:
            return False
        
        # Owners can manage anyone
        if manager_role == "owner":
            return True
        
        # Admins can manage members and viewers
        if manager_role == "admin":
            target_role = await self.get_user_role_in_organization(
                target_user_id, organization_id, db
            )
            if target_role and self.ROLE_HIERARCHY.get(target_role, 0) < self.ROLE_HIERARCHY["admin"]:
                return True
        
        return False
    
    async def get_accessible_organizations(
        self,
        user_id: UUID,
        db: AsyncSession
    ) -> List[Organization]:
        stmt = select(Organization).join(OrganizationMember).where(
            OrganizationMember.user_id == user_id
        ).options(
            selectinload(Organization.members)
        )
        
        result = await db.execute(stmt)
        return result.scalars().all()
    
    async def get_accessible_projects(
        self,
        user_id: UUID,
        organization_id: Optional[UUID],
        db: AsyncSession
    ) -> List[Project]:
        # First check if user is member of organization
        if organization_id:
            org_role = await self.get_user_role_in_organization(
                user_id, organization_id, db
            )
            
            if org_role:
                # Organization members can see all projects in the org
                stmt = select(Project).where(
                    Project.organization_id == organization_id
                ).options(
                    selectinload(Project.members)
                )
            else:
                stmt = select(Project).join(ProjectMember).where(
                    and_(
                        ProjectMember.user_id == user_id,
                        Project.organization_id == organization_id
                    )
                ).options(
                    selectinload(Project.members)
                )
        else:
            stmt = select(Project).join(
                ProjectMember, 
                ProjectMember.project_id == Project.id
            ).where(
                ProjectMember.user_id == user_id
            ).union(
                select(Project).join(
                    OrganizationMember,
                    OrganizationMember.organization_id == Project.organization_id
                ).where(
                    OrganizationMember.user_id == user_id
                )
            ).options(
                selectinload(Project.members)
            )
        
        result = await db.execute(stmt)
        return result.scalars().all()
    
    def can_perform_action(
        self,
        user_role: str,
        action: str
    ) -> bool:
        allowed_permissions = self.PERMISSIONS.get(user_role, [])
        return action in allowed_permissions
    
    def get_role_permissions(self, role: str) -> List[str]:
        return self.PERMISSIONS.get(role, [])
    
    def is_role_higher(self, role1: str, role2: str) -> bool:
        return self.ROLE_HIERARCHY.get(role1, 0) > self.ROLE_HIERARCHY.get(role2, 0)
    
    def is_role_equal_or_higher(self, role1: str, role2: str) -> bool:
        return self.ROLE_HIERARCHY.get(role1, 0) >= self.ROLE_HIERARCHY.get(role2, 0)


# Singleton instance
permission_service = PermissionService()