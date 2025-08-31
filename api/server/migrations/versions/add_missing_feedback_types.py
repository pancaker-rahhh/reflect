"""add_missing_feedback_types

Revision ID: add_missing_feedback_types
Revises: 49b840f8caea
Create Date: 2025-08-31 19:01:04.070036

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = 'add_missing_feedback_types'
down_revision: Union[str, Sequence[str], None] = '49b840f8caea'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Add missing feedback types to the enum."""
    # Add new enum values to the feedbacktype enum
    # Use IF NOT EXISTS to avoid errors if values already exist
    op.execute("ALTER TYPE feedbacktype ADD VALUE IF NOT EXISTS 'ces'")
    op.execute("ALTER TYPE feedbacktype ADD VALUE IF NOT EXISTS 'csat'")
    op.execute("ALTER TYPE feedbacktype ADD VALUE IF NOT EXISTS 'nps'")


def downgrade() -> None:
    """Remove the new feedback types from the enum."""
    # Note: PostgreSQL doesn't support removing enum values directly
    # This would require recreating the enum type, which is complex
    # For now, we'll leave the values in place
    pass
