"""refactor groups into party model

Revision ID: 9627b90026ce
Revises: 55be33744816
Create Date: 2025-07-28 23:28:00.331079

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql
from sqlalchemy.exc import SQLAlchemyError

# revision identifiers, used by Alembic.
revision: str = '9627b90026ce'
down_revision: Union[str, None] = '55be33744816'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Create enum types first
    op.execute("CREATE TYPE partytypeenum AS ENUM ('GROUP', 'COUPLE')")
    op.execute(
        "CREATE TYPE coupletypeenum AS ENUM ('LONG_TERM', 'SUCCESSFUL_LONG_TERM', 'STRUGGLING', 'EVALUATING_RELATIONSHIP')"
    )

    # Create new tables
    op.create_table(
        'parties',
        sa.Column(
            'party_type',
            sa.Enum('GROUP', 'COUPLE', name='partytypeenum', native_enum=False),
            nullable=False,
        ),
        sa.Column('name', sa.String(), nullable=True),
        sa.Column('tag', sa.String(), nullable=True),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('created_by_id', sa.UUID(), nullable=True),
        sa.Column('icon_id', sa.String(), nullable=True),
        sa.Column(
            'couple_type',
            sa.Enum(
                'LONG_TERM',
                'SUCCESSFUL_LONG_TERM',
                'STRUGGLING',
                'EVALUATING_RELATIONSHIP',
                name='coupletypeenum',
                native_enum=False,
            ),
            nullable=True,
        ),
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column(
            'created_at', sa.DateTime(), server_default=sa.text('now()'), nullable=True
        ),
        sa.Column(
            'updated_at', sa.DateTime(), server_default=sa.text('now()'), nullable=True
        ),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index(
        op.f('ix_parties_created_by_id'), 'parties', ['created_by_id'], unique=False
    )

    op.create_table(
        'party_members',
        sa.Column('party_id', sa.UUID(), nullable=False),
        sa.Column('user_id', sa.UUID(), nullable=False),
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column(
            'created_at', sa.DateTime(), server_default=sa.text('now()'), nullable=True
        ),
        sa.Column(
            'updated_at', sa.DateTime(), server_default=sa.text('now()'), nullable=True
        ),
        sa.ForeignKeyConstraint(['party_id'], ['parties.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('party_id', 'user_id', 'id'),
    )
    op.create_index(
        op.f('ix_party_members_user_id'), 'party_members', ['user_id'], unique=False
    )

    op.create_table(
        'form_parties',
        sa.Column('form_id', sa.UUID(), nullable=False),
        sa.Column('party_id', sa.UUID(), nullable=False),
        sa.ForeignKeyConstraint(
            ['form_id'],
            ['forms.id'],
        ),
        sa.ForeignKeyConstraint(
            ['party_id'],
            ['parties.id'],
        ),
        sa.PrimaryKeyConstraint('form_id', 'party_id'),
    )

    # Migrate data from groups to parties
    connection = op.get_bind()

    # Check if groups table exists and has data
    result = connection.execute(
        sa.text(
            "SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'groups')"
        )
    )
    groups_table_exists = result.scalar()

    if groups_table_exists:
        # Migrate groups to parties with party_type = 'GROUP'
        connection.execute(
            sa.text(
                """
            INSERT INTO parties (id, party_type, name, tag, description, created_by_id, icon_id, couple_type, created_at, updated_at)
            SELECT id, 'GROUP'::partytypeenum, name, tag, description, created_by_id, icon_id, NULL, created_at, updated_at
            FROM groups
        """
            )
        )

        # Check if group_members table exists and has data
        result = connection.execute(
            sa.text(
                "SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'group_members')"
            )
        )
        group_members_exists = result.scalar()

        if group_members_exists:
            # Migrate group_members to party_members
            connection.execute(
                sa.text(
                    """
                INSERT INTO party_members (party_id, user_id, id, created_at, updated_at)
                SELECT group_id, user_id, id, created_at, updated_at
                FROM group_members
            """
                )
            )

        # Check if form_groups table exists and has data
        result = connection.execute(
            sa.text(
                "SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'form_groups')"
            )
        )
        form_groups_exists = result.scalar()

        if form_groups_exists:
            # Migrate form_groups to form_parties
            connection.execute(
                sa.text(
                    """
                INSERT INTO form_parties (form_id, party_id)
                SELECT form_id, group_id
                FROM form_groups
            """
                )
            )

    # Drop old tables and their dependencies
    # First drop dependent objects (foreign key constraints will be dropped with tables)

    # Drop jobs table first (seems unrelated to groups but is in the migration)
    try:
        op.drop_index('idx_jobs_created_at', table_name='jobs')
        op.drop_index('idx_jobs_form_id', table_name='jobs')
        op.drop_index('idx_jobs_status_type', table_name='jobs')
        op.drop_index('idx_jobs_user_id', table_name='jobs')
        op.drop_table('jobs')
    except (SQLAlchemyError, Exception):
        pass  # Table might not exist

    # Drop old group-related tables
    try:
        op.drop_table('form_groups')
    except (SQLAlchemyError, Exception):
        pass  # Table might not exist

    try:
        op.drop_index('ix_group_members_user_id', table_name='group_members')
        op.drop_table('group_members')
    except (SQLAlchemyError, Exception):
        pass  # Table might not exist

    try:
        op.drop_index('ix_groups_created_by_id', table_name='groups')
        op.drop_table('groups')
    except (SQLAlchemyError, Exception):
        pass  # Table might not exist

    # Drop column from forms table
    try:
        op.drop_column('forms', 'fields_generation_status')
    except (SQLAlchemyError, Exception):
        pass  # Column might not exist


def downgrade() -> None:
    # Recreate old tables
    op.add_column(
        'forms',
        sa.Column(
            'fields_generation_status',
            sa.VARCHAR(length=20),
            server_default=sa.text("'pending'::character varying"),
            autoincrement=False,
            nullable=False,
        ),
    )

    op.create_table(
        'groups',
        sa.Column('name', sa.VARCHAR(), autoincrement=False, nullable=False),
        sa.Column('tag', sa.VARCHAR(), autoincrement=False, nullable=True),
        sa.Column('description', sa.TEXT(), autoincrement=False, nullable=True),
        sa.Column('created_by_id', sa.UUID(), autoincrement=False, nullable=True),
        sa.Column('id', sa.UUID(), autoincrement=False, nullable=False),
        sa.Column(
            'created_at',
            postgresql.TIMESTAMP(),
            server_default=sa.text('now()'),
            autoincrement=False,
            nullable=True,
        ),
        sa.Column(
            'updated_at',
            postgresql.TIMESTAMP(),
            server_default=sa.text('now()'),
            autoincrement=False,
            nullable=True,
        ),
        sa.Column('icon_id', sa.VARCHAR(), autoincrement=False, nullable=True),
        sa.PrimaryKeyConstraint('id', name='groups_pkey'),
    )
    op.create_index(
        'ix_groups_created_by_id', 'groups', ['created_by_id'], unique=False
    )

    op.create_table(
        'group_members',
        sa.Column('group_id', sa.UUID(), autoincrement=False, nullable=False),
        sa.Column('user_id', sa.UUID(), autoincrement=False, nullable=False),
        sa.Column('id', sa.UUID(), autoincrement=False, nullable=False),
        sa.Column(
            'created_at',
            postgresql.TIMESTAMP(),
            server_default=sa.text('now()'),
            autoincrement=False,
            nullable=True,
        ),
        sa.Column(
            'updated_at',
            postgresql.TIMESTAMP(),
            server_default=sa.text('now()'),
            autoincrement=False,
            nullable=True,
        ),
        sa.ForeignKeyConstraint(
            ['group_id'],
            ['groups.id'],
            name='group_members_group_id_fkey',
            ondelete='CASCADE',
        ),
        sa.PrimaryKeyConstraint('group_id', 'user_id', 'id', name='group_members_pkey'),
    )
    op.create_index(
        'ix_group_members_user_id', 'group_members', ['user_id'], unique=False
    )

    op.create_table(
        'form_groups',
        sa.Column('form_id', sa.UUID(), autoincrement=False, nullable=False),
        sa.Column('group_id', sa.UUID(), autoincrement=False, nullable=False),
        sa.ForeignKeyConstraint(
            ['form_id'], ['forms.id'], name='form_groups_form_id_fkey'
        ),
        sa.ForeignKeyConstraint(
            ['group_id'], ['groups.id'], name='form_groups_group_id_fkey'
        ),
        sa.PrimaryKeyConstraint('form_id', 'group_id', name='form_groups_pkey'),
    )

    # Migrate data back from parties to groups (only for party_type = 'GROUP')
    connection = op.get_bind()

    # Migrate parties back to groups (only GROUP type)
    connection.execute(
        sa.text(
            """
        INSERT INTO groups (id, name, tag, description, created_by_id, icon_id, created_at, updated_at)
        SELECT id, name, tag, description, created_by_id, icon_id, created_at, updated_at
        FROM parties
        WHERE party_type = 'GROUP'
    """
        )
    )

    # Migrate party_members back to group_members (only for GROUP parties)
    connection.execute(
        sa.text(
            """
        INSERT INTO group_members (group_id, user_id, id, created_at, updated_at)
        SELECT pm.party_id, pm.user_id, pm.id, pm.created_at, pm.updated_at
        FROM party_members pm
        JOIN parties p ON pm.party_id = p.id
        WHERE p.party_type = 'GROUP'
    """
        )
    )

    # Migrate form_parties back to form_groups (only for GROUP parties)
    connection.execute(
        sa.text(
            """
        INSERT INTO form_groups (form_id, group_id)
        SELECT fp.form_id, fp.party_id
        FROM form_parties fp
        JOIN parties p ON fp.party_id = p.id
        WHERE p.party_type = 'GROUP'
    """
        )
    )

    # Recreate jobs table (if needed)
    op.create_table(
        'jobs',
        sa.Column(
            'id',
            sa.UUID(),
            server_default=sa.text('uuid_generate_v4()'),
            autoincrement=False,
            nullable=False,
        ),
        sa.Column('type', sa.VARCHAR(length=50), autoincrement=False, nullable=False),
        sa.Column(
            'status',
            sa.VARCHAR(length=20),
            server_default=sa.text("'pending'::character varying"),
            autoincrement=False,
            nullable=False,
        ),
        sa.Column(
            'progress',
            sa.INTEGER(),
            server_default=sa.text('0'),
            autoincrement=False,
            nullable=False,
        ),
        sa.Column('message', sa.TEXT(), autoincrement=False, nullable=True),
        sa.Column(
            'payload',
            postgresql.JSON(astext_type=sa.Text()),
            autoincrement=False,
            nullable=True,
        ),
        sa.Column(
            'result',
            postgresql.JSON(astext_type=sa.Text()),
            autoincrement=False,
            nullable=True,
        ),
        sa.Column('error', sa.TEXT(), autoincrement=False, nullable=True),
        sa.Column(
            'created_at',
            postgresql.TIMESTAMP(),
            server_default=sa.text('CURRENT_TIMESTAMP'),
            autoincrement=False,
            nullable=False,
        ),
        sa.Column(
            'updated_at',
            postgresql.TIMESTAMP(),
            server_default=sa.text('CURRENT_TIMESTAMP'),
            autoincrement=False,
            nullable=False,
        ),
        sa.Column(
            'completed_at', postgresql.TIMESTAMP(), autoincrement=False, nullable=True
        ),
        sa.Column('user_id', sa.UUID(), autoincrement=False, nullable=True),
        sa.Column('form_id', sa.UUID(), autoincrement=False, nullable=True),
        sa.ForeignKeyConstraint(
            ['form_id'], ['forms.id'], name='jobs_form_id_fkey', ondelete='CASCADE'
        ),
        sa.PrimaryKeyConstraint('id', name='jobs_pkey'),
    )
    op.create_index('idx_jobs_user_id', 'jobs', ['user_id'], unique=False)
    op.create_index('idx_jobs_status_type', 'jobs', ['status', 'type'], unique=False)
    op.create_index('idx_jobs_form_id', 'jobs', ['form_id'], unique=False)
    op.create_index('idx_jobs_created_at', 'jobs', ['created_at'], unique=False)

    # Drop new tables
    op.drop_table('form_parties')
    op.drop_index(op.f('ix_party_members_user_id'), table_name='party_members')
    op.drop_table('party_members')
    op.drop_index(op.f('ix_parties_created_by_id'), table_name='parties')
    op.drop_table('parties')

    # Drop enum types
    op.execute('DROP TYPE IF EXISTS coupletypeenum')
    op.execute('DROP TYPE IF EXISTS partytypeenum')
