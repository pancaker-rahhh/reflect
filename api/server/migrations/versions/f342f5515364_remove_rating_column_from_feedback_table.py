"""remove_rating_column_from_feedback_table

Revision ID: f342f5515364
Revises: 7025fc24c12e
Create Date: 2025-10-24 22:42:18.251125

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'f342f5515364'
down_revision: Union[str, Sequence[str], None] = '7025fc24c12e'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.drop_column('feedback', 'rating')


def downgrade() -> None:
    """Downgrade schema."""
    op.add_column('feedback', sa.Column('rating', sa.Integer(), nullable=True))
