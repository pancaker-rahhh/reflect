"""Merge heads before removing title field

Revision ID: 94aa05a54b07
Revises: 465aa0ee5903, 79c8dc0992de
Create Date: 2025-10-05 13:01:38.055976

"""
from typing import Sequence, Union


# revision identifiers, used by Alembic.
revision: str = '94aa05a54b07'
down_revision: Union[str, Sequence[str], None] = ('465aa0ee5903', '79c8dc0992de')
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass
