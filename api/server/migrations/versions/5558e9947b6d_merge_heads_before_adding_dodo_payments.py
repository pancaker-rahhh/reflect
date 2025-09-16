"""merge heads before adding dodo payments

Revision ID: 5558e9947b6d
Revises: 9473cb242f82, cdafdbe5b1d0, add_dodo_payments_fields
Create Date: 2025-09-12 22:58:31.489430

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '5558e9947b6d'
down_revision: Union[str, Sequence[str], None] = ('9473cb242f82', 'cdafdbe5b1d0', 'add_dodo_payments_fields')
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass
