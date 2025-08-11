from typing import TYPE_CHECKING, Optional, List
from sqlalchemy import (
    Column,
    String,
    Text,
    Integer,
    Boolean,
    ForeignKey,
    Enum as SQLEnum,
    DateTime as DateTimeColumn,
)
from sqlalchemy.dialects.postgresql import UUID, JSONB, INET
from sqlalchemy.orm import relationship, Mapped, mapped_column
import enum
import uuid

from app.models.base_model import BaseModel

if TYPE_CHECKING:
    from app.models.user_model import User


class FeedbackType(str, enum.Enum):
    GENERAL = 'general'
    SURVEY = 'survey'
    REVIEW = 'review'
    BUG_REPORT = 'bug_report'
    FEATURE_REQUEST = 'feature_request'
    NPS = 'nps'
    CSAT = 'csat'
    CES = 'ces'


class FeedbackStatus(str, enum.Enum):
    NEW = 'new'
    IN_PROGRESS = 'in_progress'
    RESOLVED = 'resolved'
    REJECTED = 'rejected'
    ARCHIVED = 'archived'


class FeedbackPriority(str, enum.Enum):
    LOW = 'low'
    MEDIUM = 'medium'
    HIGH = 'high'
    CRITICAL = 'critical'


class Feedback(BaseModel):
    __tablename__ = 'feedback'

    widget_id = Column(UUID(as_uuid=True), ForeignKey('widgets.id'), nullable=False)
    project_id = Column(UUID(as_uuid=True), ForeignKey('projects.id'), nullable=False)
    form_id = Column(UUID(as_uuid=True), ForeignKey('feedback_forms.id'), nullable=True)

    feedback_type = Column(SQLEnum(FeedbackType), nullable=False)
    status = Column(SQLEnum(FeedbackStatus), default=FeedbackStatus.NEW)
    priority = Column(SQLEnum(FeedbackPriority), default=FeedbackPriority.MEDIUM)

    title = Column(String(500))
    message = Column(Text)
    rating = Column(Integer)

    feedback_metadata = Column(JSONB, default=dict)
    context = Column(JSONB, default=dict)

    submitter_name = Column(String(255))
    submitter_email = Column(String(320))
    submitter_id = Column(String(255))

    ip_address = Column(INET)
    user_agent = Column(Text)
    browser_info = Column(JSONB, default=dict)

    is_anonymous = Column(Boolean, default=True)
    is_internal = Column(Boolean, default=False)
    is_spam = Column(Boolean, default=False)
    is_flagged = Column(Boolean, default=False)

    assigned_to_user_id = Column(
        UUID(as_uuid=True), ForeignKey('users.id'), nullable=True
    )
    resolved_at = Column(DateTimeColumn, nullable=True)
    resolved_by_user_id = Column(
        UUID(as_uuid=True), ForeignKey('users.id'), nullable=True
    )
    resolution_notes = Column(Text)

    widget = relationship('Widget', back_populates='feedback')
    project = relationship('Project')
    form = relationship('FeedbackForm', back_populates='feedback_items')
    assigned_to = relationship('User', foreign_keys=[assigned_to_user_id])
    resolved_by = relationship('User', foreign_keys=[resolved_by_user_id])
    comments = relationship('FeedbackComment', back_populates='feedback', cascade='all, delete-orphan')
    votes = relationship('FeedbackVote', back_populates='feedback', cascade='all, delete-orphan')

    __mapper_args__ = {
        'polymorphic_identity': 'feedback',
        'polymorphic_on': feedback_type,
    }


class SurveyFeedback(Feedback):
    __tablename__ = 'survey_feedback'

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey('feedback.id'), primary_key=True
    )
    survey_type = Column(String(50))
    score = Column(Integer)
    response_data = Column(JSONB, default=dict)

    __mapper_args__ = {'polymorphic_identity': FeedbackType.SURVEY}


class ReviewFeedback(Feedback):
    __tablename__ = 'review_feedback'

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey('feedback.id'), primary_key=True
    )
    overall_rating = Column(Integer)
    review_categories = Column(JSONB, default=dict)
    is_published = Column(Boolean, default=False)
    published_at = Column(DateTimeColumn, nullable=True)
    moderation_status = Column(String(50), default='pending')
    reviewer_location = Column(String(255))

    __mapper_args__ = {'polymorphic_identity': FeedbackType.REVIEW}


class BugReportFeedback(Feedback):
    __tablename__ = 'bug_report_feedback'

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey('feedback.id'), primary_key=True
    )
    severity_level = Column(SQLEnum(FeedbackPriority), default=FeedbackPriority.MEDIUM)
    steps_to_reproduce = Column(Text)
    expected_behavior = Column(Text)
    actual_behavior = Column(Text)
    environment_info = Column(JSONB, default=dict)
    attachments = Column(JSONB, default=list)

    __mapper_args__ = {'polymorphic_identity': FeedbackType.BUG_REPORT}


class FeatureRequestFeedback(Feedback):
    __tablename__ = 'feature_request_feedback'

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey('feedback.id'), primary_key=True
    )
    use_case = Column(Text)
    business_value = Column(Text)
    estimated_effort = Column(String(50))
    implementation_status = Column(String(50), default='backlog')
    impact_score = Column(Integer)

    __mapper_args__ = {'polymorphic_identity': FeedbackType.FEATURE_REQUEST}


class FeedbackComment(BaseModel):
    __tablename__ = 'feedback_comments'

    feedback_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey('feedback.id'), nullable=False, index=True
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey('users.id'), nullable=False
    )

    comment_text = Column(Text, nullable=False)

    feedback = relationship('Feedback', back_populates='comments')
    user = relationship('User')


class FeedbackVote(BaseModel):
    __tablename__ = 'feedback_votes'

    feedback_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey('feedback.id'), nullable=False, index=True
    )
    user_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True), ForeignKey('users.id'), nullable=True
    )
    session_id: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)

    vote_type = Column(String(10), nullable=False)

    feedback = relationship('Feedback', back_populates='votes')
    user = relationship('User')

    __table_args__ = (
        {'extend_existing': True},
    )
