"""merge subscription and widget enum heads

Revision ID: 02100675dbc4
Revises: add_subscription_usage, 578a055dbf2f
Create Date: 2025-09-06 11:48:27.434952

"""
from typing import Sequence, Union


# revision identifiers, used by Alembic.
revision: str = '02100675dbc4'
down_revision: Union[str, Sequence[str], None] = (
    'add_subscription_usage',
    '578a055dbf2f',
)
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass
