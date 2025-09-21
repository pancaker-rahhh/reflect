"""create_usage_tracking_table_fix

Revision ID: 4c82491b0d56
Revises: e67a81dbb6b7
Create Date: 2025-09-21 13:13:34.724096

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


# revision identifiers, used by Alembic.
revision: str = '4c82491b0d56'
down_revision: Union[str, Sequence[str], None] = 'e67a81dbb6b7'
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
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.text("DATE_TRUNC('month', NOW())"),
        ),
        sa.Column(
            'created_at',
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.func.now(),
        ),
        sa.Column(
            'updated_at',
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.func.now(),
        ),
        sa.ForeignKeyConstraint(
            ['organization_id'], ['organizations.id'], ondelete='CASCADE'
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
