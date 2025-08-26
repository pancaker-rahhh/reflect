"""empty message

Revision ID: 868166a203cb
Revises: a9bb8977e47a, c9782f68dfc9
Create Date: 2025-08-24 13:49:53.512149

"""
from typing import Sequence, Union


# revision identifiers, used by Alembic.
revision: str = '868166a203cb'
down_revision: Union[str, Sequence[str], None] = ('a9bb8977e47a', 'c9782f68dfc9')
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass
