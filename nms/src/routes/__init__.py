"Route Definitions for NMS API"

from .alerts import router as alerts_router
from .zabbix import router as zabbix_router

__all__ = [
    "alerts_router",
    "zabbix_router"
]
