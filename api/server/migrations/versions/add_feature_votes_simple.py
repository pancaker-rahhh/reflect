"""Add simple feature votes tracking

Revision ID: feature_votes_simple
Revises: 5be8741c7307  
Create Date: 2025-08-25 21:20:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = 'feature_votes_simple'
down_revision: Union[str, Sequence[str], None] = '5be8741c7307'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Add simple feature votes tracking to prevent duplicate votes"""
    # Create a simple table to track votes by IP+UserAgent hash
    op.create_table(
        'feature_votes',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('feedback_id', sa.UUID(), nullable=False),
        sa.Column('voter_hash', sa.String(255), nullable=False),  # Hash of IP + User Agent
        sa.Column('created_at', sa.TIMESTAMP(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.PrimaryKeyConstraint('id'),
        sa.ForeignKeyConstraint(['feedback_id'], ['feedback.id'], ondelete='CASCADE'),
        sa.UniqueConstraint('feedback_id', 'voter_hash', name='unique_vote_per_feature')
    )
    
    # Add indexes for performance
    op.create_index('ix_feature_votes_feedback_id', 'feature_votes', ['feedback_id'])
    op.create_index('ix_feature_votes_voter_hash', 'feature_votes', ['voter_hash'])
    

def downgrade() -> None:
    """Remove feature votes table"""
    op.drop_index('ix_feature_votes_voter_hash')
    op.drop_index('ix_feature_votes_feedback_id')
    op.drop_table('feature_votes')