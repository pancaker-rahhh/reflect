"""restore_usage_tracking_table

Revision ID: 465aa0ee5903
Revises: dd86d626b297
Create Date: 2025-10-02 21:31:29.277060

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


# revision identifiers, used by Alembic.
revision: str = '465aa0ee5903'
down_revision: Union[str, Sequence[str], None] = 'dd86d626b297'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # Create the usage_tracking table
    op.create_table(
        'usage_tracking',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('organization_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('resource_type', sa.String(50), nullable=False),
        sa.Column('usage_count', sa.Integer(), nullable=False, server_default='0'),
        sa.Column(
            'period_start',
            postgresql.TIMESTAMP(timezone=True),
            nullable=False,
            server_default=sa.text("date_trunc('month'::text, now())"),
        ),
        sa.Column(
            'created_at',
            postgresql.TIMESTAMP(timezone=True),
            nullable=False,
            server_default=sa.text('now()'),
        ),
        sa.Column(
            'updated_at',
            postgresql.TIMESTAMP(timezone=True),
            nullable=False,
            server_default=sa.text('now()'),
        ),
        sa.ForeignKeyConstraint(
            ['organization_id'],
            ['organizations.id'],
            name='usage_tracking_organization_id_fkey',
            ondelete='CASCADE',
        ),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint(
            'organization_id',
            'resource_type',
            'period_start',
            name='uq_usage_tracking',
        ),
    )

    # Create indexes
    op.create_index(
        'ix_usage_tracking_organization_id', 'usage_tracking', ['organization_id']
    )
    op.create_index(
        'ix_usage_tracking_resource_type', 'usage_tracking', ['resource_type']
    )
    op.create_index(
        'ix_usage_tracking_period_start', 'usage_tracking', ['period_start']
    )


def downgrade() -> None:
    """Downgrade schema."""
    # Drop the usage_tracking table
    op.drop_index('ix_usage_tracking_period_start', table_name='usage_tracking')
    op.drop_index('ix_usage_tracking_resource_type', table_name='usage_tracking')
    op.drop_index('ix_usage_tracking_organization_id', table_name='usage_tracking')
    op.drop_table('usage_tracking')
