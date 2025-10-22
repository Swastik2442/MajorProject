from typing import Annotated

from clerk_backend_api import Clerk
from fastapi import Depends
import hishel

from src.config import config

hishel_controller = hishel.Controller(
    allow_heuristics=True,
    force_cache=True
)

clerk_client = Clerk(
    bearer_auth=config.CLERK_SECRET_KEY,
    client=hishel.CacheClient(
        storage=hishel.FileStorage(ttl=60),
        controller=hishel_controller
    ),
    async_client=hishel.AsyncCacheClient(
        storage=hishel.AsyncFileStorage(ttl=60),
        controller=hishel_controller
    ),
)

def get_clerk() -> Clerk:
    return clerk_client
ClerkSdk = Annotated[Clerk, Depends(get_clerk)]
