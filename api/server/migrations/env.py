import asyncio
from logging.config import fileConfig
from sqlalchemy import pool
from sqlalchemy.engine import Connection
from sqlalchemy.ext.asyncio import create_async_engine
from alembic import context
import sys
from pathlib import Path
from app.core.settings import get_settings
from app.db import Base

sys.path.append(str(Path(__file__).parent.parent))

# Import all models to ensure they're registered with Base.metadata
from app.models import *  # noqa

config = context.config
settings = get_settings()

database_url = str(settings.DATABASE_URL)
# For offline mode, convert asyncpg URL to sync format and replace ssl=true with sslmode=require
sync_url = database_url.replace('+asyncpg', '').replace('ssl=true', 'sslmode=require')
config.set_main_option('sqlalchemy.url', sync_url)

if config.config_file_name is not None:
    fileConfig(config.config_file_name)

target_metadata = Base.metadata


def run_migrations_offline() -> None:
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


async def run_async_migrations() -> None:
    # Create async engine directly to avoid any config parsing issues
    async_url = str(settings.DATABASE_URL)
    print(f'DEBUG: Original URL from settings: {async_url}')

    # Check what parameters are in the URL
    import urllib.parse

    parsed = urllib.parse.urlparse(async_url)
    params = urllib.parse.parse_qs(parsed.query)
    print(f'DEBUG: URL parameters: {list(params.keys())}')

    # Ensure asyncpg gets ssl=true, not sslmode
    if 'sslmode=' in async_url:
        print('DEBUG: Found sslmode in URL, converting to ssl=true')
        # Remove all sslmode parameters and add ssl=true
        import re

        async_url = re.sub(r'[&?]sslmode=[^&]*', '', async_url)
        if '?' in async_url:
            async_url += '&ssl=true'
        else:
            async_url += '?ssl=true'
        print(f'DEBUG: Converted URL: {async_url}')
    elif 'ssl=' not in async_url:
        print('DEBUG: No SSL parameter found, adding ssl=true')
        if '?' in async_url:
            async_url += '&ssl=true'
        else:
            async_url += '?ssl=true'

    print(f'DEBUG: Final URL for asyncpg: {async_url}')

    connectable = create_async_engine(
        async_url,
        poolclass=pool.NullPool,
    )

    async with connectable.connect() as connection:
        await connection.run_sync(do_run_migrations)

    await connectable.dispose()


def run_migrations_online() -> None:
    asyncio.run(run_async_migrations())


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
