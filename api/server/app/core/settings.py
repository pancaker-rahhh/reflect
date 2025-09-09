from functools import lru_cache
from typing import List, Optional
from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    # Application
    APP_NAME: str = 'Reflect API'
    APP_VERSION: str = '0.1.0'
    DEBUG: bool = False
    ENV: str = 'development'
    API_PREFIX: str = '/api/v1'

    # Database
    POSTGRES_DB: str = 'reflect_dev_db'
    POSTGRES_USER: str = 'reflect_dev_user'
    POSTGRES_PASSWORD: str = 'reflect_dev_pass'
    POSTGRES_HOST: str = 'localhost'
    POSTGRES_PORT: int = 5432
    DATABASE_URL: str = None
    DATABASE_POOL_SIZE: int = 20
    DATABASE_MAX_OVERFLOW: int = 0

    # Supabase (Auth Only)
    SUPABASE_URL: str = ''
    SUPABASE_ANON_KEY: str = ''
    SUPABASE_SERVICE_KEY: str = ''
    SUPABASE_JWT_SECRET: str = ''

    # Security
    SECRET_KEY: str = 'dev-secret-key-change-in-production'
    ALGORITHM: str = 'HS256'
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    # CORS
    CORS_ORIGINS: str = 'http://localhost:3000,http://localhost:5173,http://localhost:5174'
    CORS_HEADERS: str = '*'

    # Frontend & Email Configuration
    FRONTEND_URL: str = 'http://localhost:3000'
    EMAIL_FROM: str = 'noreply@reflect.app'
    EMAIL_FROM_NAME: str = 'Reflect'

    # Task Backend
    TASK_BACKEND: str = 'fastapi'

    # Logging
    LOG_LEVEL: str = 'INFO'
    LOG_SQL: bool = False

    # Optional: Monitoring
    AXIOM_TOKEN: Optional[str] = None
    AXIOM_DATASET: Optional[str] = None
    POSTHOG_API_KEY: Optional[str] = None
    POSTHOG_HOST: str = 'https://app.posthog.com'
    SENTRY_DSN: Optional[str] = None

    # Cloudflare R2 & CDN Configuration
    R2_ACCOUNT_ID: Optional[str] = None
    R2_ACCESS_KEY_ID: Optional[str] = None
    R2_SECRET_ACCESS_KEY: Optional[str] = None
    R2_BUCKET_NAME: str = 'reflect-widgets'
    R2_ENDPOINT_URL: Optional[str] = None
    CDN_BASE_URL: str = 'https://cdn.example.com'
    CDN_ZONE_ID: Optional[str] = None
    CDN_API_TOKEN: Optional[str] = None

    model_config = SettingsConfigDict(
        env_file='.env', case_sensitive=True, extra='ignore'
    )

    @property
    def cors_origins_list(self) -> List[str]:
        if not self.CORS_ORIGINS or self.CORS_ORIGINS.strip() == '':
            return []
        origins = [
            origin.strip() for origin in self.CORS_ORIGINS.split(',') if origin.strip()
        ]
        if self.ENV == 'development':
            origins.append('null')
        return origins

    @property
    def cors_headers_list(self) -> List[str]:
        if (
            not self.CORS_HEADERS
            or self.CORS_HEADERS.strip() == ''
            or self.CORS_HEADERS == '*'
        ):
            return ['*']
        return [
            header.strip() for header in self.CORS_HEADERS.split(',') if header.strip()
        ]

    @property
    def r2_endpoint_url(self) -> str:
        if self.R2_ENDPOINT_URL:
            return self.R2_ENDPOINT_URL
        if self.R2_ACCOUNT_ID:
            return f'https://{self.R2_ACCOUNT_ID}.r2.cloudflarestorage.com'
        return ''

    @field_validator('DATABASE_URL', mode='before')
    @classmethod
    def construct_database_url(cls, v, values) -> str:
        if hasattr(v, '__str__') and not isinstance(v, str):
            return str(v)
        
        if isinstance(v, str) and v.strip() != '':
            return v

        user = values.data.get('POSTGRES_USER')
        password = values.data.get('POSTGRES_PASSWORD')
        host = values.data.get('POSTGRES_HOST')
        port = values.data.get('POSTGRES_PORT')
        db = values.data.get('POSTGRES_DB')

        if all([user, password, host, port, db]):
            return f'postgresql+asyncpg://{user}:{password}@{host}:{port}/{db}'

        raise ValueError("Database connection failed: DATABASE_URL is not set and could not be constructed from POSTGRES_* variables.")


@lru_cache()
def get_settings() -> Settings:
    return Settings()
