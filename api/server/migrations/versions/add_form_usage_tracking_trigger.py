"""Add form usage tracking trigger

Revision ID: add_form_usage_tracking_trigger
Revises: 91c43a3186fc
Create Date: 2024-11-17 00:00:00.000000

"""
from alembic import op


# revision identifiers, used by Alembic.
revision = 'add_form_usage_tracking_trigger'
down_revision = '91c43a3186fc'
branch_labels = None
depends_on = None


def upgrade():
    # Create function to decrement form usage
    op.execute(
        """
        CREATE OR REPLACE FUNCTION decrement_form_usage()
        RETURNS TRIGGER AS $$
        BEGIN
            -- Only decrement if form was soft deleted (deleted_at changed from NULL to NOT NULL)
            IF OLD.deleted_at IS NULL AND NEW.deleted_at IS NOT NULL THEN
                -- Get project to find organization_id
                UPDATE usage_tracking 
                SET usage_count = GREATEST(0, usage_count - 1),
                    updated_at = NOW()
                WHERE organization_id = (
                    SELECT organization_id FROM projects WHERE id = NEW.project_id
                )
                AND resource_type = 'forms'
                AND period_start = DATE_TRUNC('month', NOW());
            END IF;
            RETURN NEW;
        END;
        $$ LANGUAGE plpgsql;
    """
    )

    # Create trigger
    op.execute(
        """
        CREATE TRIGGER form_usage_trigger
            AFTER UPDATE ON forms_v2
            FOR EACH ROW
            EXECUTE FUNCTION decrement_form_usage();
    """
    )


def downgrade():
    # Drop trigger
    op.execute('DROP TRIGGER IF EXISTS form_usage_trigger ON forms_v2;')

    # Drop function
    op.execute('DROP FUNCTION IF EXISTS decrement_form_usage();')
