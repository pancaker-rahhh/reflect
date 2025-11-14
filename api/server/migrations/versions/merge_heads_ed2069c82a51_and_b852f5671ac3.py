"""merge heads ed2069c82a51 and b852f5671ac3

Revision ID: merge_heads_lifetime_and_widget
Revises: ed2069c82a51, b852f5671ac3
Create Date: 2025-11-14 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'merge_heads_lifetime_and_widget'
down_revision: Union[str, Sequence[str], None] = ('ed2069c82a51', 'b852f5671ac3')
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Merge migrations - no schema changes needed."""
    pass


def downgrade() -> None:
    """Merge migrations - no schema changes needed."""
    pass
