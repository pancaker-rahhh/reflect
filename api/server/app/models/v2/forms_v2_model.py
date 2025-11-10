import uuid
from typing import Optional, List
from sqlalchemy import String, Boolean, ForeignKey, Integer
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship, Mapped, mapped_column
from app.models.base_model import BaseModel

class FormV2(BaseModel):
    __tablename__ = 'forms_v2'

    project_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey('projects.id', ondelete='CASCADE'),
        nullable=False,
    )
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    form_type: Mapped[str] = mapped_column(String(50), default='custom')
    description: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    public_link: Mapped[str] = mapped_column(String(16), unique=True, nullable=False, index=True)
    config: Mapped[dict] = mapped_column(JSONB, default=dict)

    project = relationship('Project')
    fields: Mapped[List['FormFieldV2']] = relationship(
        'FormFieldV2', back_populates='form', cascade='all, delete-orphan'
    )
    responses: Mapped[List['FormResponseV2']] = relationship(
        'FormResponseV2', back_populates='form', cascade='all, delete-orphan'
    )

class FormFieldV2(BaseModel):
    __tablename__ = 'form_fields_v2'

    form_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey('forms_v2.id', ondelete='CASCADE'),
        nullable=False,
        index=True,
    )
    field_type: Mapped[str] = mapped_column(String(50), nullable=False)
    field_key: Mapped[str] = mapped_column(String(100), nullable=False)
    label: Mapped[str] = mapped_column(String(255), nullable=False)
    is_required: Mapped[bool] = mapped_column(Boolean, default=False)
    config: Mapped[list] = mapped_column(JSONB, default=list)
    order_index: Mapped[int] = mapped_column(Integer, nullable=False, default=0)

    form = relationship('FormV2', back_populates='fields')

    __table_args__ = ({'extend_existing': True},)


class FormResponseV2(BaseModel):
    __tablename__ = 'form_responses_v2'

    form_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey('forms_v2.id', ondelete='CASCADE'),
        nullable=False,
        index=True,
    )
    # Store all answers as JSONB - keyed by field_key
    # This design allows form fields to change over time:
    # - New fields: won't exist in old responses (business logic can identify missing keys)
    # - Deleted fields: will remain in old responses (business logic can identify obsolete keys)
    # - Renamed fields: old responses keep old key, new responses use new key
    # The form_id reference allows comparing response keys against current form fields
    answers: Mapped[dict] = mapped_column(JSONB, nullable=False, default=dict)
    
    # Optional metadata
    submitter_email: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    submitter_name: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    ip_address: Mapped[Optional[str]] = mapped_column(String(45), nullable=True)
    user_agent: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)

    form = relationship('FormV2', back_populates='responses')

    __table_args__ = ({'extend_existing': True},)
