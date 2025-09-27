from logging.config import fileConfig
from sqlalchemy import pool, engine_from_config
from sqlalchemy.engine import Connection
from alembic import context
import sys
import os
from pathlib import Path
from app.core.settings import get_settings
from app.db import Base

sys.path.append(str(Path(__file__).parent.parent))

# Import all models to ensure they're registered with Base.metadata
from app.models import *  # noqa

config = context.config
settings = get_settings()

# Use DATABASE_URL from environment if set (for CI/CD), otherwise from settings
database_url = os.getenv('DATABASE_URL') or str(settings.DATABASE_URL)
# Convert asyncpg URL to standard postgresql URL for migrations
sync_url = database_url.replace('postgresql+asyncpg://', 'postgresql://').replace(
    'ssl=true', 'sslmode=require'
)
config.set_main_option('sqlalchemy.url', sync_url)

if config.config_file_name is not None:
    fileConfig(config.config_file_name)

target_metadata = Base.metadata


def run_migrations_offline() -> None:
    """Run migrations in 'offline' mode."""
    url = config.get_main_option('sqlalchemy.url')
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={'paramstyle': 'named'},
    )

    with context.begin_transaction():
        context.run_migrations()


def do_run_migrations(connection: Connection) -> None:
    context.configure(connection=connection, target_metadata=target_metadata)

    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    """Run migrations in 'online' mode using sync engine."""
    connectable = engine_from_config(
        config.get_section(config.config_ini_section, {}),
        prefix='sqlalchemy.',
        poolclass=pool.NullPool,
    )

    with connectable.connect() as connection:
        context.configure(connection=connection, target_metadata=target_metadata)

        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
