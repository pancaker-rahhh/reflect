from typing import TYPE_CHECKING
from datetime import datetime
import uuid
from sqlalchemy import String, DateTime as DateTimeColumn, Integer, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base_model import BaseModelWithoutSoftDelete

if TYPE_CHECKING:
    pass


class UsageTracking(BaseModelWithoutSoftDelete):
    __tablename__ = 'usage_tracking'

    organization_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey('organizations.id', ondelete='CASCADE'),
        nullable=False,
        index=True,
    )
    resource_type: Mapped[str] = mapped_column(String(50), nullable=False, index=True)
    usage_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    period_start: Mapped[datetime] = mapped_column(
        DateTimeColumn(timezone=True), nullable=False, index=True
    )
