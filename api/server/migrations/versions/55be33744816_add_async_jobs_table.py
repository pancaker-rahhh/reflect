"""add_async_jobs_table

Revision ID: 55be33744816
Revises: 923f5c3fd9d3
Create Date: 2025-07-19 18:21:06.064038

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '55be33744816'
down_revision: Union[str, None] = '923f5c3fd9d3'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Enable uuid-ossp extension for uuid_generate_v4()
    op.execute('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"')

    # Create jobs table for async task tracking
    op.create_table(
        'jobs',
        sa.Column(
            'id',
            sa.UUID(),
            primary_key=True,
            server_default=sa.text('uuid_generate_v4()'),
        ),
        sa.Column('type', sa.String(50), nullable=False),
        sa.Column(
            'status', sa.String(20), nullable=False, server_default=sa.text("'pending'")
        ),
        sa.Column(
            'progress', sa.Integer(), nullable=False, server_default=sa.text('0')
        ),
        sa.Column('message', sa.Text(), nullable=True),
        sa.Column('payload', sa.JSON(), nullable=True),
        sa.Column('result', sa.JSON(), nullable=True),
        sa.Column('error', sa.Text(), nullable=True),
        sa.Column(
            'created_at',
            sa.DateTime(),
            nullable=False,
            server_default=sa.text('CURRENT_TIMESTAMP'),
        ),
        sa.Column(
            'updated_at',
            sa.DateTime(),
            nullable=False,
            server_default=sa.text('CURRENT_TIMESTAMP'),
        ),
        sa.Column('completed_at', sa.DateTime(), nullable=True),
        sa.Column('user_id', sa.UUID(), nullable=True),
        sa.Column('form_id', sa.UUID(), nullable=True),
        sa.ForeignKeyConstraint(['form_id'], ['forms.id'], ondelete='CASCADE'),
    )

    # Create indexes for efficient querying
    op.create_index('idx_jobs_status_type', 'jobs', ['status', 'type'])
    op.create_index('idx_jobs_form_id', 'jobs', ['form_id'])
    op.create_index('idx_jobs_user_id', 'jobs', ['user_id'])
    op.create_index('idx_jobs_created_at', 'jobs', ['created_at'])

    # Add fields_generation_status to forms table
    op.add_column(
        'forms',
        sa.Column(
            'fields_generation_status',
            sa.String(20),
            nullable=False,
            server_default=sa.text("'pending'"),
        ),
    )


def downgrade() -> None:
    # Remove column from forms table
    op.drop_column('forms', 'fields_generation_status')

    # Drop indexes
    op.drop_index('idx_jobs_created_at', 'jobs')
    op.drop_index('idx_jobs_user_id', 'jobs')
    op.drop_index('idx_jobs_form_id', 'jobs')
    op.drop_index('idx_jobs_status_type', 'jobs')

    # Drop jobs table
    op.drop_table('jobs')
