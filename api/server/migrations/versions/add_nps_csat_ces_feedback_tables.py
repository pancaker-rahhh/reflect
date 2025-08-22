"""add_nps_csat_ces_feedback_tables

Revision ID: add_nps_csat_ces_feedback_tables
Revises: c1d2e3f4g5h6
Create Date: 2025-08-21 16:40:00.000000

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = 'add_nps_csat_ces_feedback_tables'
down_revision: Union[str, Sequence[str], None] = 'c1d2e3f4g5h6'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # Create NPS feedback table
    op.create_table(
        'nps_feedback',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('nps_score', sa.Integer(), nullable=True),
        sa.Column('promoter_category', sa.String(length=20), nullable=True),
        sa.Column('follow_up_comment', sa.Text(), nullable=True),
        sa.ForeignKeyConstraint(
            ['id'],
            ['feedback.id'],
        ),
        sa.PrimaryKeyConstraint('id'),
    )

    # Create CSAT feedback table
    op.create_table(
        'csat_feedback',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('csat_score', sa.Integer(), nullable=True),
        sa.Column('satisfaction_level', sa.String(length=20), nullable=True),
        sa.Column('follow_up_comment', sa.Text(), nullable=True),
        sa.ForeignKeyConstraint(
            ['id'],
            ['feedback.id'],
        ),
        sa.PrimaryKeyConstraint('id'),
    )

    # Create CES feedback table
    op.create_table(
        'ces_feedback',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('ces_score', sa.Integer(), nullable=True),
        sa.Column('ease_level', sa.String(length=20), nullable=True),
        sa.Column('follow_up_comment', sa.Text(), nullable=True),
        sa.ForeignKeyConstraint(
            ['id'],
            ['feedback.id'],
        ),
        sa.PrimaryKeyConstraint('id'),
    )

    # Add visual_proof column to bug_report_feedback
    op.add_column(
        'bug_report_feedback',
        sa.Column(
            'visual_proof', postgresql.JSONB(astext_type=sa.Text()), nullable=True
        ),
    )

    # Add suggested_solution and benefits columns to feature_request_feedback
    op.add_column(
        'feature_request_feedback',
        sa.Column('suggested_solution', sa.Text(), nullable=True),
    )
    op.add_column(
        'feature_request_feedback', sa.Column('benefits', sa.Text(), nullable=True)
    )


def downgrade() -> None:
    """Downgrade schema."""
    # Drop the new feedback tables
    op.drop_table('ces_feedback')
    op.drop_table('csat_feedback')
    op.drop_table('nps_feedback')

    # Drop the new columns
    op.drop_column('feature_request_feedback', 'benefits')
    op.drop_column('feature_request_feedback', 'suggested_solution')
    op.drop_column('bug_report_feedback', 'visual_proof')
