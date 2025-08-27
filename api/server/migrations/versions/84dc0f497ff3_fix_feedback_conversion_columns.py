"""fix_feedback_conversion_columns

Revision ID: 84dc0f497ff3
Revises: 39429876d88c
Create Date: 2025-08-27 16:17:00.612641

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = '84dc0f497ff3'
down_revision: Union[str, Sequence[str], None] = '39429876d88c'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # Add the missing columns to feedback table
    op.add_column(
        'feedback', sa.Column('converted_to_action_item_id', sa.UUID(), nullable=True)
    )
    op.add_column(
        'feedback', sa.Column('conversion_date', sa.DateTime(), nullable=True)
    )
    op.add_column('feedback', sa.Column('conversion_notes', sa.Text(), nullable=True))
    op.add_column(
        'feedback',
        sa.Column('is_actionable', sa.Boolean(), default=True, nullable=True),
    )

    # Create foreign key constraint to roadmap_action_items table
    op.create_foreign_key(
        'feedback_converted_to_action_item_id_fkey',
        'feedback',
        'roadmap_action_items',
        ['converted_to_action_item_id'],
        ['id'],
    )


def downgrade() -> None:
    """Downgrade schema."""
    # Drop foreign key constraint
    op.drop_constraint(
        'feedback_converted_to_action_item_id_fkey', 'feedback', type_='foreignkey'
    )

    # Drop the columns
    op.drop_column('feedback', 'is_actionable')
    op.drop_column('feedback', 'conversion_notes')
    op.drop_column('feedback', 'conversion_date')
    op.drop_column('feedback', 'converted_to_action_item_id')
