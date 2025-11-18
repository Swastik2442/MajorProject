"Route Definitions for NMS API"

from .alerts import router as alerts_router
from .clients import router as clients_router
from .promptChart import router as prompt_chart_router
from .sse import router as sse_router

__all__ = [
    "alerts_router",
    "clients_router",
    "prompt_chart_router",
    "sse_router",
]
