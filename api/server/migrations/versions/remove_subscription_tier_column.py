"""Remove subscription_tier column from organizations table

Revision ID: remove_subscription_tier
Revises: e436f1776c02
Create Date: 2024-01-15 10:00:00.000000

"""

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'remove_subscription_tier'
down_revision = '5558e9947b6d'
branch_labels = None
depends_on = None


def upgrade():
    """Remove subscription_tier column from organizations table."""
    # Drop the subscription_tier column
    op.drop_column('organizations', 'subscription_tier')


def downgrade():
    """Add back subscription_tier column to organizations table."""
    # Add the subscription_tier column back
    op.add_column(
        'organizations',
        sa.Column(
            'subscription_tier',
            sa.String(length=50),
            nullable=False,
            server_default='free',
        ),
    )
