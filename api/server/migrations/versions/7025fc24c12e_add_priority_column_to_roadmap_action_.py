"""Add priority column to roadmap_action_items

Revision ID: 7025fc24c12e
Revises: 94aa05a54b07
Create Date: 2025-10-05 13:41:59.115323

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '7025fc24c12e'
down_revision: Union[str, Sequence[str], None] = '94aa05a54b07'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        'roadmap_action_items',
        sa.Column('priority', sa.String(length=20), nullable=True),
    )


def downgrade() -> None:
    op.drop_column('roadmap_action_items', 'priority')
