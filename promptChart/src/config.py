"Configuration for the application"

from collections.abc import Sequence
from typing import Literal

from pydantic import AliasChoices, Field, MongoDsn, PostgresDsn, SecretStr
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

    DB_URI: PostgresDsn = Field(
        validation_alias=AliasChoices('DATABASE_URL', 'DB_URI', 'POSTGRES_URI', 'POSTGRES_DSN'),
    )

    OPENAI_COMPAT_API_URL: str = Field(
        default="http://localhost:1234/v1",
        validation_alias=AliasChoices('OPENAI_COMPAT_API_URL', 'OPENAI_API_URL', 'OPENAI_BASE_URL'),
    )

    AWS_BEDROCK_OPENAI_COMPAT_API_URL: str | None = Field(
        default=None,
        validation_alias=AliasChoices('AWS_BEDROCK_OPENAI_COMPAT_API_URL', 'AWS_BEDROCK_API_URL', 'AWS_BEDROCK_BASE_URL'),
    )
    AWS_BEDROCK_API_KEY: SecretStr | None = Field(
        default=None,
        validation_alias=AliasChoices('AWS_BEDROCK_API_KEY', 'AWS_BEDROCK_KEY'),
    )

    MONGO_CONNECTION_URI: MongoDsn = Field(
        validation_alias=AliasChoices('MONGO_URI', 'MONGO_CONNECTION_URI', 'MONGODB_URI', 'MONGODB_CONNECTION_URI'),
    )
    MONGO_DB_NAME: str = Field("nms")

    ALLOWED_ORIGINS: Sequence[str] = Field(
        default_factory=lambda: ["http://localhost:5000"],
        validation_alias=AliasChoices('ALLOWED_ORIGINS', 'ALLOW_ORIGINS', 'CORS_ALLOW_ORIGINS', 'ORIGINS'),
    )

config = Settings() # type: ignore[call-arg]
