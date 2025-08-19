"""replace_timezone_with_country

Revision ID: f9a8b7c6d5e4
Revises: e436f1776c02
Create Date: 2024-01-01 00:00:00.000000

"""

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'f9a8b7c6d5e4'
down_revision = 'e436f1776c02'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Add country column
    op.add_column('users', sa.Column('country', sa.String(length=2), nullable=True))

    # Remove timezone and phone columns
    op.drop_column('users', 'timezone')
    op.drop_column('users', 'phone')


def downgrade() -> None:
    # Add timezone and phone columns back
    op.add_column(
        'users',
        sa.Column(
            'timezone', sa.String(length=50), nullable=False, server_default='UTC'
        ),
    )
    op.add_column('users', sa.Column('phone', sa.String(length=50), nullable=True))

    # Remove country column
    op.drop_column('users', 'country')
