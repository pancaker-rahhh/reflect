"""Add integration constraints and indexes

Revision ID: add_integration_constraints
Revises: 9bafe7731a2e
Create Date: 2025-01-27 10:00:00.000000

"""
from typing import Sequence, Union

from alembic import op

# revision identifiers, used by Alembic.
revision: str = 'add_integration_constraints'
down_revision: Union[str, Sequence[str], None] = '9bafe7731a2e'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Add integration constraints and indexes."""

    # Add unique constraint for integration_id + external_id
    op.create_unique_constraint(
        'uq_integration_external_id',
        'roadmap_action_item_integrations',
        ['integration_id', 'external_id'],
    )

    # Add indexes for better query performance
    op.create_index(
        'idx_action_item_integration_sync_status',
        'roadmap_action_item_integrations',
        ['sync_status'],
    )

    op.create_index(
        'idx_action_item_integration_last_synced',
        'roadmap_action_item_integrations',
        ['last_synced_at'],
    )


def downgrade() -> None:
    """Remove integration constraints and indexes."""

    # Remove indexes
    op.drop_index(
        'idx_action_item_integration_last_synced', 'roadmap_action_item_integrations'
    )
    op.drop_index(
        'idx_action_item_integration_sync_status', 'roadmap_action_item_integrations'
    )

    # Remove unique constraint
    op.drop_constraint(
        'uq_integration_external_id', 'roadmap_action_item_integrations', type_='unique'
    )
