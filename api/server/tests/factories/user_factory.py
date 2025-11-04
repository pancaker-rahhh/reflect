from uuid import UUID, uuid4
from datetime import datetime, timezone
from app.models.user_model import User


def create_user(
    email: str = 'test@example.com',
    name: str = 'Test User',
    user_id: UUID | None = None,
) -> User:
    return User(
        id=user_id or uuid4(),
        email=email,
        name=name,
        created_at=datetime.now(timezone.utc),
        updated_at=datetime.now(timezone.utc),
    )
