"""add_missing_feature_votes_columns

Revision ID: e6dd4442b88a
Revises: widget_versioning
Create Date: 2025-08-26 11:57:34.752169

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'e6dd4442b88a'
down_revision: Union[str, Sequence[str], None] = 'widget_versioning'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Add missing updated_at and deleted_at columns to feature_votes table."""
    op.add_column('feature_votes', sa.Column('updated_at', sa.TIMESTAMP(timezone=True), server_default=sa.func.now(), nullable=False))
    op.add_column('feature_votes', sa.Column('deleted_at', sa.TIMESTAMP(timezone=True), nullable=True))
    
    # Add indexes for the new columns
    op.create_index('ix_feature_votes_updated_at', 'feature_votes', ['updated_at'])
    op.create_index('ix_feature_votes_deleted_at', 'feature_votes', ['deleted_at'])


def downgrade() -> None:
    """Remove updated_at and deleted_at columns from feature_votes table."""
    op.drop_index('ix_feature_votes_deleted_at')
    op.drop_index('ix_feature_votes_updated_at')
    op.drop_column('feature_votes', 'deleted_at')
    op.drop_column('feature_votes', 'updated_at')
