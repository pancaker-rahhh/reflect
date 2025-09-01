"""fix_feedback_conversion_columns

Revision ID: 84dc0f497ff3
Revises: 39429876d88c
Create Date: 2025-08-27 16:17:00.612641

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = '84dc0f497ff3'
down_revision: Union[str, Sequence[str], None] = '39429876d88c'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # Check if columns already exist before adding them
    connection = op.get_bind()
    inspector = sa.inspect(connection)
    existing_columns = [col['name'] for col in inspector.get_columns('feedback')]
    existing_tables = inspector.get_table_names()

    # Add the missing columns to feedback table only if they don't exist
    # Note: Using the exact column name from the previous migration (with trailing space)
    if 'converted_to_action_item_id ' not in existing_columns:
        op.add_column(
            'feedback',
            sa.Column('converted_to_action_item_id ', sa.UUID(), nullable=True),
        )

    if 'conversion_date' not in existing_columns:
        op.add_column(
            'feedback', sa.Column('conversion_date', sa.DateTime(), nullable=True)
        )

    if 'conversion_notes' not in existing_columns:
        op.add_column(
            'feedback', sa.Column('conversion_notes', sa.Text(), nullable=True)
        )

    if 'is_actionable' not in existing_columns:
        op.add_column(
            'feedback',
            sa.Column('is_actionable', sa.Boolean(), default=True, nullable=True),
        )

    # Create foreign key constraint to roadmap_action_items table only if both the column and table exist
    if (
        'converted_to_action_item_id ' not in existing_columns
        and 'roadmap_action_items' in existing_tables
    ):
        op.create_foreign_key(
            'feedback_converted_to_action_item_id_fkey',
            'feedback',
            'roadmap_action_items',
            ['converted_to_action_item_id '],
            ['id'],
        )


def downgrade() -> None:
    """Downgrade schema."""
    # Drop foreign key constraint if it exists
    try:
        op.drop_constraint(
            'feedback_converted_to_action_item_id_fkey', 'feedback', type_='foreignkey'
        )
    except:
        pass  # Constraint might not exist

    # Drop the columns if they exist
    connection = op.get_bind()
    inspector = sa.inspect(connection)
    existing_columns = [col['name'] for col in inspector.get_columns('feedback')]

    if 'is_actionable' in existing_columns:
        op.drop_column('feedback', 'is_actionable')
    if 'conversion_notes' in existing_columns:
        op.drop_column('feedback', 'conversion_notes')
    if 'conversion_date' in existing_columns:
        op.drop_column('feedback', 'conversion_date')
    if 'converted_to_action_item_id ' in existing_columns:
        op.drop_column('feedback', 'converted_to_action_item_id ')
