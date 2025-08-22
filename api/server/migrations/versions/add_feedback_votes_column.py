"""add_feedback_votes_column

Revision ID: add_feedback_votes_column
Revises: remove_priority_column
Create Date: 2025-08-21 21:00:00.000000

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = 'add_feedback_votes_column'
down_revision: Union[str, Sequence[str], None] = 'remove_priority_column'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # Add feedback_votes column to feedback table
    op.add_column(
        'feedback',
        sa.Column('feedback_votes', sa.Integer(), nullable=False, server_default='0'),
    )


def downgrade() -> None:
    """Downgrade schema."""
    # Drop feedback_votes column from feedback table
    op.drop_column('feedback', 'feedback_votes')
