from logging import getLogger
from typing import Annotated

from fastapi import Depends
from pydantic import RedisDsn
import redis

from src.config import config
from src.services import Service

logger = getLogger(__name__)

class RedisService(Service):
    def __init__(self):
        self._redis_client: redis.Redis | None

    def get_client(self) -> redis.Redis | None:
        if not hasattr(self, "_redis_client"):
            raise RuntimeError("Redis client not initialized before access")
        return self._redis_client

    async def connect(self, dsn: RedisDsn | None = config.REDIS_URL):
        if dsn is None:
            self._redis_client = None
            logger.info("No Redis URL provided; skipping Redis connection")
        else:
            self._redis_client = redis.Redis.from_url(str(dsn))
            logger.info("Connected to Redis")

    async def disconnect(self):
        if self._redis_client is None: return
        self._redis_client.close()
        logger.info("Closed connection to Redis")

redis_service = RedisService()
RedisClient = Annotated[redis.Redis | None, Depends(redis_service.get_client)]

__all__ = [
    "RedisService",
    "redis_service",
    "RedisClient"
]
