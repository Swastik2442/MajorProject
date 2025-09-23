"API Routes for serving Zabbix Alerts"

from typing import Annotated

from fastapi import APIRouter, Query, Request
from pymongo import DESCENDING
from pymongo.asynchronous.database import AsyncDatabase

from ..config import PROBLEMS_COL_NAME, SERVICES_COL_NAME
from ..models import Problem, Service
from ..utils import FilterParams, PaginatedDataResponse

router = APIRouter(
    prefix="/alerts",
    tags=["alerts"],
)

@router.get("/problems", response_model=PaginatedDataResponse[list[Problem]])
async def get_trigger_alerts(req: Request, filter_query: Annotated[FilterParams, Query()]):
    offset = (filter_query.page - 1) * filter_query.limit
    db: AsyncDatabase = req.app.state.db
    cursor = db[PROBLEMS_COL_NAME].find(
        sort=[("updatedAt", DESCENDING), ("createdAt", DESCENDING)],
        skip=offset,
        limit=filter_query.limit
    )
    results = [Problem(**doc) async for doc in cursor]
    return PaginatedDataResponse[list[Problem]](data=results, page=filter_query.page, limit=filter_query.limit)

@router.get("/services", response_model=PaginatedDataResponse[list[Service]])
async def get_service_alerts(req: Request, filter_query: Annotated[FilterParams, Query()]):
    offset = (filter_query.page - 1) * filter_query.limit
    db: AsyncDatabase = req.app.state.db
    cursor = db[SERVICES_COL_NAME].find(
        sort=[("updatedAt", DESCENDING), ("createdAt", DESCENDING)],
        skip=offset,
        limit=filter_query.limit
    )
    results = [Service(**doc) async for doc in cursor]
    return PaginatedDataResponse[list[Service]](data=results, page=filter_query.page, limit=filter_query.limit)
