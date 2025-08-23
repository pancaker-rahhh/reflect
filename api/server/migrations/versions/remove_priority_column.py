"""remove_priority_column

Revision ID: remove_priority_column
Revises: add_missing_columns
Create Date: 2025-08-21 19:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = 'remove_priority_column'
down_revision: Union[str, Sequence[str], None] = 'add_missing_columns'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # Remove priority column from feedback table
    op.drop_column('feedback', 'priority')


def downgrade() -> None:
    """Downgrade schema."""
    # Add back priority column to feedback table
    op.add_column('feedback', sa.Column('priority', sa.Enum('LOW', 'MEDIUM', 'HIGH', 'CRITICAL', name='feedbackpriority'), nullable=True, default='MEDIUM'))
