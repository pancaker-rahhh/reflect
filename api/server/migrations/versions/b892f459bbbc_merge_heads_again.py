"""merge_heads_again

Revision ID: b892f459bbbc
Revises: 55816f2cd77f, a1b2c3d4e5f6
Create Date: 2025-08-20 18:55:50.798429

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'b892f459bbbc'
down_revision: Union[str, Sequence[str], None] = '55816f2cd77f'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass
