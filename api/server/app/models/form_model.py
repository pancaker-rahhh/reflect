from typing import Optional, List
import uuid
from sqlalchemy import String, Boolean, ForeignKey, Integer
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship, Mapped, mapped_column

from app.models.base_model import BaseModel


class FeedbackForm(BaseModel):
    __tablename__ = 'feedback_forms'

    project_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey('projects.id', ondelete='CASCADE'),
        nullable=False,
    )

    name: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    config: Mapped[dict] = mapped_column(JSONB, default=dict)

    project = relationship('Project', back_populates='forms')
    feedback_items = relationship('Feedback', back_populates='form')
    form_fields: Mapped[List['FormField']] = relationship('FormField', back_populates='form', cascade='all, delete-orphan')


class FormField(BaseModel):
    __tablename__ = 'form_fields'

    form_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey('feedback_forms.id', ondelete='CASCADE'),
        nullable=False,
        index=True,
    )

    field_type: Mapped[str] = mapped_column(String(50), nullable=False)
    field_key: Mapped[str] = mapped_column(String(100), nullable=False)
    label: Mapped[str] = mapped_column(String(255), nullable=False)

    is_required: Mapped[bool] = mapped_column(Boolean, default=False)
    validation_rules: Mapped[dict] = mapped_column(JSONB, default=dict)
    options: Mapped[list] = mapped_column(JSONB, default=list)

    order_index: Mapped[int] = mapped_column(Integer, nullable=False, default=0)

    form = relationship('FeedbackForm', back_populates='form_fields')

    __table_args__ = (
        {'extend_existing': True},
    )
