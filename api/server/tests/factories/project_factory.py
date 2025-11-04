from uuid import UUID, uuid4
from datetime import datetime, timezone
from app.models.project_model import Project


def create_project(
    organization_id: UUID,
    name: str = 'Test Project',
    created_by: UUID | None = None,
) -> Project:
    return Project(
        id=uuid4(),
        name=name,
        organization_id=organization_id,
        created_by=created_by or uuid4(),
        created_at=datetime.now(timezone.utc),
        updated_at=datetime.now(timezone.utc),
    )
