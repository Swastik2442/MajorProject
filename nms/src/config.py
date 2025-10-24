"Configuration for the application"

from pydantic import AliasChoices, Field, MongoDsn, RedisDsn
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=('.env', '.env.local'),
        env_file_encoding='utf-8',
        env_ignore_empty=True,
        extra='ignore',
    )

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

    ALLOWED_ORIGINS: list[str] = Field(
        default_factory=lambda: ["http://localhost:5173"],
        validation_alias=AliasChoices('ALLOWED_ORIGINS', 'ALLOW_ORIGINS', 'CORS_ALLOW_ORIGINS', 'ORIGINS'),
    )

config = Settings() # type: ignore[call-arg]
