import os

os.environ['ENV'] = 'test'
os.environ['DATABASE_URL'] = 'sqlite+aiosqlite:///:memory:'
os.environ['ALEMBIC_MIGRATION'] = '1'
os.environ['SUPABASE_JWT_SECRET'] = 'test-jwt-secret-key-for-testing-only'
os.environ['DODO_API_KEY'] = 'test_dodo_key'
os.environ['DODO_WEBHOOK_SECRET'] = 'test_webhook_secret'
os.environ['DODO_RETURN_URL'] = 'http://localhost:5173/payment/return'
os.environ['DODO_PRODUCT_ID_PRO_MONTHLY'] = 'test_prod_monthly_123'
os.environ['DODO_PRODUCT_ID_PRO_YEARLY'] = 'test_prod_yearly_123'

import pytest  # noqa: E402
import asyncio  # noqa: E402
from typing import AsyncGenerator  # noqa: E402
from unittest.mock import Mock, patch  # noqa: E402
from uuid import UUID, uuid4  # noqa: E402
from datetime import datetime, timezone  # noqa: E402
import jwt  # noqa: E402
import base64  # noqa: E402
import hmac  # noqa: E402
import hashlib  # noqa: E402

from sqlalchemy.ext.asyncio import (  # noqa: E402
    AsyncSession,
    create_async_engine,
    async_sessionmaker,
    AsyncEngine,
)
from sqlalchemy.pool import StaticPool  # noqa: E402
from sqlalchemy import select  # noqa: E402
from httpx import AsyncClient  # noqa: E402
from fastapi.testclient import TestClient  # noqa: E402

from app.core.settings import Settings  # noqa: E402
from app.db import get_db, Base  # noqa: E402
from app.models.user_model import User  # noqa: E402
from app.models.organization_model import (  # noqa: E402
    Organization,
    SubscriptionPlanEnum,
    PaymentStatusEnum,
)
from app.models.project_model import Project  # noqa: E402
from app.models.widget_model import Widget, WidgetType, WidgetStatus  # noqa: E402

from app.main import create_application  # noqa: E402

TEST_DATABASE_URL = 'sqlite+aiosqlite:///:memory:'
_test_engine: AsyncEngine | None = None
_AsyncSessionLocal: async_sessionmaker | None = None


@pytest.fixture(scope='session')
def event_loop():
    policy = asyncio.get_event_loop_policy()
    loop = policy.new_event_loop()
    yield loop
    loop.close()


@pytest.fixture(scope='session', autouse=True)
async def setup_test_db():
    global _test_engine, _AsyncSessionLocal
    _test_engine = create_async_engine(
        TEST_DATABASE_URL,
        echo=False,
        poolclass=StaticPool,
        connect_args={'check_same_thread': False},
    )
    async with _test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    _AsyncSessionLocal = async_sessionmaker(
        bind=_test_engine,
        class_=AsyncSession,
        expire_on_commit=False,
    )
    yield
    async with _test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
    await _test_engine.dispose()


@pytest.fixture
async def async_db_session(setup_test_db) -> AsyncGenerator[AsyncSession, None]:
    async with _AsyncSessionLocal() as session:
        transaction = await session.begin()
        try:
            yield session
        finally:
            if transaction.is_active:
                await transaction.rollback()
            await session.close()


@pytest.fixture
def async_db(async_db_session, test_user_in_db):
    async def override_get_db():
        try:
            yield async_db_session
            await async_db_session.commit()
        except Exception:
            await async_db_session.rollback()
            raise

    return override_get_db


@pytest.fixture
def app(async_db):
    with patch('app.core.lifespan.engine', None), patch(
        'app.core.lifespan.AsyncSessionLocal', None
    ):
        app_instance = create_application()
        app_instance.dependency_overrides[get_db] = async_db
        return app_instance


@pytest.fixture
def test_client(app):
    return TestClient(app)


@pytest.fixture
async def async_client(app) -> AsyncGenerator[AsyncClient, None]:
    async with AsyncClient(app=app, base_url='http://test') as client:
        yield client


@pytest.fixture
def test_user_id() -> UUID:
    return uuid4()


@pytest.fixture
def test_user(test_user_id) -> User:
    unique_id = str(uuid4())[:8]
    return User(
        id=test_user_id,
        email=f'test_{unique_id}@example.com',
        name='Test User',
        created_at=datetime.now(timezone.utc),
        updated_at=datetime.now(timezone.utc),
    )


@pytest.fixture
async def test_user_in_db(async_db_session, test_user) -> User:
    stmt = select(User).where(User.email == test_user.email)
    result = await async_db_session.execute(stmt)
    existing_user = result.scalar_one_or_none()

    if existing_user:
        return existing_user

    stmt = select(User).where(User.id == test_user.id)
    result = await async_db_session.execute(stmt)
    existing_user = result.scalar_one_or_none()

    if not existing_user:
        async_db_session.add(test_user)
        try:
            await async_db_session.commit()
            await async_db_session.refresh(test_user)
            return test_user
        except Exception:
            await async_db_session.rollback()
            stmt = select(User).where(User.email == test_user.email)
            result = await async_db_session.execute(stmt)
            existing_user = result.scalar_one_or_none()
            if existing_user:
                return existing_user
            raise

    return existing_user


@pytest.fixture
def test_settings() -> Settings:
    return Settings(
        ENV='test',
        DATABASE_URL=TEST_DATABASE_URL,
        SUPABASE_JWT_SECRET='test-jwt-secret-key-for-testing-only',
        DODO_API_KEY='test_dodo_key',
        DODO_WEBHOOK_SECRET='test_webhook_secret',
        DODO_RETURN_URL='http://localhost:5173/payment/return',
        DODO_PRODUCT_ID_PRO_MONTHLY='test_prod_monthly_123',
        DODO_PRODUCT_ID_PRO_YEARLY='test_prod_yearly_123',
    )


@pytest.fixture
def test_user_token(test_user_id, test_settings) -> str:
    now = datetime.now(timezone.utc)
    payload = {
        'sub': str(test_user_id),
        'email': 'test@example.com',
        'aud': 'authenticated',
        'exp': int(now.timestamp()) + 3600,
        'iat': int(now.timestamp()),
        'iss': 'https://test.reflect.app',
    }
    return jwt.encode(payload, test_settings.SUPABASE_JWT_SECRET, algorithm='HS256')


@pytest.fixture
def authenticated_headers(test_user_token) -> dict:
    return {'Authorization': f'Bearer {test_user_token}'}


@pytest.fixture
async def test_organization(async_db_session, test_user_id) -> Organization:
    unique_id = str(uuid4())[:8]
    org = Organization(
        id=uuid4(),
        name='Test Organization',
        slug=f'test-org-{unique_id}',
        subscription_plan=SubscriptionPlanEnum.FREE,
        subscription_status='active',
        created_by=test_user_id,
        created_at=datetime.now(timezone.utc),
        updated_at=datetime.now(timezone.utc),
    )
    async_db_session.add(org)
    await async_db_session.commit()
    await async_db_session.refresh(org)
    return org


@pytest.fixture
async def test_organization_with_subscription(
    async_db_session, test_user_id
) -> Organization:
    unique_id = str(uuid4())[:8]
    org = Organization(
        id=uuid4(),
        name='Pro Organization',
        slug=f'pro-org-{unique_id}',
        subscription_plan=SubscriptionPlanEnum.PRO_MONTHLY,
        subscription_status='active',
        dodo_subscription_id='test_sub_123',
        payment_status=PaymentStatusEnum.SUCCEEDED,
        last_payment_date=datetime.now(timezone.utc),
        created_by=test_user_id,
        created_at=datetime.now(timezone.utc),
        updated_at=datetime.now(timezone.utc),
    )
    async_db_session.add(org)
    await async_db_session.commit()
    await async_db_session.refresh(org)
    return org


@pytest.fixture
async def test_project(async_db_session, test_organization) -> Project:
    project = Project(
        id=uuid4(),
        name='Test Project',
        organization_id=test_organization.id,
        created_at=datetime.now(timezone.utc),
        updated_at=datetime.now(timezone.utc),
    )
    async_db_session.add(project)
    await async_db_session.commit()
    await async_db_session.refresh(project)
    return project


@pytest.fixture
async def test_widget(async_db_session, test_project) -> Widget:
    unique_id = str(uuid4())[:8]
    widget = Widget(
        id=uuid4(),
        name='Test Widget',
        project_id=test_project.id,
        widget_type=WidgetType.FEEDBACK,
        public_key=f'test_widget_key_{unique_id}',
        status=WidgetStatus.ACTIVE,
        created_at=datetime.now(timezone.utc),
        updated_at=datetime.now(timezone.utc),
    )
    async_db_session.add(widget)
    await async_db_session.commit()
    await async_db_session.refresh(widget)
    return widget


@pytest.fixture
def mock_dodo_client():
    mock_client = Mock()
    mock_client.subscriptions = Mock()
    mock_client.subscriptions.update = Mock(
        return_value={
            'response': {
                'data': base64.b64encode(
                    '{"next_billing_date": "2025-12-31T00:00:00Z"}'.encode()
                ).decode()
            }
        }
    )
    mock_client.subscriptions.change_plan = Mock(return_value=None)
    mock_client.payments = Mock()
    mock_client.payments.list = Mock(return_value=Mock(items=[]))
    mock_client.invoices = Mock()
    mock_client.invoices.payments = Mock()
    mock_client.invoices.payments.retrieve = Mock(
        return_value=Mock(read=Mock(return_value=b'PDF_CONTENT'))
    )
    return mock_client


@pytest.fixture
def mock_webhook_secret() -> str:
    return 'test_webhook_secret'


@pytest.fixture
def generate_webhook_signature(mock_webhook_secret):
    def _generate(webhook_id: str, timestamp: str, payload_str: str) -> str:
        signed_payload = f'{webhook_id}.{timestamp}.{payload_str}'
        secret_key = mock_webhook_secret.encode('utf-8')
        digest = hmac.new(
            secret_key, signed_payload.encode('utf-8'), hashlib.sha256
        ).digest()
        return base64.b64encode(digest).decode('ascii')

    return _generate


@pytest.fixture
def mock_rate_limit_storage(monkeypatch):
    from collections import defaultdict

    storage = defaultdict(list)
    import app.core.rate_limiting

    monkeypatch.setattr(app.core.rate_limiting, '_rate_limit_storage', storage)
    yield storage
    storage.clear()


@pytest.fixture
def usage_tracking_service():
    from app.services.usage_tracking_service import UsageTrackingService

    return UsageTrackingService()


@pytest.fixture(autouse=True)
def override_settings(monkeypatch):
    monkeypatch.setenv('ENV', 'test')
    monkeypatch.setenv('DATABASE_URL', TEST_DATABASE_URL)
    monkeypatch.setenv('SUPABASE_JWT_SECRET', 'test-jwt-secret-key-for-testing-only')
    monkeypatch.setenv('DODO_API_KEY', 'test_dodo_key')
    monkeypatch.setenv('DODO_WEBHOOK_SECRET', 'test_webhook_secret')
    monkeypatch.setenv('DODO_RETURN_URL', 'http://localhost:5173/payment/return')
    monkeypatch.setenv('DODO_PRODUCT_ID_PRO_MONTHLY', 'test_prod_monthly_123')
    monkeypatch.setenv('DODO_PRODUCT_ID_PRO_YEARLY', 'test_prod_yearly_123')
