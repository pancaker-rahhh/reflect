"""remove_unnecessary_feedback_columns

Revision ID: 49b840f8caea
Revises: e90827417a49
Create Date: 2025-08-31 18:40:17.109243

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '49b840f8caea'
down_revision: Union[str, Sequence[str], None] = 'e90827417a49'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # Remove unnecessary columns that aren't needed for widget feedback
    op.drop_column('feedback', 'assigned_to_user_id')
    op.drop_column('feedback', 'resolved_at')
    op.drop_column('feedback', 'resolution_notes')
    op.drop_column('feedback', 'resolved_by_user_id')


def downgrade() -> None:
    """Downgrade schema."""
    # Re-add the removed columns
    op.add_column(
        'feedback', sa.Column('assigned_to_user_id', sa.UUID(), nullable=True)
    )
    op.add_column('feedback', sa.Column('resolved_at', sa.DateTime(), nullable=True))
    op.add_column('feedback', sa.Column('resolution_notes', sa.Text(), nullable=True))
    op.add_column(
        'feedback', sa.Column('resolved_by_user_id', sa.UUID(), nullable=True)
    )
