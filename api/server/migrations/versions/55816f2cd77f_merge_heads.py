"""merge_heads

Revision ID: 55816f2cd77f
Revises: dc0e065916f2, f9a8b7c6d5e4
Create Date: 2025-08-20 00:51:55.704305

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '55816f2cd77f'
down_revision: Union[str, Sequence[str], None] = ('dc0e065916f2', 'f9a8b7c6d5e4')
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass
