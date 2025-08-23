"""merge_all_heads_post widget flow

Revision ID: 5be8741c7307
Revises: 7dc12f41798b
Create Date: 2025-08-23 16:14:54.845804

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '5be8741c7307'
down_revision: Union[str, Sequence[str], None] = '7dc12f41798b'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass
