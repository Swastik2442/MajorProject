"Redis Service"

from logging import getLogger
from typing import Annotated

from fastapi import Depends
from pydantic import RedisDsn

try:
    import redis
except ImportError as e:
    raise ImportError("To work with Caching service, please install using 'pip install common[caching]'.") from e

from common.services import Service

logger = getLogger(__name__)

class RedisService(Service):
    def __init__(self):
        self._redis_client: redis.Redis | None

    def get_client(self) -> redis.Redis | None:
        if not hasattr(self, "_redis_client"):
            raise RuntimeError("Redis client not initialized before access")
        return self._redis_client

    async def connect(self, *args, dsn: RedisDsn | None = None, **kwargs):
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
