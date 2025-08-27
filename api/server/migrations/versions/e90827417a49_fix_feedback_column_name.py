"""fix_feedback_column_name

Revision ID: e90827417a49
Revises: 84dc0f497ff3
Create Date: 2025-08-27 18:15:23.356388

"""
from typing import Sequence, Union

from alembic import op


# revision identifiers, used by Alembic.
revision: str = 'e90827417a49'
down_revision: Union[str, Sequence[str], None] = '84dc0f497ff3'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Rename the column to remove the trailing space
    op.execute(
        'ALTER TABLE feedback RENAME COLUMN "converted_to_action_item_id " TO converted_to_action_item_id'
    )


def downgrade() -> None:
    # Revert the change
    op.execute(
        'ALTER TABLE feedback RENAME COLUMN converted_to_action_item_id TO "converted_to_action_item_id "'
    )
