"""merge_heads

Revision ID: a234bcdb1baa
Revises: add_integration_constraints, f0d1933c030f
Create Date: 2025-09-05 09:16:23.685253

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'a234bcdb1baa'
down_revision: Union[str, Sequence[str], None] = ('add_integration_constraints', 'f0d1933c030f')
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass
