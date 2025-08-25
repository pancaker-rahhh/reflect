"""add_all_values_to_feedbacktype_enum

Revision ID: c9782f68dfc9
Revises: 73238fea42a8
Create Date: 2025-08-24 13:25:00.123456

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

# IMPORTANT: You must import your actual FeedbackType enum from your models
from app.models.feedback_model import FeedbackType


# revision identifiers, used by Alembic.
revision: str = 'c9782f68dfc9'
down_revision: Union[str, Sequence[str], None] = '73238fea42a8'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

# The name of the ENUM type in PostgreSQL.
ENUM_NAME = 'feedbacktype'
TEMP_ENUM_NAME = f'_{ENUM_NAME}'

# Get all the values from your Python Enum (which are lowercase)
enum_values = [e.value for e in FeedbackType]


def upgrade() -> None:
    """
    Safely updates the feedbacktype ENUM by creating a new type, converting
    existing data (including handling case changes), and swapping the types.
    """
    # Get the existing values from the database enum
    bind = op.get_bind()
    result = bind.execute(
        sa.text(f'SELECT unnest(enum_range(NULL::{ENUM_NAME}))::text')
    ).fetchall()
    db_enum_values = {row[0] for row in result}

    # If all values are already present and are lowercase, do nothing.
    if set(enum_values) <= db_enum_values:
        print(
            f"All values for '{ENUM_NAME}' already exist and are in the correct case. Skipping."
        )
        return

    # Create a new temporary enum with all the correct lowercase values
    op.execute(
        f"CREATE TYPE {TEMP_ENUM_NAME} AS ENUM({', '.join(f''' '{v}' ''' for v in enum_values)})"
    )

    # <-- THE ONLY CHANGE IS IN THIS COMMAND -->
    # Alter the column to use the new temporary enum type, converting existing data to lowercase
    op.execute(
        f'ALTER TABLE feedback ALTER COLUMN feedback_type TYPE {TEMP_ENUM_NAME} '
        f'USING lower(feedback_type::text)::{TEMP_ENUM_NAME}'
    )

    # Drop the old enum type
    op.execute(f'DROP TYPE {ENUM_NAME}')

    # Rename the new enum type to the original name
    op.execute(f'ALTER TYPE {TEMP_ENUM_NAME} RENAME TO {ENUM_NAME}')

    print(
        f"Successfully updated ENUM '{ENUM_NAME}' with all values and converted existing data to lowercase."
    )


def downgrade() -> None:
    # Downgrading is complex and not recommended.
    pass
