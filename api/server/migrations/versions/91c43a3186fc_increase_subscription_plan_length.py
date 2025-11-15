"""increase_subscription_plan_length

Revision ID: 91c43a3186fc
Revises: merge_heads_lifetime_and_widget
Create Date: 2025-11-15 18:53:08.848890

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '91c43a3186fc'
down_revision: Union[str, Sequence[str], None] = 'merge_heads_lifetime_and_widget'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # Increase subscription_plan column length from 11 to 20 characters
    # to accommodate 'pro_lifetime' (12 chars) and future plan names
    op.alter_column(
        'organizations',
        'subscription_plan',
        type_=sa.String(20),
        existing_type=sa.String(11),
        existing_nullable=False
    )


def downgrade() -> None:
    """Downgrade schema."""
    # Revert back to original length
    op.alter_column(
        'organizations',
        'subscription_plan',
        type_=sa.String(11),
        existing_type=sa.String(20),
        existing_nullable=False
    )
