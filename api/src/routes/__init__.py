"Route Definitions for NMS API"

from .alerts import router as alerts_router
from .clients import router as clients_router

__all__ = [
    "alerts_router",
    "clients_router",
]
