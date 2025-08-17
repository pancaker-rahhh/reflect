import asyncio
import asyncpg
import os
from dotenv import load_dotenv

load_dotenv()


async def reset_database():
    try:
        conn = await asyncpg.connect(
            host=os.getenv('POSTGRES_HOST', 'localhost'),
            port=os.getenv('POSTGRES_PORT', '5432'),
            user=os.getenv('POSTGRES_USER', 'postgres'),
            password=os.getenv('POSTGRES_PASSWORD', 'password'),
            database=os.getenv('POSTGRES_DB', 'reflect_dev'),
        )

        print('Resetting database schema...')
        await conn.execute('DROP SCHEMA IF EXISTS public CASCADE')
        await conn.execute('CREATE SCHEMA public')
        print('Database schema reset complete')

        await conn.close()
    except Exception as e:
        print(f'Error: {e}')


if __name__ == '__main__':
    asyncio.run(reset_database())
