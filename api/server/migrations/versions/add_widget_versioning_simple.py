"""Add widget versioning fields

Revision ID: widget_versioning
Revises: feature_votes_simple
Create Date: 2025-08-25 22:10:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = 'widget_versioning'
down_revision: Union[str, Sequence[str], None] = 'feature_votes_simple'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Add widget versioning fields"""
    # Add version column (defaults to 1 for existing widgets)
    op.add_column('widgets', sa.Column('version', sa.Integer(), nullable=False, server_default='1'))
    
    # Add published_at timestamp
    op.add_column('widgets', sa.Column('published_at', sa.TIMESTAMP(timezone=True), nullable=True))
    
    # Add cdn_url for storing the CDN path
    op.add_column('widgets', sa.Column('cdn_url', sa.String(500), nullable=True))


def downgrade() -> None:
    """Remove widget versioning fields"""
    op.drop_column('widgets', 'cdn_url')
    op.drop_column('widgets', 'published_at')
    op.drop_column('widgets', 'version')