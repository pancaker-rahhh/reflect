from httpx import AsyncClient
import pytest
from unittest.mock import patch, AsyncMock
from sqlalchemy import select
import uuid

from app.main import app
from app.models.invitation import Invitation, PendingMember, InvitationStatus
from app.models.organization_model import ProjectMember


@pytest.mark.asyncio
async def test_invite_project_member(test_setup, sessionmaker_fixture) -> None:
    """
    Test inviting a new member to a project.
    - Mocks SES service to prevent actual emails
    - Verifies invitation and pending member are created in DB
    - Checks response structure
    """
    project_id = test_setup["project"].id
    invite_email = "newmember@example.com"
    
    # Mock SES service
    with patch('app.services.ses_service.ses_service.send_email', new_callable=AsyncMock) as mock_ses:
        mock_ses.return_value = True
        
        async with AsyncClient(app=app, base_url='http://test') as ac:
            response = await ac.post(
                f"/api/v1/projects/{project_id}/members",
                json={
                    "email": invite_email,
                    "role": "viewer"
                }
            )
        
        # Assert response
        assert response.status_code == 201
        data = response.json()
        assert data["user_email"] == invite_email
        assert data["role"] == "viewer"
        assert data["project_id"] == str(project_id)
        assert data["user_id"] is None  # Pending member has no user_id yet
        
        # Verify SES was called
        mock_ses.assert_called_once()
        call_args = mock_ses.call_args
        assert call_args.kwargs["to_email"] == invite_email
        
    # Verify invitation was created in database
    async with sessionmaker_fixture() as session:
        stmt = select(Invitation).where(Invitation.email == invite_email)
        result = await session.execute(stmt)
        invitation = result.scalar_one_or_none()
        
        assert invitation is not None
        assert invitation.email == invite_email
        assert invitation.project_id == project_id
        assert invitation.project_role == "viewer"
        assert invitation.organization_id == test_setup["organization"].id
        assert invitation.status == InvitationStatus.PENDING
        assert invitation.invited_by == test_setup["user"].id
        assert invitation.token is not None
        
    # Verify pending member was created in database
    async with sessionmaker_fixture() as session:
        stmt = select(PendingMember).where(PendingMember.email == invite_email)
        result = await session.execute(stmt)
        pending_member = result.scalar_one_or_none()
        
        assert pending_member is not None
        assert pending_member.email == invite_email
        assert pending_member.project_id == project_id
        assert pending_member.role == "member"  # Organization role, not project role
        assert pending_member.organization_id == test_setup["organization"].id
        assert pending_member.added_by == test_setup["user"].id


@pytest.mark.asyncio
async def test_accept_project_invitation(test_setup, sessionmaker_fixture) -> None:
    """
    Test accepting a project invitation.
    - Creates an invitation first
    - Accepts it with new user data
    - Verifies user, organization member, and project member are created
    - Checks invitation status is updated to accepted
    """
    project_id = test_setup["project"].id
    invite_email = "accepter@example.com"
    
    # Step 1: Create invitation
    with patch('app.services.ses_service.ses_service.send_email', new_callable=AsyncMock) as mock_ses:
        mock_ses.return_value = True
        
        async with AsyncClient(app=app, base_url='http://test') as ac:
            response = await ac.post(
                f"/api/v1/projects/{project_id}/members",
                json={
                    "email": invite_email,
                    "role": "editor"
                }
            )
        
        assert response.status_code == 201
    
    # Get the invitation token from database
    invitation_token = None
    async with sessionmaker_fixture() as session:
        stmt = select(Invitation).where(Invitation.email == invite_email)
        result = await session.execute(stmt)
        invitation = result.scalar_one_or_none()
        assert invitation is not None
        invitation_token = invitation.token
    
    # Step 2: Accept invitation
    # Mock Supabase service for user creation
    mock_supabase_user = {
        'id': str(uuid.uuid4()),
        'email': invite_email,
        'created_at': '2025-01-01T00:00:00Z'
    }
    
    with patch('app.services.supabase_service.supabase_service.get_user_by_email', new_callable=AsyncMock) as mock_get_user, \
         patch('app.services.supabase_service.supabase_service.create_user', new_callable=AsyncMock) as mock_create_user:
        
        mock_get_user.return_value = None  # User doesn't exist yet
        mock_create_user.return_value = mock_supabase_user  # Return mock user
        
        async with AsyncClient(app=app, base_url='http://test') as ac:
            response = await ac.post(
                "/api/v1/invitations/accept",
                json={
                    "token": invitation_token,
                    "user_data": {
                        "name": "New Member",
                        "password": "SecurePass123!",
                        "phone": "+1234567890"
                    }
                }
            )
        
        # Verify Supabase service was called
        mock_get_user.assert_called_once_with(invite_email)
        mock_create_user.assert_called_once()
    
    # Assert response
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["project_id"] == str(project_id)
    assert data["organization_id"] == str(test_setup["organization"].id)
    assert data["role"] == "member"  # Organization role
    # Note: access_token may be None in test environment due to auth mocking
    assert "user_id" in data
    
    # Verify invitation status is updated
    async with sessionmaker_fixture() as session:
        stmt = select(Invitation).where(Invitation.token == invitation_token)
        result = await session.execute(stmt)
        invitation = result.scalar_one_or_none()
        
        assert invitation is not None
        assert invitation.status == InvitationStatus.ACCEPTED
        assert invitation.accepted_at is not None
        assert invitation.accepted_by is not None
    
    # Verify user was created
    from app.models.user_model import User
    async with sessionmaker_fixture() as session:
        stmt = select(User).where(User.email == invite_email)
        result = await session.execute(stmt)
        user = result.scalar_one_or_none()
        
        assert user is not None
        assert user.name == "New Member"
        assert user.email == invite_email
    
    # Verify organization membership was created
    from app.models.organization_model import OrganizationMember
    async with sessionmaker_fixture() as session:
        stmt = select(OrganizationMember).where(
            OrganizationMember.user_id == user.id,
            OrganizationMember.organization_id == test_setup["organization"].id
        )
        result = await session.execute(stmt)
        org_member = result.scalar_one_or_none()
        
        assert org_member is not None
        assert org_member.role.value == "member"
    
    # Verify project membership was created
    async with sessionmaker_fixture() as session:
        stmt = select(ProjectMember).where(
            ProjectMember.user_id == user.id,
            ProjectMember.project_id == project_id
        )
        result = await session.execute(stmt)
        project_member = result.scalar_one_or_none()
        
        assert project_member is not None
        assert project_member.role.value == "editor"
    
    # Verify pending member was removed
    async with sessionmaker_fixture() as session:
        stmt = select(PendingMember).where(PendingMember.email == invite_email)
        result = await session.execute(stmt)
        pending_member = result.scalar_one_or_none()
        
        # Pending member should be cleaned up after acceptance
        assert pending_member is None


@pytest.mark.asyncio
async def test_invite_existing_org_member_to_project(test_setup, sessionmaker_fixture) -> None:
    """
    Test inviting an existing organization member to a project.
    Should directly add them without creating an invitation.
    """
    from app.models.user_model import User
    from app.models.organization_model import OrganizationMember, OrganizationRole
    
    # Create an existing user who is already in the organization
    existing_user_email = "existing@example.com"
    existing_user_id = uuid.uuid4()
    
    async with sessionmaker_fixture() as session:
        existing_user = User(
            id=existing_user_id,
            email=existing_user_email,
            name="Existing User",
        )
        session.add(existing_user)
        await session.commit()
        await session.refresh(existing_user)
        
        # Add them to the organization
        org_membership = OrganizationMember(
            organization_id=test_setup["organization"].id,
            user_id=existing_user.id,
            role=OrganizationRole.MEMBER
        )
        session.add(org_membership)
        await session.commit()
    
    # Invite them to the project
    project_id = test_setup["project"].id
    async with AsyncClient(app=app, base_url='http://test') as ac:
        response = await ac.post(
            f"/api/v1/projects/{project_id}/members",
            json={
                "email": existing_user_email,
                "role": "editor"
            }
        )
    
    # Should succeed and add directly
    assert response.status_code == 201
    data = response.json()
    assert data["user_email"] == existing_user_email
    assert data["role"] == "editor"
    assert data["user_id"] == str(existing_user.id)  # Has user_id because they're added directly
    
    # Verify project membership was created
    async with sessionmaker_fixture() as session:
        stmt = select(ProjectMember).where(
            ProjectMember.user_id == existing_user.id,
            ProjectMember.project_id == project_id
        )
        result = await session.execute(stmt)
        project_member = result.scalar_one_or_none()
        
        assert project_member is not None
        assert project_member.role.value == "editor"
    
    # Verify NO invitation was created (since they're already in org)
    async with sessionmaker_fixture() as session:
        stmt = select(Invitation).where(Invitation.email == existing_user_email)
        result = await session.execute(stmt)
        invitation = result.scalar_one_or_none()
        
        assert invitation is None
