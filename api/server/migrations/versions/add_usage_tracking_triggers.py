"""Add usage tracking triggers for automatic subscription management

Revision ID: add_usage_tracking_triggers
Revises: add_user_subscription_cache
Create Date: 2024-01-01 00:00:00.000000

"""
from alembic import op


# revision identifiers, used by Alembic.
revision = 'add_usage_tracking_triggers'
down_revision = 'add_user_subscription_cache'
branch_labels = None
depends_on = None


def upgrade():
    # Create function to decrement project usage
    op.execute(
        """
        CREATE OR REPLACE FUNCTION decrement_project_usage()
        RETURNS TRIGGER AS $$
        BEGIN
            -- Only decrement if project was soft deleted (deleted_at changed from NULL to NOT NULL)
            IF OLD.deleted_at IS NULL AND NEW.deleted_at IS NOT NULL THEN
                UPDATE usage_tracking 
                SET usage_count = GREATEST(0, usage_count - 1),
                    updated_at = NOW()
                WHERE organization_id = NEW.organization_id 
                AND resource_type = 'projects'
                AND period_start = DATE_TRUNC('month', NOW());
            END IF;
            RETURN NEW;
        END;
        $$ LANGUAGE plpgsql;
    """
    )

    # Create function to decrement widget usage
    op.execute(
        """
        CREATE OR REPLACE FUNCTION decrement_widget_usage()
        RETURNS TRIGGER AS $$
        BEGIN
            -- Only decrement if widget was soft deleted
            IF OLD.deleted_at IS NULL AND NEW.deleted_at IS NOT NULL THEN
                -- Get project to find organization_id
                UPDATE usage_tracking 
                SET usage_count = GREATEST(0, usage_count - 1),
                    updated_at = NOW()
                WHERE organization_id = (
                    SELECT organization_id FROM projects WHERE id = NEW.project_id
                )
                AND resource_type = 'widgets'
                AND period_start = DATE_TRUNC('month', NOW());
            END IF;
            RETURN NEW;
        END;
        $$ LANGUAGE plpgsql;
    """
    )

    # Create triggers
    op.execute(
        """
        CREATE TRIGGER project_usage_trigger
            AFTER UPDATE ON projects
            FOR EACH ROW
            EXECUTE FUNCTION decrement_project_usage();
    """
    )

    op.execute(
        """
        CREATE TRIGGER widget_usage_trigger
            AFTER UPDATE ON widgets
            FOR EACH ROW
            EXECUTE FUNCTION decrement_widget_usage();
    """
    )


def downgrade():
    # Drop triggers
    op.execute('DROP TRIGGER IF EXISTS project_usage_trigger ON projects;')
    op.execute('DROP TRIGGER IF EXISTS widget_usage_trigger ON widgets;')

    # Drop functions
    op.execute('DROP FUNCTION IF EXISTS decrement_project_usage();')
    op.execute('DROP FUNCTION IF EXISTS decrement_widget_usage();')
