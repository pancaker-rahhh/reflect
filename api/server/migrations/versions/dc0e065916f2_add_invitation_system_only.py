"""add_invitation_system_only

Revision ID: dc0e065916f2
Revises: e436f1776c02
Create Date: 2025-08-17 22:55:35.874465

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = 'dc0e065916f2'
down_revision: Union[str, Sequence[str], None] = 'e436f1776c02'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""

    # Create invitation_tasks table
    op.create_table(
        'invitation_tasks',
        sa.Column('id', sa.String(), nullable=False),
        sa.Column('user_id', sa.UUID(), nullable=False),
        sa.Column('organization_id', sa.UUID(), nullable=True),
        sa.Column('total_count', sa.Integer(), nullable=False),
        sa.Column('processed_count', sa.Integer(), nullable=True, server_default='0'),
        sa.Column('success_count', sa.Integer(), nullable=True, server_default='0'),
        sa.Column('failed_count', sa.Integer(), nullable=True, server_default='0'),
        sa.Column(
            'status',
            sa.Enum('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', name='taskstatus'),
            nullable=False,
            server_default='PENDING',
        ),
        sa.Column('results', sa.JSON(), nullable=True),
        sa.Column('error', sa.String(), nullable=True),
        sa.Column('completed_at', sa.DateTime(), nullable=True),
        sa.Column(
            'created_at',
            sa.DateTime(timezone=True),
            server_default=sa.text('now()'),
            nullable=False,
        ),
        sa.Column(
            'updated_at',
            sa.DateTime(timezone=True),
            server_default=sa.text('now()'),
            nullable=False,
        ),
        sa.ForeignKeyConstraint(
            ['organization_id'], ['organizations.id'], ondelete='CASCADE'
        ),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index(
        op.f('ix_invitation_tasks_created_at'),
        'invitation_tasks',
        ['created_at'],
        unique=False,
    )
    op.create_index(
        op.f('ix_invitation_tasks_updated_at'),
        'invitation_tasks',
        ['updated_at'],
        unique=False,
    )

    # Create invitations table
    op.create_table(
        'invitations',
        sa.Column('email', sa.String(), nullable=False),
        sa.Column('role', sa.String(), nullable=False),
        sa.Column('organization_id', sa.UUID(), nullable=True),
        sa.Column('project_id', sa.UUID(), nullable=True),
        sa.Column('invited_by', sa.UUID(), nullable=False),
        sa.Column('token', sa.String(), nullable=False),
        sa.Column(
            'status',
            sa.Enum(
                'PENDING', 'ACCEPTED', 'EXPIRED', 'CANCELLED', name='invitationstatus'
            ),
            nullable=False,
            server_default='PENDING',
        ),
        sa.Column('expires_at', sa.DateTime(), nullable=False),
        sa.Column('accepted_at', sa.DateTime(), nullable=True),
        sa.Column('accepted_by', sa.UUID(), nullable=True),
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column(
            'created_at',
            sa.DateTime(timezone=True),
            server_default=sa.text('now()'),
            nullable=False,
        ),
        sa.Column(
            'updated_at',
            sa.DateTime(timezone=True),
            server_default=sa.text('now()'),
            nullable=False,
        ),
        sa.Column('deleted_at', sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(['accepted_by'], ['users.id'], ondelete='SET NULL'),
        sa.ForeignKeyConstraint(['invited_by'], ['users.id'], ondelete='SET NULL'),
        sa.ForeignKeyConstraint(
            ['organization_id'], ['organizations.id'], ondelete='CASCADE'
        ),
        sa.ForeignKeyConstraint(['project_id'], ['projects.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index(
        op.f('ix_invitations_created_at'), 'invitations', ['created_at'], unique=False
    )
    op.create_index(
        op.f('ix_invitations_deleted_at'), 'invitations', ['deleted_at'], unique=False
    )
    op.create_index(
        op.f('ix_invitations_email'), 'invitations', ['email'], unique=False
    )
    op.create_index(op.f('ix_invitations_id'), 'invitations', ['id'], unique=False)
    op.create_index(op.f('ix_invitations_token'), 'invitations', ['token'], unique=True)
    op.create_index(
        op.f('ix_invitations_updated_at'), 'invitations', ['updated_at'], unique=False
    )

    # Create pending_members table
    op.create_table(
        'pending_members',
        sa.Column('email', sa.String(), nullable=False),
        sa.Column('name', sa.String(), nullable=True),
        sa.Column('role', sa.String(), nullable=False),
        sa.Column('organization_id', sa.UUID(), nullable=True),
        sa.Column('project_id', sa.UUID(), nullable=True),
        sa.Column('invitation_id', sa.UUID(), nullable=False),
        sa.Column('added_by', sa.UUID(), nullable=False),
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column(
            'created_at',
            sa.DateTime(timezone=True),
            server_default=sa.text('now()'),
            nullable=False,
        ),
        sa.Column(
            'updated_at',
            sa.DateTime(timezone=True),
            server_default=sa.text('now()'),
            nullable=False,
        ),
        sa.Column('deleted_at', sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(['added_by'], ['users.id'], ondelete='SET NULL'),
        sa.ForeignKeyConstraint(
            ['invitation_id'], ['invitations.id'], ondelete='CASCADE'
        ),
        sa.ForeignKeyConstraint(
            ['organization_id'], ['organizations.id'], ondelete='CASCADE'
        ),
        sa.ForeignKeyConstraint(['project_id'], ['projects.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index(
        op.f('ix_pending_members_created_at'),
        'pending_members',
        ['created_at'],
        unique=False,
    )
    op.create_index(
        op.f('ix_pending_members_deleted_at'),
        'pending_members',
        ['deleted_at'],
        unique=False,
    )
    op.create_index(
        op.f('ix_pending_members_email'), 'pending_members', ['email'], unique=False
    )
    op.create_index(
        op.f('ix_pending_members_id'), 'pending_members', ['id'], unique=False
    )
    op.create_index(
        op.f('ix_pending_members_updated_at'),
        'pending_members',
        ['updated_at'],
        unique=False,
    )


def downgrade() -> None:
    """Downgrade schema."""

    # Drop invitation tables
    op.drop_index(op.f('ix_pending_members_updated_at'), table_name='pending_members')
    op.drop_index(op.f('ix_pending_members_id'), table_name='pending_members')
    op.drop_index(op.f('ix_pending_members_email'), table_name='pending_members')
    op.drop_index(op.f('ix_pending_members_deleted_at'), table_name='pending_members')
    op.drop_index(op.f('ix_pending_members_created_at'), table_name='pending_members')
    op.drop_table('pending_members')

    op.drop_index(op.f('ix_invitations_updated_at'), table_name='invitations')
    op.drop_index(op.f('ix_invitations_token'), table_name='invitations')
    op.drop_index(op.f('ix_invitations_id'), table_name='invitations')
    op.drop_index(op.f('ix_invitations_email'), table_name='invitations')
    op.drop_index(op.f('ix_invitations_deleted_at'), table_name='invitations')
    op.drop_index(op.f('ix_invitations_created_at'), table_name='invitations')
    op.drop_table('invitations')

    op.drop_index(op.f('ix_invitation_tasks_updated_at'), table_name='invitation_tasks')
    op.drop_index(op.f('ix_invitation_tasks_created_at'), table_name='invitation_tasks')
    op.drop_table('invitation_tasks')

    # Drop enum types
    op.execute('DROP TYPE IF EXISTS taskstatus CASCADE')
    op.execute('DROP TYPE IF EXISTS invitationstatus CASCADE')