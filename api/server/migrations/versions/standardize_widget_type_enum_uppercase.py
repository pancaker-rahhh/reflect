"""standardize_widget_type_enum_uppercase

Revision ID: c1d2e3f4g5h6
Revises: b892f459bbbc
Create Date: 2024-01-01 00:00:00.000000

"""

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'c1d2e3f4g5h6'
down_revision = 'b892f459bbbc'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Add uppercase enum values if they don't exist
    op.execute("ALTER TYPE widgettype ADD VALUE IF NOT EXISTS 'NPS'")
    op.execute("ALTER TYPE widgettype ADD VALUE IF NOT EXISTS 'CSAT'")
    op.execute("ALTER TYPE widgettype ADD VALUE IF NOT EXISTS 'CES'")

    # Update any existing lowercase values to uppercase
    op.execute("UPDATE widgets SET widget_type = 'NPS' WHERE widget_type = 'nps'")
    op.execute("UPDATE widgets SET widget_type = 'CSAT' WHERE widget_type = 'csat'")
    op.execute("UPDATE widgets SET widget_type = 'CES' WHERE widget_type = 'ces'")

    # Note: PostgreSQL doesn't support removing enum values directly without recreating the type
    # The lowercase values will remain in the enum but won't be used


def downgrade() -> None:
    # Revert data back to lowercase
    op.execute("UPDATE widgets SET widget_type = 'nps' WHERE widget_type = 'NPS'")
    op.execute("UPDATE widgets SET widget_type = 'csat' WHERE widget_type = 'CSAT'")
    op.execute("UPDATE widgets SET widget_type = 'ces' WHERE widget_type = 'CES'")
