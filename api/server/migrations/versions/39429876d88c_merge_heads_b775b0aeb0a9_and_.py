"""merge_heads_b775b0aeb0a9_and_e6dd4442b88a

Revision ID: 39429876d88c
Revises: b775b0aeb0a9, e6dd4442b88a
Create Date: 2025-08-27 16:09:41.056910

"""
from typing import Sequence, Union


# revision identifiers, used by Alembic.
revision: str = '39429876d88c'
down_revision: Union[str, Sequence[str], None] = ('b775b0aeb0a9', 'e6dd4442b88a')
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass
