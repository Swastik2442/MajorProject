"Configuration for the application"

from collections.abc import Sequence
from typing import Literal

from pydantic import AliasChoices, Field, MongoDsn, RedisDsn
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=('.env', '.env.local'),
        env_file_encoding='utf-8',
        env_ignore_empty=True,
        extra='ignore',
    )

    ENV: Literal['dev', 'prod'] = Field(
        default='prod',
        validation_alias=AliasChoices('ENV', 'ENVIRONMENT', 'APP_ENV', 'APPLICATION_ENV'),
    )
    DEBUG: bool = Field(default=False)

    MONGO_CONNECTION_URI: MongoDsn = Field(
        validation_alias=AliasChoices('MONGO_URI', 'MONGO_CONNECTION_URI', 'MONGODB_URI', 'MONGODB_CONNECTION_URI'),
    )
    DB_NAME: str = Field("nms")

    REDIS_URL: RedisDsn | None = Field(
        default=None,
        validation_alias=AliasChoices('REDIS_URL', 'REDIS_URI'),
    )

    CLERK_ISSUER: str
    CLERK_JWKS_URL: str
    CLERK_SECRET_KEY: str

    LANGCHAIN_API_URL : str = Field(
        default="http://localhost:4200",
        validation_alias=AliasChoices('LANGCHAIN_API_URL', 'LANGCHAIN_API_BASE_URL', 'LANGCHAIN_BASE_URL'),
    )

    ALLOWED_ORIGINS: Sequence[str] = Field(
        default_factory=lambda: ["http://localhost:5173"],
        validation_alias=AliasChoices('ALLOWED_ORIGINS', 'ALLOW_ORIGINS', 'CORS_ALLOW_ORIGINS', 'ORIGINS'),
    )

config = Settings() # type: ignore[call-arg]
