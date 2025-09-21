"""merge_heads_resolve_usage_tracking_conflict

Revision ID: e67a81dbb6b7
Revises: 006e2993166e, f2de67bb06ee
Create Date: 2025-09-21 12:56:17.246165

"""
from typing import Sequence, Union


# revision identifiers, used by Alembic.
revision: str = 'e67a81dbb6b7'
down_revision: Union[str, Sequence[str], None] = ('006e2993166e', 'f2de67bb06ee')
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass
