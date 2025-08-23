"""Add RoadmapTag and subdomain field

Revision ID: 7dc12f41798b
Revises: add_feedback_votes_column
Create Date: 2025-08-20 21:04:04.884818

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = '7dc12f41798b'
down_revision: Union[str, Sequence[str], None] = 'add_feedback_votes_column'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # Add subdomain field to existing roadmaps table
    op.add_column('roadmaps', sa.Column('subdomain', sa.String(length=100), nullable=True))
    op.create_index(op.f('ix_roadmaps_subdomain'), 'roadmaps', ['subdomain'], unique=True)

    # Create roadmap_tags table (the main new feature)
    op.create_table(
        'roadmap_tags',
        sa.Column('roadmap_id', sa.UUID(), nullable=False),
        sa.Column('name', sa.String(length=50), nullable=False),
        sa.Column('color', sa.String(length=7), nullable=False),
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
        sa.ForeignKeyConstraint(['roadmap_id'], ['roadmaps.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('roadmap_id', 'name', name='uq_roadmap_tag_name'),
    )
    op.create_index(op.f('ix_roadmap_tags_created_at'), 'roadmap_tags', ['created_at'], unique=False)
    op.create_index(op.f('ix_roadmap_tags_deleted_at'), 'roadmap_tags', ['deleted_at'], unique=False)
    op.create_index(op.f('ix_roadmap_tags_id'), 'roadmap_tags', ['id'], unique=False)
    op.create_index(op.f('ix_roadmap_tags_roadmap_id'), 'roadmap_tags', ['roadmap_id'], unique=False)
    op.create_index(op.f('ix_roadmap_tags_updated_at'), 'roadmap_tags', ['updated_at'], unique=False)

    # Create roadmap_feature_tags junction table
    op.create_table(
        'roadmap_feature_tags',
        sa.Column('feature_id', sa.UUID(), nullable=False),
        sa.Column('tag_id', sa.UUID(), nullable=False),
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
        sa.ForeignKeyConstraint(['feature_id'], ['roadmap_features.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['tag_id'], ['roadmap_tags.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('feature_id', 'tag_id', name='uq_feature_tag'),
    )
    op.create_index(op.f('ix_roadmap_feature_tags_created_at'), 'roadmap_feature_tags', ['created_at'], unique=False)
    op.create_index(op.f('ix_roadmap_feature_tags_deleted_at'), 'roadmap_feature_tags', ['deleted_at'], unique=False)
    op.create_index(op.f('ix_roadmap_feature_tags_feature_id'), 'roadmap_feature_tags', ['feature_id'], unique=False)
    op.create_index(op.f('ix_roadmap_feature_tags_id'), 'roadmap_feature_tags', ['id'], unique=False)
    op.create_index(op.f('ix_roadmap_feature_tags_tag_id'), 'roadmap_feature_tags', ['tag_id'], unique=False)
    op.create_index(op.f('ix_roadmap_feature_tags_updated_at'), 'roadmap_feature_tags', ['updated_at'], unique=False)


def downgrade() -> None:
    """Downgrade schema."""
    # Drop roadmap_feature_tags table
    op.drop_index(op.f('ix_roadmap_feature_tags_updated_at'), table_name='roadmap_feature_tags')
    op.drop_index(op.f('ix_roadmap_feature_tags_tag_id'), table_name='roadmap_feature_tags')
    op.drop_index(op.f('ix_roadmap_feature_tags_id'), table_name='roadmap_feature_tags')
    op.drop_index(op.f('ix_roadmap_feature_tags_feature_id'), table_name='roadmap_feature_tags')
    op.drop_index(op.f('ix_roadmap_feature_tags_deleted_at'), table_name='roadmap_feature_tags')
    op.drop_index(op.f('ix_roadmap_feature_tags_created_at'), table_name='roadmap_feature_tags')
    op.drop_table('roadmap_feature_tags')
    
    # Drop roadmap_tags table
    op.drop_index(op.f('ix_roadmap_tags_updated_at'), table_name='roadmap_tags')
    op.drop_index(op.f('ix_roadmap_tags_roadmap_id'), table_name='roadmap_tags')
    op.drop_index(op.f('ix_roadmap_tags_id'), table_name='roadmap_tags')
    op.drop_index(op.f('ix_roadmap_tags_deleted_at'), table_name='roadmap_tags')
    op.drop_index(op.f('ix_roadmap_tags_created_at'), table_name='roadmap_tags')
    op.drop_table('roadmap_tags')
    
    # Remove subdomain field from roadmaps table
    op.drop_index(op.f('ix_roadmaps_subdomain'), table_name='roadmaps')
    op.drop_column('roadmaps', 'subdomain')