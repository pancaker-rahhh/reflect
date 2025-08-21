"""add email logs table

Revision ID: a1b2c3d4e5f6
Revises: dc0e065916f2
Create Date: 2024-01-20 10:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = 'a1b2c3d4e5f6'
down_revision = 'dc0e065916f2'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # First check if the table already exists
    conn = op.get_bind()
    result = conn.execute(sa.text(
        "SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'email_logs')"
    ))
    table_exists = result.scalar()
    
    if table_exists:
        print("Table 'email_logs' already exists, skipping creation")
        return
    
    # Check and create email status enum if it doesn't exist
    result = conn.execute(sa.text(
        "SELECT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'emailstatus')"
    ))
    if not result.scalar():
        conn.execute(sa.text(
            "CREATE TYPE emailstatus AS ENUM ('pending', 'sent', 'failed', 'bounced', 'complained')"
        ))
        conn.commit()
    
    # Check and create email type enum if it doesn't exist
    result = conn.execute(sa.text(
        "SELECT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'emailtype')"
    ))
    if not result.scalar():
        conn.execute(sa.text(
            "CREATE TYPE emailtype AS ENUM ('invitation', 'welcome', 'reminder', 'notification', 'custom')"
        ))
        conn.commit()
    
    # Create the email_logs table using raw SQL to avoid enum creation issues
    conn.execute(sa.text("""
        CREATE TABLE email_logs (
            id UUID PRIMARY KEY,
            recipient_email VARCHAR(255) NOT NULL,
            sender_email VARCHAR(255) NOT NULL,
            subject VARCHAR(500) NOT NULL,
            email_type emailtype NOT NULL,
            provider VARCHAR(50) NOT NULL,
            provider_message_id VARCHAR(255),
            provider_response JSON,
            status emailstatus NOT NULL,
            attempts INTEGER DEFAULT 1,
            last_attempt_at TIMESTAMP WITH TIME ZONE,
            sent_at TIMESTAMP WITH TIME ZONE,
            failed_at TIMESTAMP WITH TIME ZONE,
            error_message TEXT,
            cc_emails JSON,
            bcc_emails JSON,
            tags JSON,
            email_metadata JSON,
            user_id UUID,
            organization_id UUID,
            invitation_id UUID,
            created_at TIMESTAMP WITH TIME ZONE NOT NULL,
            updated_at TIMESTAMP WITH TIME ZONE NOT NULL
        )
    """))
    
    # Create indexes
    op.create_index('idx_email_logs_recipient_email', 'email_logs', ['recipient_email'])
    op.create_index('idx_email_logs_email_type', 'email_logs', ['email_type'])
    op.create_index('idx_email_logs_status', 'email_logs', ['status'])
    op.create_index('idx_email_logs_user_id', 'email_logs', ['user_id'])
    op.create_index('idx_email_logs_organization_id', 'email_logs', ['organization_id'])
    op.create_index('idx_email_logs_recipient_status', 'email_logs', ['recipient_email', 'status'])
    op.create_index('idx_email_logs_type_status', 'email_logs', ['email_type', 'status'])
    op.create_index('idx_email_logs_created_at', 'email_logs', ['created_at'])
    op.create_index('idx_email_logs_organization', 'email_logs', ['organization_id', 'status'])


def downgrade() -> None:
    # Drop indexes if they exist
    op.execute('DROP INDEX IF EXISTS idx_email_logs_organization')
    op.execute('DROP INDEX IF EXISTS idx_email_logs_created_at')
    op.execute('DROP INDEX IF EXISTS idx_email_logs_type_status')
    op.execute('DROP INDEX IF EXISTS idx_email_logs_recipient_status')
    op.execute('DROP INDEX IF EXISTS idx_email_logs_organization_id')
    op.execute('DROP INDEX IF EXISTS idx_email_logs_user_id')
    op.execute('DROP INDEX IF EXISTS idx_email_logs_status')
    op.execute('DROP INDEX IF EXISTS idx_email_logs_email_type')
    op.execute('DROP INDEX IF EXISTS idx_email_logs_recipient_email')
    
    # Drop table if it exists
    op.execute('DROP TABLE IF EXISTS email_logs')
    
    # Drop enums if they exist and are not used by other tables
    conn = op.get_bind()
    
    # Check if emailtype is used by any other table
    result = conn.execute(sa.text("""
        SELECT COUNT(*) FROM information_schema.columns 
        WHERE udt_name = 'emailtype' 
        AND table_name != 'email_logs'
    """))
    if result.scalar() == 0:
        op.execute('DROP TYPE IF EXISTS emailtype')
    
    # Check if emailstatus is used by any other table
    result = conn.execute(sa.text("""
        SELECT COUNT(*) FROM information_schema.columns 
        WHERE udt_name = 'emailstatus' 
        AND table_name != 'email_logs'
    """))
    if result.scalar() == 0:
        op.execute('DROP TYPE IF EXISTS emailstatus')