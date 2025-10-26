"API Routes for serving Zabbix Service Alerts"

from collections.abc import Sequence
from typing import Annotated

from fastapi import APIRouter, Query
from pymongo import DESCENDING

from src.middlewares.client import get_clients_from_query
from src.models import Service
from src.models.utils import fields
from src.services.auth import ClerkSdk, JwtUserId
from src.services.db import Database
from src.schemas import PaginatedDataResponse, PaginationWithClientsParams

router = APIRouter(
    prefix="/services",
    tags=["service alerts"],
)

@router.get("/", response_model=PaginatedDataResponse[Sequence[Service]])
async def get_service_alerts(
    query: Annotated[PaginationWithClientsParams, Query()],
    user_id: JwtUserId,
    clerk: ClerkSdk,
    db: Database
) -> PaginatedDataResponse[Sequence[Service]]:
    clients = await get_clients_from_query(query, user_id, clerk, db)
    offset = (query.page - 1) * query.limit
    cursor = db[Service.Meta.collection_name()].find(
        {fields(Service).clientId: {"$in": [client.id for client in clients if client.id is not None]}},
        sort=[(fields(Service).updatedAt, DESCENDING), (fields(Service).createdAt, DESCENDING)],
        skip=offset,
        limit=query.limit
    )
    results = [Service(**doc) async for doc in cursor]
    return PaginatedDataResponse(data=results, page=query.page, limit=query.limit)
