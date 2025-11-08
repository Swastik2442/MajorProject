"Configuration for the application"

from typing import Literal

from pydantic import AliasChoices, Field, MongoDsn, PostgresDsn
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

    DATABASE_URL: PostgresDsn = Field(
        validation_alias=AliasChoices('DATABASE_URL', 'POSTGRESQL_URL', 'POSTGRES_DSN'),
    )

    MONGO_CONNECTION_URI: MongoDsn = Field(
        validation_alias=AliasChoices('MONGO_URI', 'MONGO_CONNECTION_URI', 'MONGODB_URI', 'MONGODB_CONNECTION_URI'),
    )
    MONGO_DB_NAME: str = Field("nms")

    LANGSMITH_API_KEY: str = Field(
        default="",
        validation_alias=AliasChoices('LANGSMITH_API_KEY', 'LANGCHAIN_TRACING_V2_API_KEY'),
    )

config = Settings() # type: ignore[call-arg]
