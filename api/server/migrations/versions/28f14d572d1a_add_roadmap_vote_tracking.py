"""add_roadmap_vote_tracking

Revision ID: 28f14d572d1a
Revises: dc5767eef36c
Create Date: 2025-09-18 18:54:19.989986

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '28f14d572d1a'
down_revision: Union[str, Sequence[str], None] = 'dc5767eef36c'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Add roadmap vote tracking table with IP and user tracking."""
    # Create roadmap_votes table
    op.create_table(
        'roadmap_votes',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('feature_id', sa.UUID(), nullable=False),
        sa.Column('user_id', sa.UUID(), nullable=True),
        sa.Column('ip_address', sa.String(45), nullable=True),
        sa.Column('user_agent', sa.Text(), nullable=True),
        sa.Column(
            'created_at',
            sa.TIMESTAMP(timezone=True),
            server_default=sa.func.now(),
            nullable=False,
        ),
        sa.Column(
            'updated_at',
            sa.TIMESTAMP(timezone=True),
            server_default=sa.func.now(),
            nullable=False,
        ),
        sa.PrimaryKeyConstraint('id'),
        sa.ForeignKeyConstraint(
            ['feature_id'], ['roadmap_action_items.id'], ondelete='CASCADE'
        ),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.UniqueConstraint('feature_id', 'user_id', name='uq_roadmap_vote_user'),
        sa.UniqueConstraint('feature_id', 'ip_address', name='uq_roadmap_vote_ip'),
    )

    # Add indexes for performance
    op.create_index('ix_roadmap_votes_feature_id', 'roadmap_votes', ['feature_id'])
    op.create_index('ix_roadmap_votes_user_id', 'roadmap_votes', ['user_id'])
    op.create_index('ix_roadmap_votes_ip_address', 'roadmap_votes', ['ip_address'])


def downgrade() -> None:
    """Remove roadmap vote tracking table."""
    op.drop_index('ix_roadmap_votes_ip_address')
    op.drop_index('ix_roadmap_votes_user_id')
    op.drop_index('ix_roadmap_votes_feature_id')
    op.drop_table('roadmap_votes')
