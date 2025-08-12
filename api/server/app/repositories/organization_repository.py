from typing import Optional, List
from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_
from sqlalchemy.orm import selectinload

from app.models.organization_model import Organization, OrganizationMember, OrganizationRole
from app.models.user_model import User
from app.repositories.base_repository import BaseRepository


class OrganizationRepository(BaseRepository[Organization]):
    def __init__(self):
        super().__init__(Organization)

    async def get_by_slug(self, db: AsyncSession, slug: str) -> Optional[Organization]:
        stmt = select(self.model).where(self.model.slug == slug)
        result = await db.execute(stmt)
        return result.scalar_one_or_none()

    async def get_with_members(self, db: AsyncSession, org_id: UUID) -> Optional[Organization]:
        stmt = (
            select(self.model)
            .options(selectinload(self.model.members).selectinload(OrganizationMember.user))
            .where(self.model.id == org_id)
        )
        result = await db.execute(stmt)
        return result.scalar_one_or_none()

    async def get_user_organizations(
        self, db: AsyncSession, user_id: UUID, skip: int = 0, limit: int = 100
    ) -> List[Organization]:
        stmt = (
            select(self.model)
            .join(OrganizationMember)
            .where(OrganizationMember.user_id == user_id)
            .offset(skip)
            .limit(limit)
            .order_by(self.model.created_at.desc())
        )
        result = await db.execute(stmt)
        return list(result.scalars().all())

    async def count_user_organizations(self, db: AsyncSession, user_id: UUID) -> int:
        stmt = (
            select(func.count(self.model.id))
            .join(OrganizationMember)
            .where(OrganizationMember.user_id == user_id)
        )
        result = await db.execute(stmt)
        return result.scalar() or 0

    async def check_user_access(
        self, db: AsyncSession, org_id: UUID, user_id: UUID
    ) -> Optional[OrganizationMember]:
        stmt = select(OrganizationMember).where(
            and_(
                OrganizationMember.organization_id == org_id,
                OrganizationMember.user_id == user_id
            )
        ).options(selectinload(OrganizationMember.user))
        result = await db.execute(stmt)
        return result.scalar_one_or_none()

    async def get_with_counts(self, db: AsyncSession, org_id: UUID) -> Optional[Organization]:
        from app.models.project_model import Project
        
        stmt = (
            select(
                self.model,
                func.count(OrganizationMember.id).label('members_count'),
                func.count(Project.id).label('projects_count')
            )
            .outerjoin(OrganizationMember, self.model.id == OrganizationMember.organization_id)
            .outerjoin(Project, self.model.id == Project.organization_id)
            .where(self.model.id == org_id)
            .group_by(self.model.id)
        )
        result = await db.execute(stmt)
        row = result.first()
        if row:
            org = row[0]
            org.members_count = row[1]
            org.projects_count = row[2]
            return org
        return None


class OrganizationMemberRepository(BaseRepository[OrganizationMember]):
    def __init__(self):
        super().__init__(OrganizationMember)

    async def get_by_org_and_user(
        self, db: AsyncSession, org_id: UUID, user_id: UUID
    ) -> Optional[OrganizationMember]:
        stmt = select(self.model).where(
            and_(
                self.model.organization_id == org_id,
                self.model.user_id == user_id
            )
        ).options(selectinload(self.model.user))
        result = await db.execute(stmt)
        return result.scalar_one_or_none()

    async def get_org_members(
        self, db: AsyncSession, org_id: UUID, skip: int = 0, limit: int = 100
    ) -> List[OrganizationMember]:
        stmt = (
            select(self.model)
            .options(selectinload(self.model.user))
            .where(self.model.organization_id == org_id)
            .offset(skip)
            .limit(limit)
            .order_by(self.model.created_at.desc())
        )
        result = await db.execute(stmt)
        return list(result.scalars().all())

    async def count_org_members(self, db: AsyncSession, org_id: UUID) -> int:
        stmt = select(func.count(self.model.id)).where(
            self.model.organization_id == org_id
        )
        result = await db.execute(stmt)
        return result.scalar() or 0

    async def add_member(
        self, db: AsyncSession, org_id: UUID, user_id: UUID, role: OrganizationRole
    ) -> OrganizationMember:
        db_obj = self.model(
            organization_id=org_id,
            user_id=user_id,
            role=role
        )
        db.add(db_obj)
        await db.commit()
        await db.refresh(db_obj)
        return db_obj

    async def update_member_role(
        self, db: AsyncSession, org_id: UUID, user_id: UUID, role: OrganizationRole
    ) -> Optional[OrganizationMember]:
        member = await self.get_by_org_and_user(db, org_id, user_id)
        if member:
            member.role = role
            await db.commit()
            await db.refresh(member)
        return member

    async def remove_member(
        self, db: AsyncSession, org_id: UUID, user_id: UUID
    ) -> bool:
        stmt = select(self.model).where(
            and_(
                self.model.organization_id == org_id,
                self.model.user_id == user_id
            )
        )
        result = await db.execute(stmt)
        member = result.scalar_one_or_none()
        
        if member:
            await db.delete(member)
            await db.commit()
            return True
        return False


organization_repository = OrganizationRepository()
organization_member_repository = OrganizationMemberRepository()