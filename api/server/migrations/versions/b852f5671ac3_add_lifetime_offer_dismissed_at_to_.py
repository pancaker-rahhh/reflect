"""add_lifetime_offer_dismissed_at_to_organizations

Revision ID: b852f5671ac3
Revises: bb2c08cb87aa
Create Date: 2025-11-13 00:11:04.109731

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'b852f5671ac3'
down_revision: Union[str, Sequence[str], None] = 'bb2c08cb87aa'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.add_column(
        'organizations',
        sa.Column(
            'lifetime_offer_dismissed_at', sa.DateTime(timezone=True), nullable=True
        ),
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_column('organizations', 'lifetime_offer_dismissed_at')
