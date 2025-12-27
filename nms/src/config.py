"Configuration for the application"

from collections.abc import Sequence
from typing import Literal

from pydantic import AliasChoices, Field, MongoDsn
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

    RABBITMQ_HOST: str = Field(
        default="localhost",
        validation_alias=AliasChoices('RABBITMQ_HOST', 'RABBIT_HOST', 'RABBITMQ_URI', 'RABBIT_URI'),
    )

    ALLOWED_ORIGINS: Sequence[str] = Field(
        default_factory=lambda: ["http://localhost:5173"],
        validation_alias=AliasChoices('ALLOWED_ORIGINS', 'ALLOW_ORIGINS', 'CORS_ALLOW_ORIGINS', 'ORIGINS'),
    )

config = Settings() # type: ignore[call-arg]
