"""
Pytest fixtures for test setup.
Provides reusable test data including users, organizations, projects, and auth mocking.
Uses testcontainers to spin up a PostgreSQL database for testing.
"""

# Set environment variables BEFORE importing app modules
import os
from typing import TypedDict

from app.core.auth import get_current_token_data
from app.main import app
from app.models.organization_model import (
    Organization,
    OrganizationMember,
    OrganizationRole,
    ProjectMember,
    ProjectRole,
)
from app.models.project_model import Project
from app.models.user_model import User
from app.schemas.auth_schema import TokenData

os.environ['PYTEST_RUNNING'] = 'true'
# Set a placeholder DATABASE_URL that will be overridden by the postgres_container fixture
# This prevents db.py from failing when it gets imported during test collection
os.environ.setdefault('DATABASE_URL', 'postgresql+asyncpg://test:test@localhost/test')

import time
import uuid

import pytest
import pytest_asyncio

# Import after setting environment variables
from app.db import get_db
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from testcontainers.postgres import PostgresContainer


@pytest.fixture(scope='session', autouse=True)
def postgres_container():
    """
    Start a PostgreSQL container for the test session.
    Automatically stops after tests complete.
    Sets DATABASE_URL environment variable for the app to use.
    Runs alembic migrations to set up the database schema.
    """
    import subprocess

    container = PostgresContainer('postgres:15-alpine')
    container.start()

    # Get the connection URL and set it as an environment variable
    db_url = container.get_connection_url()
    # Replace psycopg2 driver with asyncpg for async support
    db_url = db_url.replace('psycopg2', 'asyncpg')

    # Run alembic migrations using the synchronous URL (for alembic)
    sync_db_url = container.get_connection_url()
    os.environ['DATABASE_URL'] = sync_db_url

    try:
        # Run alembic upgrade head to set up the database schema
        subprocess.run(
            ['alembic', 'upgrade', 'head'],
            cwd='/home/rohan/dev/reflect/api/server',
            check=True,
            capture_output=True,
            text=True,
        )
        print('✓ Alembic migrations completed successfully')
    except subprocess.CalledProcessError as e:
        print(f'✗ Alembic migration failed: {e.stderr}')
        raise

    # Store the async URL for later use
    os.environ['DATABASE_URL'] = db_url

    yield container

    # Cleanup
    container.stop()


@pytest_asyncio.fixture(scope='function')
async def sessionmaker_fixture(postgres_container):
    """Function-scoped sessionmaker to avoid event loop conflicts."""
    from app.db import set_engine_and_session_maker
    
    db_url = os.environ['DATABASE_URL']
    
    # Create new engine and sessionmaker for this test
    engine = create_async_engine(
        db_url,
        future=True,
        pool_pre_ping=True,
        echo=False,
    )

    sessionmaker = async_sessionmaker(
        bind=engine,
        class_=AsyncSession,
        expire_on_commit=False,
        autocommit=False,
        autoflush=False,
        future=True,
    )
    
    # Set the global session maker for services that need it
    set_engine_and_session_maker(engine, sessionmaker)
    
    yield sessionmaker
    
    # Cleanup
    await engine.dispose()


@pytest_asyncio.fixture(scope='function')
async def test_user(sessionmaker_fixture) -> User:
    """Create a test user for each test."""
    async with sessionmaker_fixture() as session:
        user = User(
            id=uuid.uuid4(),
            email=f'testuser-{uuid.uuid4().hex[:8]}@example.com',
            name='Test User',
            email_verified_at=None,
        )
        session.add(user)
        await session.commit()
        await session.refresh(user)
        return user


@pytest_asyncio.fixture(scope='function')
async def admin_user(sessionmaker_fixture) -> User:
    """Create an admin test user for each test."""
    async with sessionmaker_fixture() as session:
        user = User(
            id=uuid.uuid4(),
            email=f'admin-{uuid.uuid4().hex[:8]}@example.com',
            name='Admin User',
            email_verified_at=None,
        )
        session.add(user)
        await session.commit()
        await session.refresh(user)
        return user


@pytest_asyncio.fixture(scope='function')
async def test_organization(sessionmaker_fixture, admin_user: User) -> Organization:
    """Create a test organization for each test."""
    async with sessionmaker_fixture() as session:
        org = Organization(
            name='Test Organization',
            slug=f'test-org-{uuid.uuid4().hex[:8]}',
            created_by=admin_user.id,
        )
        session.add(org)
        await session.commit()
        await session.refresh(org)
        return org


@pytest_asyncio.fixture(scope='function')
async def test_organization_membership(
    sessionmaker_fixture, test_organization: Organization, admin_user: User
) -> OrganizationMember:
    """Create organization membership for admin user for each test."""
    async with sessionmaker_fixture() as session:
        membership = OrganizationMember(
            organization_id=test_organization.id,
            user_id=admin_user.id,
            role=OrganizationRole.ADMIN,
        )
        session.add(membership)
        await session.commit()
        await session.refresh(membership)
        return membership


@pytest_asyncio.fixture(scope='function')
async def test_project(
    sessionmaker_fixture, test_organization: Organization
) -> Project:
    """Create a test project for each test."""
    async with sessionmaker_fixture() as session:
        project = Project(
            organization_id=test_organization.id,
            name='Test Project',
            display_name='Test Project',
            slug=f'test-project-{uuid.uuid4().hex[:8]}',
            description='A test project',
        )
        session.add(project)
        await session.commit()
        await session.refresh(project)
        return project

@pytest_asyncio.fixture(scope='function')
async def test_project_membership(
    sessionmaker_fixture, test_project: Project, admin_user: User
) -> ProjectMember:
    """Create project membership for admin user for each test."""
    async with sessionmaker_fixture() as session:
        membership = ProjectMember(
            project_id=test_project.id,
            user_id=admin_user.id,
            role=ProjectRole.ADMIN,
        )
        session.add(membership)
        await session.commit()
        await session.refresh(membership)
        return membership


@pytest.fixture
def mock_auth_token(admin_user: User) -> TokenData:
    """Create a mock auth token for the admin user."""
    now = int(time.time())
    return TokenData(
        sub=str(admin_user.id),
        email=admin_user.email,
        role='Admin',
        exp=now + 3600,
        iat=now,
        iss='test-issuer',
        aud='test-audience',
    )


@pytest.fixture(autouse=True)
def override_auth_dependency(mock_auth_token: TokenData, sessionmaker_fixture, admin_user: User):
    """Override the auth dependency to use mock token and database."""
    from app.core.auth import get_current_user
    
    async def get_db_override():
        """
        Override for get_db dependency that creates a new session each time.
        This ensures each API request gets its own session.
        """
        async with sessionmaker_fixture() as session:
            try:
                yield session
                await session.commit()
            except Exception:
                await session.rollback()
                raise
            finally:
                await session.close()
    
    async def get_current_user_override():
        """Return the admin user for all authenticated requests."""
        return admin_user
    
    app.dependency_overrides[get_current_token_data] = lambda: mock_auth_token
    app.dependency_overrides[get_current_user] = get_current_user_override
    # Override get_db - the function itself, not a lambda calling it
    app.dependency_overrides[get_db] = get_db_override
    yield
    app.dependency_overrides = {}


class TestSetup(TypedDict):
    user: User
    organization: Organization
    organization_membership: OrganizationMember
    project: Project
    project_membership: ProjectMember

@pytest.fixture
def test_setup(
    admin_user: User,
    test_organization: Organization,
    test_organization_membership: OrganizationMember,
    test_project: Project,
    test_project_membership: ProjectMember,
) -> TestSetup:
    """
    Complete test setup with all dependencies.
    Returns a dict with all test entities for easy access.
    Data is function-scoped, created fresh for each test to avoid conflicts.
    """
    return {
        'user': admin_user,
        'organization': test_organization,
        'organization_membership': test_organization_membership,
        'project': test_project,
        'project_membership': test_project_membership,
    }