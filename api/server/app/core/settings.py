from functools import lru_cache
from typing import List, Optional
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
    DATABASE_URL: str = ''
    DATABASE_POOL_SIZE: int = 20
    DATABASE_MAX_OVERFLOW: int = 0

    # Supabase (Auth Only)
    SUPABASE_URL: str = ''
    SUPABASE_ANON_KEY: str = ''
    SUPABASE_SERVICE_KEY: str = ''
    SUPABASE_JWT_SECRET: str = ''

    MAX_BULK_CONVERSION_ITEMS: int = 50

    # Security
    SECRET_KEY: str = 'dev-secret-key-change-in-production'
    ALGORITHM: str = 'HS256'
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    # CORS
    CORS_ORIGINS: str = (
        'http://localhost:3000,http://localhost:5173,http://localhost:5174,'
        'https://reflectfeedback.com,https://ui-dev.reflectfeedback.com'
    )
    CORS_HEADERS: str = '*'

    # Frontend & Email Configuration
    FRONTEND_URL: str = 'http://localhost:5173'
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

    # Dodo Payments Configuration
    DODO_API_KEY: str = ''
    DODO_WEBHOOK_SECRET: str = ''
    DODO_RETURN_URL: str = ''
    DODO_PRODUCT_ID_PRO_MONTHLY: str = ''
    DODO_PRODUCT_ID_PRO_YEARLY: str = ''
    DODO_PRODUCT_ID_PRO_LIFETIME: str = ''

    # Lifetime Offer Configuration
    LIFETIME_OFFER_CUTOFF_DATE: str = '2026-02-01'
    LIFETIME_OFFER_MAX_PURCHASES: int = 200

    model_config = SettingsConfigDict(
        env_file='.env',
        case_sensitive=True,
        extra='ignore',
        # Prevent automatic URL parsing
        str_strip_whitespace=True,
    )

    @property
    def cors_origins_list(self) -> List[str]:
        if not self.CORS_ORIGINS or self.CORS_ORIGINS.strip() == '':
            return ['*']

        if self.ENV == 'production':
            return ['*']

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


@lru_cache()
def get_settings() -> Settings:
    return Settings()
