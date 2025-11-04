"Hishel Caching Service"

import os
from logging import getLogger
from typing import Annotated

from fastapi import Depends
import hishel

from common.services import Service
from common.services.redis import redis_service

Storage = hishel.FileStorage | hishel.RedisStorage | None
AsyncStorage = hishel.AsyncFileStorage | hishel.AsyncRedisStorage | None

logger = getLogger(__name__)

class HishelService(Service):
    def __init__(self) -> None:
        self._hishel_cache_client: hishel.CacheClient | None
        self._hishel_async_cache_client: hishel.AsyncCacheClient | None

        self._hishel_storage: Storage
        self._hishel_async_storage: AsyncStorage

        self._hishel_controller = hishel.Controller(
            allow_heuristics=True,
            force_cache=True
        )

    def get_cache_client(self) -> hishel.CacheClient | None:
        if not hasattr(self, "_hishel_cache_client"):
            raise RuntimeError("Hishel cache client accessed before initialization")
        return self._hishel_cache_client

    def get_async_cache_client(self) -> hishel.AsyncCacheClient | None:
        if not hasattr(self, "_hishel_async_cache_client"):
            raise RuntimeError("Hishel async cache client accessed before initialization")
        return self._hishel_async_cache_client

    def get_storage(self) -> Storage:
        if not hasattr(self, "_hishel_storage"):
            raise RuntimeError("Hishel storage accessed before initialization")
        return self._hishel_storage

    def get_async_storage(self) -> AsyncStorage:
        if not hasattr(self, "_hishel_async_storage"):
            raise RuntimeError("Hishel async storage accessed before initialization")
        return self._hishel_async_storage

    def get_controller(self) -> hishel.Controller:
        return self._hishel_controller

    async def connect(self, *args, **kwargs) -> None:
        if os.access(os.getcwd(), os.W_OK):
            self._hishel_storage = hishel.FileStorage(ttl=60)
            self._hishel_async_storage = hishel.AsyncFileStorage(ttl=60)
            logger.debug("Using file-based hishel cache storage")
        elif (rc := redis_service.get_client()) is not None:
            self._hishel_storage = hishel.RedisStorage(client=rc, ttl=60)
            self._hishel_async_storage = hishel.AsyncRedisStorage(client=rc, ttl=60)
            logger.debug("Using Redis as hishel cache storage")
        else:
            self._hishel_storage = self._hishel_async_storage = None
            logger.debug("No cache storage available for hishel; disabled caching")

        if self._hishel_storage is not None and self._hishel_async_storage is not None:
            self._hishel_cache_client = hishel.CacheClient(
                storage=self._hishel_storage,
                controller=self._hishel_controller
            )
            self._hishel_async_cache_client = hishel.AsyncCacheClient(
                storage=self._hishel_async_storage,
                controller=self._hishel_controller
            )
        logger.info("Hishel components initialized")

    async def disconnect(self): pass

hishel_service = HishelService()
HishelCacheClient = Annotated[hishel.CacheClient, Depends(hishel_service.get_cache_client)]
HishelAsyncCacheClient = Annotated[hishel.AsyncCacheClient, Depends(hishel_service.get_async_cache_client)]
HishelStorage = Annotated[Storage, Depends(hishel_service.get_storage)]
HishelAsyncStorage = Annotated[AsyncStorage, Depends(hishel_service.get_async_storage)]
HishelController = Annotated[hishel.Controller, Depends(hishel_service.get_controller)]

__all__ = [
    "HishelService",
    "Storage",
    "AsyncStorage",
    "hishel_service",
    "HishelCacheClient",
    "HishelAsyncCacheClient",
    "HishelStorage",
    "HishelAsyncStorage",
    "HishelController"
]
