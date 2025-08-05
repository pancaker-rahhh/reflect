from sqlalchemy import (
    ARRAY,
    JSON,
    Boolean,
    Column,
    DateTime,
    Enum,
    ForeignKey,
    Integer,
    String,
    Table,
    Text,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from ..core.constants import (
    CoupleTypeEnum,
    FieldStatusEnum,
    FormModeEnum,
    FormStatusEnum,
    PartyTypeEnum,
    RequestStatusEnum,
    RespondentActionStatusEnum,
)
from .base import Base, BaseModel


form_parties = Table(
    'form_parties',
    Base.metadata,
    Column('form_id', UUID(as_uuid=True), ForeignKey('forms.id'), primary_key=True),
    Column('party_id', UUID(as_uuid=True), ForeignKey('parties.id'), primary_key=True),
)


action_plan_items = Table(
    'action_plan_items',
    Base.metadata,
    Column(
        'action_plan_id',
        UUID(as_uuid=True),
        ForeignKey('action_plans.id'),
        primary_key=True,
    ),
    Column(
        'action_item_id',
        UUID(as_uuid=True),
        ForeignKey('action_items.id'),
        primary_key=True,
    ),
)


class ActionItem(BaseModel):
    __tablename__ = 'action_items'

    submission_id = Column(
        UUID(as_uuid=True), ForeignKey('submissions.id'), nullable=True
    )
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    priority = Column(Integer, default=0)
    category = Column(String, nullable=True)
    status = Column(RespondentActionStatusEnum, default='New')
    due_date = Column(DateTime, nullable=True)
    assignee_id = Column(UUID(as_uuid=True), nullable=True, index=True)
    source = Column(String, nullable=True)
    ai_confidence = Column(Integer, nullable=True)
    is_completed = Column(Boolean, default=False)

    source_submission = relationship(
        'Submission', back_populates='action_items', lazy='joined'
    )

    action_plans = relationship(
        'ActionPlan',
        secondary=action_plan_items,
        back_populates='items',
        lazy='selectin',
    )


class ActionPlan(BaseModel):
    __tablename__ = 'action_plans'

    user_id = Column(UUID(as_uuid=True))
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    progress = Column(Integer, default=0)
    start_date = Column(DateTime, nullable=True)
    end_date = Column(DateTime, nullable=True)
    recurring_pattern = Column(String, nullable=True)

    items = relationship(
        'ActionItem',
        secondary=action_plan_items,
        back_populates='action_plans',
        lazy='selectin',
    )


class PartyMember(BaseModel):
    __tablename__ = 'party_members'
    party_id = Column(
        UUID(as_uuid=True),
        ForeignKey('parties.id', ondelete='CASCADE'),
        primary_key=True,
    )
    user_id = Column(UUID(as_uuid=True), primary_key=True, index=True)


class Party(BaseModel):
    __tablename__ = 'parties'

    party_type = Column(Enum(PartyTypeEnum, native_enum=False), nullable=False)

    name = Column(String, nullable=True)
    tag = Column(String, nullable=True)
    description = Column(Text, nullable=True)
    created_by_id = Column(UUID(as_uuid=True), index=True)
    icon_id = Column(String, nullable=True)
    couple_type = Column(Enum(CoupleTypeEnum, native_enum=False), nullable=True)

    __mapper_args__ = {
        'polymorphic_identity': 'party',
        'polymorphic_on': party_type,
        'with_polymorphic': '*',
    }

    members = relationship(
        'PartyMember', backref='party', lazy='selectin', cascade='all, delete-orphan'
    )
    forms = relationship(
        'Form', secondary=form_parties, back_populates='parties', lazy='selectin'
    )


class Group(Party):
    __mapper_args__ = {
        'polymorphic_identity': PartyTypeEnum.GROUP,
    }

    def __init__(self, **kwargs):
        kwargs['party_type'] = PartyTypeEnum.GROUP
        super().__init__(**kwargs)


class Couple(Party):
    __mapper_args__ = {
        'polymorphic_identity': PartyTypeEnum.COUPLE,
    }

    def __init__(self, **kwargs):
        kwargs['party_type'] = PartyTypeEnum.COUPLE
        super().__init__(**kwargs)


class Template(BaseModel):
    __tablename__ = 'templates'

    name = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    category = Column(String, nullable=True)
    created_by_id = Column(UUID(as_uuid=True), index=True)

    forms = relationship('Form', back_populates='template', lazy='selectin')


class Form(BaseModel):
    __tablename__ = 'forms'

    template_id = Column(UUID(as_uuid=True), ForeignKey('templates.id'))
    title = Column(String, nullable=False)
    context = Column(Text, nullable=True)
    created_by_id = Column(UUID(as_uuid=True), index=True)
    feedback_giver_persona = Column(String, nullable=True)
    feedback_receiver_persona = Column(String, nullable=True)
    respondents = Column(ARRAY(UUID(as_uuid=True)), nullable=True)
    parties = relationship(
        'Party', secondary=form_parties, back_populates='forms', lazy='selectin'
    )
    priority = Column(Integer, default=0)
    status = Column(
        Enum(FormStatusEnum, native_enum=False),
        default=FormStatusEnum.DRAFT,
        nullable=False,
    )
    mode = Column(
        Enum(FormModeEnum, native_enum=False),
        default=FormModeEnum.COLLECT_FEEDBACK,
        nullable=False,
    )
    expires_at = Column(DateTime, nullable=True)
    template = relationship('Template', back_populates='forms', lazy='joined')
    form_fields = relationship('FormField', back_populates='form', lazy='selectin')
    submissions = relationship('Submission', back_populates='form', lazy='selectin')
    respondent_requests = relationship(
        'RespondentRequest', back_populates='form', lazy='selectin'
    )


class Field(BaseModel):
    __tablename__ = 'fields'

    type = Column(String, nullable=False)
    question = Column(String, nullable=False)
    placeholder = Column(String, nullable=True)
    is_required = Column(Boolean, default=False)
    options = Column(ARRAY(String), nullable=True)
    validation_rules = Column(JSON, nullable=True)
    ai_suggestions = Column(JSON, nullable=True)
    category = Column(String, nullable=True)
    label = Column(String, nullable=True)
    form_fields = relationship('FormField', back_populates='field', lazy='selectin')


class FormField(BaseModel):
    __tablename__ = 'form_fields'

    field_id = Column(UUID(as_uuid=True), ForeignKey('fields.id'))
    form_id = Column(UUID(as_uuid=True), ForeignKey('forms.id'))
    order = Column(Integer, nullable=False)
    custom_question = Column(String, nullable=True)
    custom_options = Column(ARRAY(String), nullable=True)
    custom_label = Column(String, nullable=True)
    status = Column(
        Enum(FieldStatusEnum, native_enum=False),
        default=FieldStatusEnum.PENDING,
        nullable=False,
    )
    field = relationship('Field', back_populates='form_fields', lazy='joined')
    form = relationship('Form', back_populates='form_fields', lazy='joined')


class Submission(BaseModel):
    __tablename__ = 'submissions'

    form_id = Column(UUID(as_uuid=True), ForeignKey('forms.id'))
    respondent_id = Column(UUID(as_uuid=True))
    receiver_id = Column(UUID(as_uuid=True), nullable=True)
    submitted_at = Column(DateTime, nullable=False)
    values = Column(JSON, nullable=False)

    form = relationship('Form', back_populates='submissions', lazy='joined')

    action_items = relationship(
        'ActionItem', back_populates='source_submission', lazy='selectin'
    )


class RespondentRequest(BaseModel):
    __tablename__ = 'respondent_requests'

    form_id = Column(UUID(as_uuid=True), ForeignKey('forms.id'))
    user_id = Column(UUID(as_uuid=True), nullable=False)
    status = Column(RequestStatusEnum, default='Pending')
    requested_at = Column(DateTime, nullable=False)
    reminder_sent = Column(Boolean, default=False)
    reminder_count = Column(Integer, default=0)
    last_reminder_at = Column(DateTime, nullable=True)

    form = relationship('Form', back_populates='respondent_requests', lazy='joined')


class NotificationDevice(BaseModel):
    __tablename__ = 'notification_devices'

    user_id = Column(UUID(as_uuid=True), nullable=False, index=True)
    onesignal_player_id = Column(String, nullable=False, unique=True)
    device_type = Column(String, nullable=False)


class Notification(BaseModel):
    __tablename__ = 'notifications'

    user_id = Column(UUID(as_uuid=True), nullable=False, index=True)
    type = Column(String, nullable=False)
    title = Column(String, nullable=False)
    message = Column(Text, nullable=False)
    data = Column(JSON, nullable=True)
    is_read = Column(Boolean, default=False)
    read_at = Column(DateTime, nullable=True)


class NotificationPreferences(BaseModel):
    __tablename__ = 'notification_preferences'

    user_id = Column(UUID(as_uuid=True), nullable=False, unique=True)
    feedback_reminders = Column(Boolean, default=True)
    group_updates = Column(Boolean, default=True)
    action_items = Column(Boolean, default=True)


class CoupleInvitationCode(BaseModel):
    __tablename__ = 'couple_invitation_codes'

    code = Column(String(6), nullable=False, unique=True, index=True)
    created_by_id = Column(UUID(as_uuid=True), nullable=False, index=True)
    expires_at = Column(DateTime, nullable=False)
    used_at = Column(DateTime, nullable=True)
    used_by_id = Column(UUID(as_uuid=True), nullable=True)
