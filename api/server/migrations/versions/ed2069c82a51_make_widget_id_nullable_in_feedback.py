"""make_widget_id_nullable_in_feedback

Revision ID: ed2069c82a51
Revises: 42c53ef24e6d
Create Date: 2025-11-12 00:04:22.386464

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'ed2069c82a51'
down_revision: Union[str, Sequence[str], None] = '42c53ef24e6d'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.alter_column('feedback', 'widget_id', nullable=True, existing_type=sa.UUID())


def downgrade() -> None:
    op.alter_column('feedback', 'widget_id', nullable=False, existing_type=sa.UUID())
