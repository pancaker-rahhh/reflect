"""add_inactive_status_to_widget_enum

Revision ID: 578a055dbf2f
Revises: 0b04ebfc4fa9
Create Date: 2025-09-05 14:54:41.693402

"""
from typing import Sequence, Union

from alembic import op


# revision identifiers, used by Alembic.
revision: str = '578a055dbf2f'
down_revision: Union[str, Sequence[str], None] = '0b04ebfc4fa9'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.execute("ALTER TYPE widgetstatus ADD VALUE 'inactive'")


def downgrade() -> None:
    """Downgrade schema."""
    op.execute("ALTER TYPE widgetstatus DROP VALUE 'inactive'")
