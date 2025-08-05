from enum import Enum
from sqlalchemy.dialects.postgresql import ENUM

# TODO - move types here into corresponding schemas


class FormStatusEnum(str, Enum):
    DRAFT = 'draft'
    PUBLISHED = 'published'
    RESPONDED = 'responded'
    EXPIRED = 'expired'
    ARCHIVED = 'archived'


class FormModeEnum(Enum):
    COLLECT_FEEDBACK = 'collect_feedback'
    GIVE_FEEDBACK = 'give_feedback'


class PartyTypeEnum(str, Enum):
    GROUP = 'group'
    COUPLE = 'couple'


class CoupleTypeEnum(str, Enum):
    LONG_TERM = 'long_term'
    SUCCESSFUL_LONG_TERM = 'successful_long_term'
    STRUGGLING = 'struggling'
    EVALUATING_RELATIONSHIP = 'evaluating_relationship'


class FieldStatusEnum(str, Enum):
    ACCEPTED = 'accepted'
    REJECTED = 'rejected'
    PENDING = 'pending'


RequestStatusEnum = ENUM(
    'Pending',
    'Viewed',
    'Completed',
    'Declined',
    name='request_status_enum',
    create_type=False,
)

RespondentActionStatusEnum = ENUM(
    'New',
    'In Progress',
    'Completed',
    'Deferred',
    name='respondent_action_status_enum',
    create_type=False,
)
