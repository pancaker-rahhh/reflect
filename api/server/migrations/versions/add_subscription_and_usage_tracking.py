"""Add subscription and usage tracking

Revision ID: add_subscription_usage
Revises: e436f1776c02
Create Date: 2024-01-15 10:00:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision: str = 'add_subscription_usage'
down_revision: Union[str, Sequence[str], None] = 'e436f1776c02'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        'organizations',
        sa.Column(
            'subscription_plan', sa.String(20), nullable=False, server_default='free'
        ),
    )
    op.add_column(
        'organizations',
        sa.Column(
            'subscription_status',
            sa.String(20),
            nullable=False,
            server_default='active',
        ),
    )
    op.add_column(
        'organizations',
        sa.Column('subscription_ends_at', sa.DateTime(timezone=True), nullable=True),
    )

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
            'organization_id', 'resource_type', 'period_start', name='uq_usage_tracking'
        ),
    )

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
    op.drop_index('ix_usage_tracking_period_start', table_name='usage_tracking')
    op.drop_index('ix_usage_tracking_resource_type', table_name='usage_tracking')
    op.drop_index('ix_usage_tracking_organization_id', table_name='usage_tracking')
    op.drop_table('usage_tracking')

    op.drop_column('organizations', 'subscription_ends_at')
    op.drop_column('organizations', 'subscription_status')
    op.drop_column('organizations', 'subscription_plan')
