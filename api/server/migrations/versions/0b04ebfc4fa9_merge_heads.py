"""merge_heads

Revision ID: 0b04ebfc4fa9
Revises: add_integration_constraints, f0d1933c030f
Create Date: 2025-09-05 14:54:20.784081

"""
from typing import Sequence, Union


# revision identifiers, used by Alembic.
revision: str = '0b04ebfc4fa9'
down_revision: Union[str, Sequence[str], None] = (
    'add_integration_constraints',
    'f0d1933c030f',
)
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass
