from typing import Optional, TYPE_CHECKING
import uuid
from sqlalchemy import String, Boolean, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship, Mapped, mapped_column

from app.models.base_model import BaseModel

if TYPE_CHECKING:
    from app.models.user_model import User


class UserOnboarding(BaseModel):
    __tablename__ = 'user_onboarding'

    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey('users.id', ondelete='CASCADE'),
        nullable=False,
        unique=True,
        index=True,
    )

    has_created_project: Mapped[bool] = mapped_column(Boolean, default=False)
    has_created_widget: Mapped[bool] = mapped_column(Boolean, default=False)
    has_received_first_feedback: Mapped[bool] = mapped_column(Boolean, default=False)

    company_size: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    use_case: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)

    user: Mapped['User'] = relationship('User', back_populates='onboarding')