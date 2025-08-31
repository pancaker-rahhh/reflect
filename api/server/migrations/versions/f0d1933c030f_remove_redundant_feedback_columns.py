"""remove_redundant_feedback_columns

Revision ID: f0d1933c030f
Revises: add_missing_feedback_types
Create Date: 2025-08-31 21:59:41.343250

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'f0d1933c030f'
down_revision: Union[str, Sequence[str], None] = 'add_missing_feedback_types'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Remove redundant columns that duplicate data already stored in context JSONB field."""
    # Remove ip_address, user_agent, and browser_info columns
    # This data is already stored in the context JSONB field
    op.drop_column('feedback', 'ip_address')
    op.drop_column('feedback', 'user_agent')
    op.drop_column('feedback', 'browser_info')


def downgrade() -> None:
    """Restore the removed columns if rollback is needed."""
    # Re-add the columns that were removed
    op.add_column('feedback', sa.Column('ip_address', sa.INET(), nullable=True))
    op.add_column('feedback', sa.Column('user_agent', sa.Text(), nullable=True))
    op.add_column('feedback', sa.Column('browser_info', sa.JSON(), nullable=True))
