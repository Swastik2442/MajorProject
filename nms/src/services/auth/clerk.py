from logging import getLogger
from typing import Annotated

from clerk_backend_api import Clerk
from fastapi import Depends

from src.config import config
from src.services import Service
from src.services.hishel import hishel_service

logger = getLogger(__name__)

class ClerkService(Service):
    def __init__(self) -> None:
        self._clerk_client: Clerk

    def get_clerk(self) -> Clerk:
        if not hasattr(self, "_clerk_client"):
            raise RuntimeError("Clerk client not connected before access")
        return self._clerk_client

    async def connect(self):
        self._clerk_client = Clerk(
            bearer_auth=config.CLERK_SECRET_KEY,
            client=hishel_service.get_cache_client(),
            async_client=hishel_service.get_async_cache_client()
        )
        logger.info("Clerk client initialized")

    async def disconnect(self): pass

clerk_service = ClerkService()
ClerkSdk = Annotated[Clerk, Depends(clerk_service.get_clerk)]

__all__ = [
    "ClerkService",
    "clerk_service",
    "ClerkSdk"
]
