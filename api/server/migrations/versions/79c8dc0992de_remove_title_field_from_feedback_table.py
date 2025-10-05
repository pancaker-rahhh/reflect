"""Remove title field from feedback table

Revision ID: 79c8dc0992de
Revises: 465aa0ee5903
Create Date: 2025-10-05 12:58:54.331753

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '79c8dc0992de'
down_revision: Union[str, Sequence[str], None] = 'dd86d626b297'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.drop_column('feedback', 'title')


def downgrade() -> None:
    op.add_column('feedback', sa.Column('title', sa.String(500), nullable=True))
