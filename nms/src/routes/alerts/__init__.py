"API Routes for serving Zabbix Alerts"

from fastapi import APIRouter

from .common import router as common_alerts_router
from .trigger import router as trigger_alerts_router
from .service import router as service_alerts_router

router = APIRouter(
    prefix="/alerts",
    tags=["alerts"],
)

router.include_router(common_alerts_router)
router.include_router(trigger_alerts_router)
router.include_router(service_alerts_router)
