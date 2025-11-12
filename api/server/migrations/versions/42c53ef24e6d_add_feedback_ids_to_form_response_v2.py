"""add_feedback_ids_to_form_response_v2

Revision ID: 42c53ef24e6d
Revises: bb2c08cb87aa
Create Date: 2025-11-11 23:58:46.708910

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


revision: str = '42c53ef24e6d'
down_revision: Union[str, Sequence[str], None] = 'bb2c08cb87aa'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        'form_responses_v2',
        sa.Column(
            'feedback_ids',
            postgresql.JSONB(astext_type=sa.Text()),
            nullable=True,
            server_default='[]',
        ),
    )


def downgrade() -> None:
    op.drop_column('form_responses_v2', 'feedback_ids')
