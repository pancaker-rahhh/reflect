"""merge_widget_position_and_usage_tracking_heads

Revision ID: cdafdbe5b1d0
Revises: 5f028e3852a1, add_usage_tracking_triggers
Create Date: 2025-09-08 20:17:50.692629

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'cdafdbe5b1d0'
down_revision: Union[str, Sequence[str], None] = ('5f028e3852a1', 'add_usage_tracking_triggers')
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass
