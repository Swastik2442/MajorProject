"Clerk SDK Service Integration"

from collections.abc import Callable
from logging import getLogger
from typing import Annotated

from fastapi import Depends

try:
    from clerk_backend_api import Clerk
    import jwt
except ImportError as e:
    raise ImportError(
        "To work with Authentication service, please install using 'pip install common[auth]'."
    ) from e

from common.services import Service

logger = getLogger(__name__)

try:
    from common.services.hishel import hishel_service
except ImportError:
    logger.warning("Packages required for Caching not found, disabling caching.")

class ClerkService(Service):
    def __init__(self) -> None:
        self._clerk_client: Clerk
        self._jwks_client: jwt.PyJWKClient
        self._issuer: str

    def get_clerk(self) -> Clerk:
        if not hasattr(self, "_clerk_client"):
            raise RuntimeError("Clerk client not connected before access")
        return self._clerk_client

    def get_jwks_client(self) -> jwt.PyJWKClient:
        if not hasattr(self, "_jwks_client"):
            raise RuntimeError("JWKS client not connected before access")
        return self._jwks_client

    def get_issuer(self) -> str:
        if not hasattr(self, "_issuer"):
            raise RuntimeError("Issuer not set before access")
        return self._issuer

    async def connect(
        self,
        *args,
        bearer_auth: str | Callable[[], str | None] | None = None,
        jwks_url: str | None = None,
        issuer: str | None = None,
        **kwargs
    ):
        if bearer_auth is None or jwks_url is None or issuer is None:
            raise ValueError("Bearer auth, JWKS URL, and issuer must be provided for ClerkService")

        if 'hishel_service' in globals():
            self._clerk_client = Clerk(
                bearer_auth=bearer_auth,
                client=hishel_service.get_cache_client(),            # type: ignore
                async_client=hishel_service.get_async_cache_client() # type: ignore
            )
        else:
            self._clerk_client = Clerk(bearer_auth=bearer_auth)

        self._jwks_client = jwt.PyJWKClient(jwks_url)
        self._issuer = issuer
        logger.info("Clerk client initialized")

    async def disconnect(self): pass

clerk_service = ClerkService()
ClerkSdk = Annotated[Clerk, Depends(clerk_service.get_clerk)]
ClerkJwksClient = Annotated[jwt.PyJWKClient, Depends(clerk_service.get_jwks_client)]
ClerkIssuer = Annotated[str, Depends(clerk_service.get_issuer)]

__all__ = [
    "ClerkService",
    "clerk_service",
    "ClerkSdk",
    "ClerkJwksClient",
    "ClerkIssuer"
]
