"""merge_usage_tracking_and_widget_position_heads

Revision ID: 9473cb242f82
Revises: 5f028e3852a1, add_usage_tracking_triggers
Create Date: 2025-09-07 19:12:45.493102

"""
from typing import Sequence, Union


# revision identifiers, used by Alembic.
revision: str = '9473cb242f82'
down_revision: Union[str, Sequence[str], None] = (
    '5f028e3852a1',
    'add_usage_tracking_triggers',
)
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass
