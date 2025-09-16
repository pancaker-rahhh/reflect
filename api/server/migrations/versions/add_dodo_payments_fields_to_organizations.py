"""Add Dodo Payments fields to organizations

Revision ID: add_dodo_payments_fields
Revises: 02100675dbc4
Create Date: 2024-01-15 10:00:00.000000

"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = 'add_dodo_payments_fields'
down_revision = '02100675dbc4'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Add Dodo Payments fields to organizations table
    op.add_column(
        'organizations',
        sa.Column('dodo_subscription_id', sa.String(length=255), nullable=True),
    )
    op.add_column(
        'organizations',
        sa.Column('dodo_customer_id', sa.String(length=255), nullable=True),
    )
    op.add_column(
        'organizations',
        sa.Column('payment_status', sa.String(length=50), nullable=True),
    )
    op.add_column(
        'organizations',
        sa.Column('last_payment_date', sa.DateTime(timezone=True), nullable=True),
    )
    op.add_column(
        'organizations',
        sa.Column(
            'payment_metadata', postgresql.JSON(astext_type=sa.Text()), nullable=True
        ),
    )

    # Add indexes for performance
    op.create_index(
        'ix_organizations_dodo_subscription_id',
        'organizations',
        ['dodo_subscription_id'],
    )


def downgrade() -> None:
    # Remove indexes
    op.drop_index('ix_organizations_dodo_subscription_id', table_name='organizations')

    # Remove columns
    op.drop_column('organizations', 'payment_metadata')
    op.drop_column('organizations', 'last_payment_date')
    op.drop_column('organizations', 'payment_status')
    op.drop_column('organizations', 'dodo_customer_id')
    op.drop_column('organizations', 'dodo_subscription_id')

