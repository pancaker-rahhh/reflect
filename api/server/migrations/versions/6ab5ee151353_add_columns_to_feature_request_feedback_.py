"""Add columns to feature_request_feedback table

Revision ID: 6ab5ee151353
Revises: e436f1776c02
Create Date: 2025-08-14 21:33:27.500821

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = '6ab5ee151353'
down_revision: Union[str, Sequence[str], None] = 'e436f1776c02'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

# Define ALL custom ENUM types being created in this migration
mappingtype_enum = sa.Enum(
    'FEEDBACK_TO_ISSUE', 'FEATURE_TO_EPIC', 'PROJECT_TO_PROJECT', name='mappingtype'
)
integrationtype_enum = sa.Enum(
    'JIRA', 'GITHUB', 'LINEAR', 'SLACK', 'DISCORD', 'WEBHOOK', name='integrationtype'
)
integrationstatus_enum = sa.Enum(
    'ACTIVE', 'INACTIVE', 'ERROR', 'PENDING', name='integrationstatus'
)


def upgrade() -> None:
    """Upgrade schema."""
    # Create ALL the custom ENUM types first, before they are used.
    mappingtype_enum.create(op.get_bind(), checkfirst=True)
    integrationtype_enum.create(op.get_bind(), checkfirst=True)
    integrationstatus_enum.create(op.get_bind(), checkfirst=True)

    # --- Begin original Alembic commands with corrections ---
    op.alter_column(
        'bug_report_feedback',
        'severity_level',
        existing_type=postgresql.ENUM(
            'LOW', 'MEDIUM', 'HIGH', 'CRITICAL', name='feedbackpriority'
        ),
        type_=sa.String(length=50),
        existing_nullable=True,
    )
    op.drop_column('bug_report_feedback', 'attachments')
    op.add_column(
        'feedback_forms', sa.Column('form_type', sa.String(length=50), nullable=False)
    )
    op.add_column(
        'integration_mappings',
        sa.Column('mapping_type', mappingtype_enum, nullable=False),
    )
    op.add_column(
        'integration_mappings', sa.Column('internal_id', sa.UUID(), nullable=False)
    )
    op.add_column(
        'integration_mappings',
        sa.Column('external_id', sa.String(length=255), nullable=False),
    )
    op.add_column(
        'integration_mappings',
        sa.Column('external_url', sa.String(length=500), nullable=True),
    )
    op.add_column(
        'integration_mappings',
        sa.Column(
            'mapping_metadata', postgresql.JSONB(astext_type=sa.Text()), nullable=False
        ),
    )
    op.add_column(
        'integration_mappings', sa.Column('is_active', sa.Boolean(), nullable=False)
    )
    op.drop_column('integration_mappings', 'sync_status')
    op.drop_column('integration_mappings', 'external_entity_url')
    op.drop_column('integration_mappings', 'local_entity_id')
    op.drop_column('integration_mappings', 'external_entity_id')
    op.drop_column('integration_mappings', 'entity_type')
    op.add_column(
        'integrations',
        sa.Column('integration_type', integrationtype_enum, nullable=False),
    )
    op.add_column(
        'integrations', sa.Column('status', integrationstatus_enum, nullable=False)
    )
    op.add_column(
        'integrations',
        sa.Column('auth_data', postgresql.JSONB(astext_type=sa.Text()), nullable=False),
    )
    op.add_column(
        'integrations', sa.Column('sync_enabled', sa.Boolean(), nullable=False)
    )
    op.add_column('integrations', sa.Column('error_message', sa.Text(), nullable=True))
    op.add_column('integrations', sa.Column('created_by', sa.UUID(), nullable=False))
    op.create_foreign_key(None, 'integrations', 'users', ['created_by'], ['id'])
    op.drop_column('integrations', 'type')
    # The 'description' column is already created in the first migration, so this line was causing an error.
    # op.add_column('organizations', sa.Column('description', sa.String(), nullable=True))
    op.drop_constraint(
        'organizations_created_by_fkey', 'organizations', type_='foreignkey'
    )
    op.drop_column('organizations', 'created_by')
    op.add_column('review_feedback', sa.Column('pros', sa.Text(), nullable=True))
    op.add_column('review_feedback', sa.Column('cons', sa.Text(), nullable=True))
    op.drop_column('review_feedback', 'reviewer_location')
    op.drop_column('review_feedback', 'moderation_status')
    op.drop_column('review_feedback', 'published_at')
    op.drop_column('review_feedback', 'review_categories')
    op.add_column(
        'webhooks',
        sa.Column('headers', postgresql.JSONB(astext_type=sa.Text()), nullable=True),
    )
    op.add_column('webhooks', sa.Column('status', sa.String(length=50), nullable=True))
    op.add_column('webhooks', sa.Column('secret', sa.String(length=255), nullable=True))
    op.add_column('webhooks', sa.Column('retry_count', sa.Integer(), nullable=True))
    op.add_column('webhooks', sa.Column('timeout_seconds', sa.Integer(), nullable=True))
    op.add_column(
        'webhooks',
        sa.Column('last_triggered_at', sa.DateTime(timezone=True), nullable=True),
    )
    op.add_column(
        'webhooks', sa.Column('last_response_code', sa.Integer(), nullable=True)
    )
    op.add_column('webhooks', sa.Column('error_message', sa.Text(), nullable=True))
    op.add_column('webhooks', sa.Column('created_by', sa.UUID(), nullable=False))
    op.create_foreign_key(None, 'webhooks', 'users', ['created_by'], ['id'])
    op.alter_column(
        'webhooks',
        'url',
        existing_type=sa.TEXT(),
        type_=sa.String(length=500),
        existing_nullable=False,
    )
    op.alter_column(
        'webhooks',
        'events',
        existing_type=postgresql.ARRAY(sa.VARCHAR()),
        type_=postgresql.JSONB(astext_type=sa.Text()),
        existing_nullable=False,
        postgresql_using='to_jsonb(events)',
    )
    op.drop_column('webhooks', 'is_active')
    # ### end Alembic commands ###


def downgrade() -> None:
    """Downgrade schema."""
    # ### commands auto generated by Alembic - please adjust! ###
    op.add_column(
        'webhooks',
        sa.Column('is_active', sa.BOOLEAN(), autoincrement=False, nullable=False),
    )
    op.drop_constraint(None, 'webhooks', type_='foreignkey')
    op.alter_column(
        'webhooks',
        'events',
        existing_type=postgresql.JSONB(astext_type=sa.Text()),
        type_=postgresql.ARRAY(sa.VARCHAR()),
        existing_nullable=False,
        postgresql_using='ARRAY(SELECT jsonb_array_elements_text(events))',
    )
    op.alter_column(
        'webhooks',
        'url',
        existing_type=sa.String(length=500),
        type_=sa.TEXT(),
        existing_nullable=False,
    )
    op.drop_column('webhooks', 'created_by')
    op.drop_column('webhooks', 'error_message')
    op.drop_column('webhooks', 'last_response_code')
    op.drop_column('webhooks', 'last_triggered_at')
    op.drop_column('webhooks', 'timeout_seconds')
    op.drop_column('webhooks', 'retry_count')
    op.drop_column('webhooks', 'secret')
    op.drop_column('webhooks', 'status')
    op.drop_column('webhooks', 'headers')
    op.add_column(
        'review_feedback',
        sa.Column(
            'review_categories',
            postgresql.JSONB(astext_type=sa.Text()),
            autoincrement=False,
            nullable=True,
        ),
    )
    op.add_column(
        'review_feedback',
        sa.Column(
            'published_at', postgresql.TIMESTAMP(), autoincrement=False, nullable=True
        ),
    )
    op.add_column(
        'review_feedback',
        sa.Column(
            'moderation_status',
            sa.VARCHAR(length=50),
            autoincrement=False,
            nullable=True,
        ),
    )
    op.add_column(
        'review_feedback',
        sa.Column(
            'reviewer_location',
            sa.VARCHAR(length=255),
            autoincrement=False,
            nullable=True,
        ),
    )
    op.drop_column('review_feedback', 'cons')
    op.drop_column('review_feedback', 'pros')
    op.add_column(
        'organizations',
        sa.Column('created_by', sa.UUID(), autoincrement=False, nullable=True),
    )
    # op.add_column('organizations', sa.Column('description', sa.VARCHAR(), autoincrement=False, nullable=True))
    op.create_foreign_key(
        'organizations_created_by_fkey',
        'organizations',
        'users',
        ['created_by'],
        ['id'],
    )
    op.add_column(
        'integrations',
        sa.Column('type', sa.VARCHAR(length=50), autoincrement=False, nullable=False),
    )
    op.drop_constraint(None, 'integrations', type_='foreignkey')
    op.drop_column('integrations', 'created_by')
    op.drop_column('integrations', 'error_message')
    op.drop_column('integrations', 'sync_enabled')
    op.drop_column('integrations', 'auth_data')
    op.drop_column('integrations', 'status')
    op.drop_column('integrations', 'integration_type')
    op.add_column(
        'integration_mappings',
        sa.Column('local_entity_id', sa.UUID(), autoincrement=False, nullable=False),
    )
    op.add_column(
        'integration_mappings',
        sa.Column('external_entity_url', sa.TEXT(), autoincrement=False, nullable=True),
    )
    op.add_column(
        'integration_mappings',
        sa.Column(
            'external_entity_id',
            sa.VARCHAR(length=255),
            autoincrement=False,
            nullable=False,
        ),
    )
    op.add_column(
        'integration_mappings',
        sa.Column(
            'entity_type', sa.VARCHAR(length=50), autoincrement=False, nullable=False
        ),
    )
    op.drop_column('integration_mappings', 'is_active')
    op.drop_column('integration_mappings', 'mapping_metadata')
    op.drop_column('integration_mappings', 'external_url')
    op.drop_column('integration_mappings', 'external_id')
    op.drop_column('integration_mappings', 'internal_id')
    op.drop_column('integration_mappings', 'mapping_type')
    op.drop_column('feedback_forms', 'form_type')
    op.add_column(
        'bug_report_feedback',
        sa.Column(
            'attachments',
            postgresql.JSONB(astext_type=sa.Text()),
            autoincrement=False,
            nullable=True,
        ),
    )
    op.alter_column(
        'bug_report_feedback',
        'severity_level',
        existing_type=sa.String(length=50),
        type_=postgresql.ENUM(
            'LOW', 'MEDIUM', 'HIGH', 'CRITICAL', name='feedbackpriority'
        ),
        existing_nullable=True,
    )

    # Drop the custom ENUM types last, in reverse order of creation.
    integrationstatus_enum.drop(op.get_bind(), checkfirst=True)
    integrationtype_enum.drop(op.get_bind(), checkfirst=True)
    mappingtype_enum.drop(op.get_bind(), checkfirst=True)
    # ### end Alembic commands ###
