from functools import lru_cache
from pydantic import ConfigDict
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    APP_NAME: str = 'API Service'
    APP_VERSION: str = '0.1.0'
    DEBUG: bool = False
    ENV: str = ''

    API_PREFIX: str = ''

    CORS_ORIGINS: list[str] = ['*']
    CORS_HEADERS: list[str] = ['*']

    SUPABASE_URL: str = ''
    SUPABASE_SERVICE_KEY: str = ''
    SUPABASE_JWT_SECRET: str = ''
    SUPABASE_ANON_KEY: str = ''

    POSTGRES_DB: str = ''
    POSTGRES_USER: str = ''
    POSTGRES_PASSWORD: str = ''
    POSTGRES_HOST: str = ''
    POSTGRES_PORT: str = ''

    LLM_URL: str = ''
    LLM_MODEL: str = ''
    LLM_PROVIDER: str = ''

    ONESIGNAL_APP_ID: str = ''
    ONESIGNAL_REST_API_KEY: str = ''

    model_config = ConfigDict(env_file='.env', case_sensitive=True, extra='ignore')


@lru_cache()
def get_settings() -> Settings:
    return Settings()
