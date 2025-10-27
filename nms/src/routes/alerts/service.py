"API Routes for serving Zabbix Service Alerts"

import asyncio
from collections.abc import Sequence
from datetime import datetime, timedelta
from math import ceil
from typing import Annotated

from fastapi import APIRouter, Query, Response
from pymongo import DESCENDING

from src.middlewares.client import get_clients_from_query, ClientsFromQuery
from src.models import Service, ServiceDatetimesAndStatus
from src.models.utils import fields, now
from src.services.auth import ClerkSdk, JwtUserId
from src.services.db import Database
from src.schemas import (
    DataResponse,
    IntervalSeconds,
    PaginatedDataResponse,
    PaginationWithClientsParams,
    StatCounts,
    StatTrends,
    TimePeriodWithClientsParams
)

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

@router.get("/count", response_model=DataResponse[StatCounts])
async def get_service_alerts_count(
    clients: ClientsFromQuery,
    db: Database,
    response: Response
) -> DataResponse[StatCounts]:
    curr = now()
    clientIds = [client.id for client in clients if client.id is not None]
    results = await asyncio.gather(
        db[Service.Meta.collection_name()].count_documents({
            fields(Service).clientId: {"$in": clientIds},
            fields(Service).status: {"$ne": "Recovered"}
        }),
        db[Service.Meta.collection_name()].count_documents({
            fields(Service).clientId: {"$in": clientIds},
            fields(Service).status: {"$ne": "Recovered"},
            fields(Service).createdAt: {"$gte": curr - timedelta(days=1)} # type: ignore
        }),
        db[Service.Meta.collection_name()].count_documents({
            fields(Service).clientId: {"$in": clientIds},
            fields(Service).createdAt: {"$gte": curr - timedelta(days=1)} # type: ignore
        }),
        db[Service.Meta.collection_name()].count_documents({
            fields(Service).clientId: {"$in": clientIds},
            fields(Service).createdAt: {"$gte": curr - timedelta(weeks=1)} # type: ignore
        }),
        db[Service.Meta.collection_name()].count_documents({
            fields(Service).clientId: {"$in": clientIds},
            fields(Service).createdAt: {"$gte": curr - timedelta(days=30)} # type: ignore
        })
    )

    response.headers["Cache-Control"] = "private, max-age=60"
    return DataResponse(data=StatCounts(
        totalActiveProblems=results[0],
        activeProblemsInLast24Hours=results[1],
        problemsInLast24Hours=results[2],
        problemsInLastWeek=results[3],
        problemsInLastMonth=results[4]
    ))

@router.get("/trends", response_model=DataResponse[Sequence[StatTrends]])
async def get_service_alert_trends(
    query: Annotated[TimePeriodWithClientsParams, Query()],
    user_id: JwtUserId,
    clerk: ClerkSdk,
    db: Database,
    response: Response
) -> DataResponse[Sequence[StatTrends]]:
    clients = await get_clients_from_query(query, user_id, clerk, db)

    if query.end is None:
        query.end = now()

    # Get specific time periods
    bins: list[tuple[datetime, datetime]] = []
    intervalStr = "days" if query.interval == "month" else query.interval + "s"
    intervalDiff = 30 if query.interval == "month" else 1
    num_periods = ceil((query.end.timestamp() - query.start.timestamp()) / IntervalSeconds[query.interval])
    for i in range(num_periods):
        bin_start = query.start + timedelta(**{intervalStr: i * intervalDiff})
        bin_end = bin_start + timedelta(**{intervalStr: intervalDiff})
        if bin_end > query.end:
            bins.append((bin_start, query.end))
            break
        bins.append((bin_start, bin_end))

    # Fetch all problems in the whole time period (plus those that started before but are still active)
    min_time = bins[0][0]
    max_time = bins[-1][1]
    problems = [
        ServiceDatetimesAndStatus(**doc)
        async for doc in db[Service.Meta.collection_name()].find({
            fields(Service).clientId: {"$in": [client.id for client in clients if client.id is not None]},
            "$or": [
                {fields(Service).startedAt: {"$gte": min_time, "$lt": max_time}},
                {
                    fields(Service).startedAt: {"$lt": min_time},
                    "$or": [
                        {fields(Service).status: {"$ne": "Recovered"}},
                        {fields(Service).recoveryAt: {"$gte": min_time}}
                    ]
                }
            ]
        }, {k: True for k in ServiceDatetimesAndStatus.model_fields.keys()})
    ]

    counts = [0] * num_periods
    for p in problems:
        for i, (bin_start, bin_end) in enumerate(bins):
            # Started before the end of the bin and either not recovered or recovered after the start of the bin
            if bin_start >= p.startedAt and (
                p.status != "Recovered" or (p.recoveryAt is not None and p.recoveryAt >= bin_end)
            ):
                counts[i] += 1

    response.headers["Cache-Control"] = f"private, max-age={IntervalSeconds[query.interval] // 60}, must-revalidate"
    return DataResponse(data=[StatTrends(
        timestamp=bins[i][0],
        active=counts[i]
    ) for i in range(num_periods)])
