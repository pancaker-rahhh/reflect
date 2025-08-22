"""add_missing_columns

Revision ID: add_missing_columns
Revises: add_nps_csat_ces_feedback_tables
Create Date: 2025-08-21 18:00:00.000000

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = 'add_missing_columns'
down_revision: Union[str, Sequence[str], None] = 'add_nps_csat_ces_feedback_tables'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # Add pros and cons columns to review_feedback table
    op.add_column('review_feedback', sa.Column('pros', sa.Text(), nullable=True))
    op.add_column('review_feedback', sa.Column('cons', sa.Text(), nullable=True))


def downgrade() -> None:
    """Downgrade schema."""
    # Drop pros and cons columns from review_feedback table
    op.drop_column('review_feedback', 'cons')
    op.drop_column('review_feedback', 'pros')
