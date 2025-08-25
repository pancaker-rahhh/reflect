from sqlalchemy import Column, String, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship
from app.models.base_model import BaseModel
import hashlib


class FeatureVote(BaseModel):
    __tablename__ = 'feature_votes'
    __table_args__ = (
        UniqueConstraint('feedback_id', 'voter_hash', name='unique_vote_per_feature'),
    )

    feedback_id = Column(ForeignKey('feedback.id', ondelete='CASCADE'), nullable=False, index=True)
    voter_hash = Column(String(255), nullable=False, index=True)

    # Relationships
    feedback = relationship("Feedback", back_populates="votes")

    @classmethod
    def create_voter_hash(cls, ip_address: str, user_agent: str) -> str:
        """Create a hash from IP address and user agent for vote tracking"""
        combined = f"{ip_address}:{user_agent or 'unknown'}"
        return hashlib.sha256(combined.encode()).hexdigest()[:32]  # Use first 32 chars