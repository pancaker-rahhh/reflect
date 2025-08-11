from typing import TYPE_CHECKING
import uuid
from sqlalchemy import String, Boolean, ForeignKey, Text, ARRAY
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship, Mapped, mapped_column

from app.models.base_model import BaseModel

if TYPE_CHECKING:
    from app.models.project_model import Project


class Webhook(BaseModel):
    __tablename__ = 'webhooks'

    project_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey('projects.id', ondelete='CASCADE'),
        nullable=False,
        index=True,
    )

    name: Mapped[str] = mapped_column(String(255), nullable=False)
    url: Mapped[str] = mapped_column(Text, nullable=False)
    events: Mapped[list[str]] = mapped_column(ARRAY(String), nullable=False)

    is_active: Mapped[bool] = mapped_column(Boolean, default=True)

    project: Mapped['Project'] = relationship('Project', back_populates='webhooks')