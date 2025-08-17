from typing import Optional
from datetime import datetime, timezone
import uuid
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import joinedload

from app.core.logging import get_logger
from app.models.user_model import User
from app.models.onboarding_model import UserOnboarding
from app.models.organization_model import Organization, OrganizationMember
from app.schemas.onboarding_schema import (
    OnboardingStartRequest,
    OnboardingStartResponse,
    OnboardingStatusResponse,
    OnboardingUpdateRequest,
    OnboardingCompleteResponse,
    OnboardingSkipResponse,
)

logger = get_logger(__name__)


class OnboardingService:
    async def start_onboarding(
        self, user_id: uuid.UUID, request: OnboardingStartRequest, db: AsyncSession
    ) -> OnboardingStartResponse:
        try:
            user = await db.get(User, user_id)
            if not user:
                raise ValueError(f"User {user_id} not found")

            existing_onboarding = await db.execute(
                select(UserOnboarding).where(UserOnboarding.user_id == user_id)
            )
            onboarding = existing_onboarding.scalar_one_or_none()

            if not onboarding:
                onboarding = UserOnboarding(
                    user_id=user_id,
                    has_created_project=False,
                    has_created_widget=False,
                    has_received_first_feedback=False,
                )
                db.add(onboarding)

            user.user_metadata = user.user_metadata or {}
            user.user_metadata.update({
                "user_type": request.user_type,
                "onboarding_started_at": datetime.now(timezone.utc).isoformat(),
                "current_onboarding_step": "welcome",
                "steps_completed": {},
            })
            
            if request.referral_source:
                user.user_metadata["referral_source"] = request.referral_source

            if not user.first_login_at:
                user.first_login_at = datetime.now(timezone.utc)

            await db.commit()
            await db.refresh(onboarding)

            return OnboardingStartResponse(
                user_id=user_id,
                onboarding_id=onboarding.id,
                current_step="welcome",
                user_type=request.user_type,
                is_completed=False,
                created_at=onboarding.created_at,
                updated_at=onboarding.updated_at,
            )

        except Exception as e:
            logger.error(f"Failed to start onboarding for user {user_id}: {str(e)}")
            await db.rollback()
            raise

    async def get_onboarding_status(
        self, user_id: uuid.UUID, db: AsyncSession
    ) -> OnboardingStatusResponse:
        try:
            stmt = select(User).where(User.id == user_id).options(joinedload(User.onboarding))
            result = await db.execute(stmt)
            user = result.scalar_one_or_none()
            if not user:
                raise ValueError(f"User {user_id} not found")

            org_count = await db.execute(
                select(OrganizationMember).where(OrganizationMember.user_id == user_id)
            )
            has_organization = len(org_count.scalars().all()) > 0

            metadata = user.user_metadata or {}
            onboarding = user.onboarding

            steps_completed = metadata.get("steps_completed", {})
            total_steps = 5
            completed_count = len([s for s in steps_completed.values() if s])
            
            if metadata.get("onboarding_completed"):
                completion_percentage = 100
            else:
                completion_percentage = int((completed_count / total_steps) * 100)

            return OnboardingStatusResponse(
                user_id=user_id,
                onboarding_completed=metadata.get("onboarding_completed", False),
                user_type=metadata.get("user_type"),
                current_step=metadata.get("current_onboarding_step"),
                has_created_project=onboarding.has_created_project if onboarding else False,
                has_created_organization=has_organization,
                completion_percentage=completion_percentage,
                steps_completed=steps_completed,
                created_at=onboarding.created_at if onboarding else None,
                updated_at=onboarding.updated_at if onboarding else None,
            )

        except Exception as e:
            logger.error(f"Failed to get onboarding status for user {user_id}: {str(e)}")
            raise

    async def update_onboarding(
        self, user_id: uuid.UUID, request: OnboardingUpdateRequest, db: AsyncSession
    ) -> OnboardingStatusResponse:
        try:
            stmt = select(User).where(User.id == user_id).options(joinedload(User.onboarding))
            result = await db.execute(stmt)
            user = result.scalar_one_or_none()
            if not user:
                raise ValueError(f"User {user_id} not found")

            if not user.onboarding:
                user.onboarding = UserOnboarding(
                    user_id=user_id,
                    has_created_project=False,
                    has_created_widget=False,
                    has_received_first_feedback=False,
                )
                db.add(user.onboarding)
                await db.flush()  # Ensure the onboarding record is persisted before accessing it

            if request.has_created_project is not None:
                user.onboarding.has_created_project = request.has_created_project
            if request.company_size is not None:
                user.onboarding.company_size = request.company_size
            if request.use_case is not None:
                user.onboarding.use_case = request.use_case

            user.user_metadata = user.user_metadata or {}
            
            if request.current_step:
                user.user_metadata["current_onboarding_step"] = request.current_step
            
            if request.steps_completed:
                current_steps = user.user_metadata.get("steps_completed", {})
                current_steps.update(request.steps_completed)
                user.user_metadata["steps_completed"] = current_steps
            
            if request.has_created_organization is not None:
                user.user_metadata["has_created_organization"] = request.has_created_organization
            
            if request.metadata:
                user.user_metadata.update(request.metadata)

            # Store values we need before commit to avoid lazy loading issues
            onboarding_has_created_project = user.onboarding.has_created_project if user.onboarding else False
            onboarding_created_at = user.onboarding.created_at if user.onboarding else None
            onboarding_updated_at = user.onboarding.updated_at if user.onboarding else None

            await db.commit()
            await db.refresh(user)

            org_count = await db.execute(
                select(OrganizationMember).where(OrganizationMember.user_id == user_id)
            )
            has_organization = len(org_count.scalars().all()) > 0

            metadata = user.user_metadata or {}
            steps_completed = metadata.get("steps_completed", {})
            total_steps = 5
            completed_count = len([s for s in steps_completed.values() if s])
            
            if metadata.get("onboarding_completed"):
                completion_percentage = 100
            else:
                completion_percentage = int((completed_count / total_steps) * 100)

            return OnboardingStatusResponse(
                user_id=user_id,
                onboarding_completed=metadata.get("onboarding_completed", False),
                user_type=metadata.get("user_type"),
                current_step=metadata.get("current_onboarding_step"),
                steps_completed=steps_completed,
                completion_percentage=completion_percentage,
                has_created_organization=has_organization,
                has_created_project=onboarding_has_created_project,
                created_at=onboarding_created_at,
                updated_at=onboarding_updated_at,
            )

        except Exception as e:
            logger.error(f"Failed to update onboarding for user {user_id}: {str(e)}", exc_info=True)
            await db.rollback()
            raise

    async def complete_onboarding(
        self, user_id: uuid.UUID, feedback: Optional[str], db: AsyncSession
    ) -> OnboardingCompleteResponse:
        try:
            user = await db.get(User, user_id)
            if not user:
                raise ValueError(f"User {user_id} not found")

            user.user_metadata = user.user_metadata or {}
            
            started_at = user.user_metadata.get("onboarding_started_at")
            duration_minutes = None
            if started_at:
                start_time = datetime.fromisoformat(started_at)
                duration = datetime.now(timezone.utc) - start_time
                duration_minutes = duration.total_seconds() / 60

            user.user_metadata.update({
                "onboarding_completed": True,
                "onboarding_completed_at": datetime.now(timezone.utc).isoformat(),
                "onboarding_feedback": feedback,
                "onboarding_duration_minutes": duration_minutes,
            })

            await db.commit()

            return OnboardingCompleteResponse(
                success=True,
                message="Onboarding completed successfully",
                user_id=user_id,
                completed_at=datetime.now(timezone.utc),
                total_duration_minutes=duration_minutes,
            )

        except Exception as e:
            logger.error(f"Failed to complete onboarding for user {user_id}: {str(e)}")
            await db.rollback()
            raise

    async def skip_onboarding(
        self, user_id: uuid.UUID, db: AsyncSession
    ) -> OnboardingSkipResponse:
        try:
            user = await db.get(User, user_id)
            if not user:
                raise ValueError(f"User {user_id} not found")

            user.user_metadata = user.user_metadata or {}
            user.user_metadata.update({
                "onboarding_completed": True,
                "onboarding_skipped": True,
                "onboarding_skipped_at": datetime.now(timezone.utc).isoformat(),
            })

            await db.commit()

            return OnboardingSkipResponse(
                success=True,
                message="Onboarding skipped",
                user_id=user_id,
                skipped_at=datetime.now(timezone.utc),
            )

        except Exception as e:
            logger.error(f"Failed to skip onboarding for user {user_id}: {str(e)}")
            await db.rollback()
            raise

    async def auto_create_organization(
        self, user_id: uuid.UUID, db: AsyncSession
    ) -> Organization:
        try:
            user = await db.get(User, user_id)
            if not user:
                raise ValueError(f"User {user_id} not found")

            org_name = f"{user.name or user.email.split('@')[0]}'s Organization"
            org_slug = org_name.lower().replace("'", "").replace(" ", "-")
            
            timestamp = datetime.now(timezone.utc).strftime("%Y%m%d%H%M%S")
            org_slug = f"{org_slug}-{timestamp}"

            organization = Organization(
                name=org_name,
                slug=org_slug,
                description="Personal organization",
                settings={
                    "auto_created": True,
                    "created_for": "solo_developer",
                },
                created_by=user_id,
            )
            db.add(organization)
            await db.flush()

            member = OrganizationMember(
                organization_id=organization.id,
                user_id=user_id,
                role="owner",
            )
            db.add(member)

            user.user_metadata = user.user_metadata or {}
            user.user_metadata["has_created_organization"] = True
            user.user_metadata["primary_organization_id"] = str(organization.id)

            await db.commit()
            await db.refresh(organization)

            logger.info(f"Auto-created organization {organization.id} for user {user_id}")
            return organization

        except Exception as e:
            logger.error(f"Failed to auto-create organization for user {user_id}: {str(e)}")
            await db.rollback()
            raise

    async def check_first_time_user(
        self, user_id: uuid.UUID, db: AsyncSession
    ) -> bool:
        try:
            user = await db.get(User, user_id)
            if not user:
                return True

            metadata = user.user_metadata or {}
            if metadata.get("onboarding_completed") or metadata.get("onboarding_skipped"):
                return False

            org_result = await db.execute(
                select(OrganizationMember).where(OrganizationMember.user_id == user_id)
            )
            has_organizations = len(org_result.scalars().all()) > 0

            return not has_organizations

        except Exception as e:
            logger.error(f"Failed to check first-time user status for {user_id}: {str(e)}")
            return True


onboarding_service = OnboardingService()