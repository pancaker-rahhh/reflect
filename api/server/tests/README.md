# Test Suite for Reflect API

Comprehensive test suite for payment services, public routers, and critical infrastructure.

## Structure

```
tests/
├── conftest.py              # Shared fixtures and test configuration
├── factories/               # Test data factories
├── unit/                    # Unit tests
│   ├── services/            # Service layer tests
│   ├── core/                # Core functionality tests (sanitization, rate limiting)
│   └── utils/               # Utility tests
├── integration/             # Integration tests
│   ├── routers/            # Router integration tests
│   └── services/            # Service integration tests
└── e2e/                     # End-to-end tests
```

## Running Tests

### Install test dependencies

```bash
cd api
poetry install --with test
# or
pip install -e ".[test]"
```

### Run all tests

```bash
pytest
```

### Run specific test categories

```bash
# Unit tests only
pytest tests/unit/

# Integration tests only
pytest tests/integration/

# Specific test file
pytest tests/unit/services/test_payment_service.py
```

### Run with coverage

```bash
pytest --cov=app --cov-report=html
```

### Run specific test

```bash
pytest tests/unit/core/test_sanitization.py::TestSanitizeText::test_removes_control_characters
```

## Test Coverage

### Unit Tests

- **PaymentService**: Payment link generation, webhook processing, subscription management
- **SubscriptionService**: Plan management, limits, features
- **UsageTrackingService**: Usage tracking for subscription limits
- **InputSanitizer**: Security-focused input sanitization
- **RateLimiting**: Rate limit enforcement logic

### Integration Tests

- **Payment Router**: All payment endpoints with authentication/authorization
- **Public Router**: Anonymous endpoints with rate limiting and sanitization
- **Webhook Router**: Webhook signature verification and processing
- **Subscription Router**: Subscription management endpoints

## Key Fixtures

- `async_db_session`: Database session with automatic rollback
- `test_client`: FastAPI TestClient
- `authenticated_headers`: JWT token headers
- `test_organization`: Sample organization
- `test_widget`: Sample widget with public key
- `mock_dodo_client`: Mocked DodoPayments client
- `generate_webhook_signature`: Helper for webhook signature generation

## Test Data Factories

Factories are located in `tests/factories/`:

- `organization_factory.py`: Create organizations with different subscription states
- `widget_factory.py`: Create widgets with different types
- `user_factory.py`: Create test users
- `project_factory.py`: Create test projects

## Notes

- Tests use SQLite in-memory database for fast execution
- All database transactions rollback after each test
- Rate limiting uses isolated storage per test
- External services (Dodo Payments) are fully mocked
- Authentication is mocked with test JWT tokens





