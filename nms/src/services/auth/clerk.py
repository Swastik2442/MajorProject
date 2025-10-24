import os
from logging import getLogger
from typing import Annotated

from clerk_backend_api import Clerk
from fastapi import Depends
import hishel

from src.config import config
from src.services.redis import redis_service

logger = getLogger(__name__)

class ClerkService:
    def __init__(self) -> None:
        self._clerk_client: Clerk

    def get_clerk(self) -> Clerk:
        if not hasattr(self, "_clerk_client"):
            raise RuntimeError("Clerk client not connected before access")
        return self._clerk_client

    def connect(self):
        if os.access(".cache", os.W_OK):
            hishel_storage = hishel.FileStorage(ttl=60)
            hishel_async_storage = hishel.AsyncFileStorage(ttl=60)
            logger.debug("Using file-based hishel cache storage")
        elif (rc := redis_service.get_client()) is not None:
            hishel_storage = hishel.RedisStorage(client=rc, ttl=60)
            hishel_async_storage = hishel.AsyncRedisStorage(client=rc, ttl=60)
            logger.debug("Using Redis as hishel cache storage")
        else:
            hishel_storage = hishel_async_storage = None
            logger.debug("No cache storage available for hishel; disabled caching")

        if hishel_storage is None:
            self._clerk_client = Clerk(
                bearer_auth=config.CLERK_SECRET_KEY
            )
        else:
            hishel_controller = hishel.Controller(
                allow_heuristics=True,
                force_cache=True
            )

            self._clerk_client = Clerk(
                bearer_auth=config.CLERK_SECRET_KEY,
                client=hishel.CacheClient(
                    storage=hishel_storage,
                    controller=hishel_controller
                ),
                async_client=hishel.AsyncCacheClient(
                    storage=hishel_async_storage,
                    controller=hishel_controller
                ),
            )
        logger.info("Clerk client initialized")

    def disconnect(self):
        pass

clerk_service = ClerkService()
ClerkSdk = Annotated[Clerk, Depends(clerk_service.get_clerk)]
