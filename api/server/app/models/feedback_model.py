from typing import TYPE_CHECKING, Optional
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
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship, Mapped, mapped_column
import enum
import uuid

from app.models.base_model import BaseModel

if TYPE_CHECKING:
    from app.models.roadmap_model import RoadmapActionItem


class FeedbackType(str, enum.Enum):
    GENERAL = 'general'
    SURVEY = 'survey'
    REVIEW = 'review'
    BUG_REPORT = 'bug_report'
    FEATURE_REQUEST = 'feature_request'
    NPS = 'NPS'
    CSAT = 'CSAT'
    CES = 'CES'


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

    feedback_type = Column(
        SQLEnum(
            FeedbackType,
            name='feedbacktype',
            values_callable=lambda obj: [e.value for e in obj],
        ),
        nullable=False,
    )

    title = Column(String(500))
    message = Column(Text)
    rating = Column(Integer)
    feedback_votes = Column(Integer, default=0)

    feedback_metadata = Column(JSONB, default=dict)
    context = Column(JSONB, default=dict)

    submitter_name = Column(String(255))
    submitter_email = Column(String(320))
    submitter_id = Column(String(255))

    is_anonymous = Column(Boolean, default=True)
    is_internal = Column(Boolean, default=False)
    is_spam = Column(Boolean, default=False)
    is_flagged = Column(Boolean, default=False)

    converted_to_action_item_id = Column(
        UUID(as_uuid=True), ForeignKey('roadmap_action_items.id'), nullable=True
    )
    conversion_date = Column(DateTimeColumn, nullable=True)
    conversion_notes = Column(Text, nullable=True)
    is_actionable = Column(Boolean, default=True)

    widget = relationship('Widget', back_populates='feedback')
    project = relationship('Project')
    form = relationship('FeedbackForm', back_populates='feedback_items')
    converted_to_action_item: Mapped[Optional['RoadmapActionItem']] = relationship(
        foreign_keys=[converted_to_action_item_id], back_populates='converted_feedback'
    )
    comments = relationship(
        'FeedbackComment', back_populates='feedback', cascade='all, delete-orphan'
    )
    votes = relationship(
        'FeatureVote', back_populates='feedback', cascade='all, delete-orphan'
    )

    __mapper_args__ = {
        'polymorphic_identity': 'feedback',
        'polymorphic_on': feedback_type,
    }


class GeneralFeedback(Feedback):
    __mapper_args__ = {'polymorphic_identity': FeedbackType.GENERAL}


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
    overall_rating = Column(Integer)  # 1-5 star rating
    pros = Column(Text)
    cons = Column(Text)
    is_published = Column(Boolean, default=False)

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
    visual_proof = Column(JSONB, default=dict)  # Store image URLs or file references

    __mapper_args__ = {'polymorphic_identity': FeedbackType.BUG_REPORT}


class FeatureRequestFeedback(Feedback):
    __tablename__ = 'feature_request_feedback'

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey('feedback.id'), primary_key=True
    )
    use_case = Column(Text)
    suggested_solution = Column(Text)
    benefits = Column(Text)
    implementation_status = Column(String(50), default='backlog')

    __mapper_args__ = {'polymorphic_identity': FeedbackType.FEATURE_REQUEST}


class NPSFeedback(Feedback):
    __tablename__ = 'nps_feedback'

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey('feedback.id'), primary_key=True
    )
    nps_score = Column(Integer)  # 0-10 scale
    promoter_category = Column(String(20))  # 'detractor', 'passive', 'promoter'
    follow_up_comment = Column(Text)

    __mapper_args__ = {'polymorphic_identity': FeedbackType.NPS}


class CSATFeedback(Feedback):
    __tablename__ = 'csat_feedback'

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey('feedback.id'), primary_key=True
    )
    csat_score = Column(Integer)  # 1-5 scale
    satisfaction_level = Column(
        String(20)
    )  # 'very_dissatisfied', 'dissatisfied', 'neutral', 'satisfied', 'very_satisfied'
    follow_up_comment = Column(Text)

    __mapper_args__ = {'polymorphic_identity': FeedbackType.CSAT}


class CESFeedback(Feedback):
    __tablename__ = 'ces_feedback'

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey('feedback.id'), primary_key=True
    )
    ces_score = Column(Integer)  # 1-5 scale
    ease_level = Column(
        String(20)
    )  # 'very_difficult', 'difficult', 'neutral', 'easy', 'very_easy'
    follow_up_comment = Column(Text)

    __mapper_args__ = {'polymorphic_identity': FeedbackType.CES}


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
