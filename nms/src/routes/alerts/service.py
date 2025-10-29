"API Routes for serving Zabbix Service Alerts"

import asyncio
from collections.abc import Callable, Sequence
from datetime import datetime, timedelta
from math import ceil
from typing import Annotated

from fastapi import APIRouter, Query, Response
from pymongo import DESCENDING

from src.middlewares.client import get_clients_from_query, ClientsFromQuery
from src.models import Service, ServiceDatetimesAndStatus, ServiceDatetimesStatusAndSeverity, ServiceClientIdAndServiceName
from src.models.utils import fields, now
from src.services.auth import ClerkSdk, JwtUserId
from src.services.db import Database
from src.schemas import (
    DataResponse,
    InfiniteTimePeriodWithClientsParams,
    IntervalSeconds,
    PaginatedDataResponse,
    PaginationWithClientsParams,
    StatAlertDurations,
    StatCounts,
    StatHealthScores,
    StatProblematicAlertTrends,
    StatServiceAlertCount,
    StatTrends,
    TimePeriodWithClientsAndSeverityParams,
    TimePeriodWithClientsParams
)
from src.templates.models import Severity

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

@router.get("/health", response_model=DataResponse[Sequence[StatHealthScores]])
async def get_services_health_scores(
    clients: ClientsFromQuery,
    db: Database,
    response: Response
) -> DataResponse[Sequence[StatHealthScores]]:
    # Aggregate problem severity counts per host
    pipeline = [
        # Get relevant problems for the clients
        {"$match": {
            fields(Service).clientId: {"$in": [c.id for c in clients if c.id is not None]}
        }},

        # Get relevant fields only
        {"$project": {
            fields(Service).serviceName: 1,
            fields(Service).severity: 1,
            fields(Service).status: 1
        }},

        # Group all problems by serviceName
        {"$group": {
            "_id": "$" + fields(Service).serviceName,
            "totalProblems": {"$sum": {"$cond": [{"$ne": ["$" + fields(Service).status, "Recovered"]}, 1, 0]}},
            "notClassified": {"$sum": {"$cond": [{"$and": [
                {"$eq": ["$" + fields(Service).severity, "Not classified"]},
                {"$ne": ["$" + fields(Service).status, "Recovered"] }
            ]}, 1, 0]}},
            "information": {"$sum": {"$cond": [{"$and": [
                {"$eq": ["$" + fields(Service).severity, "Information"]},
                {"$ne": ["$" + fields(Service).status, "Recovered"]}]
            }, 1, 0]}},
            "warning": {"$sum": {"$cond": [{"$and": [
                { "$eq": ["$" + fields(Service).severity, "Warning"] },
                { "$ne": ["$" + fields(Service).status, "Recovered"] }
            ]}, 1, 0]}},
            "average": {"$sum": {"$cond": [{"$and": [
                {"$eq": ["$" + fields(Service).severity, "Average"]},
                {"$ne": ["$" + fields(Service).status, "Recovered"]}
            ]}, 1, 0]}},
            "high": {"$sum": {"$cond": [{"$and": [
                {"$eq": ["$" + fields(Service).severity, "High"]},
                {"$ne": ["$" + fields(Service).status, "Recovered"]}
            ]}, 1, 0]}},
            "disaster": {"$sum": {"$cond": [{"$and": [
                { "$eq": ["$" + fields(Service).severity, "Disaster"]},
                { "$ne": ["$" + fields(Service).status, "Recovered"] }
            ]}, 1, 0]}}
        }},

        # Compute healthScore
        {"$addFields": {
            "healthScore": {"$cond": [
                {"$eq": ["$totalProblems", 0]},
                100,
                {"$max": [ # max(0, 100 - (100 * (weighted_score / (50 * total_problems))))
                    0,
                    {"$subtract": [
                        100,
                        {"$multiply": [
                            100,
                            {"$divide": [
                                {"$add": [
                                    {"$multiply": ["$notClassified", 1]},
                                    {"$multiply": ["$information", 3]},
                                    {"$multiply": ["$warning", 5]},
                                    {"$multiply": ["$average", 10]},
                                    {"$multiply": ["$high", 20]},
                                    {"$multiply": ["$disaster", 50]}
                                ]},
                                {"$multiply": ["$totalProblems", 50]}
                            ]}
                        ]}
                    ]}
                ]}
            ]}
        }}
    ]

    cursor = await db[Service.Meta.collection_name()].aggregate(pipeline)
    results = [StatHealthScores(**doc) async for doc in cursor]

    response.headers["Cache-Control"] = "private, max-age=120"
    return DataResponse(data=results)

@router.get("/count/services", response_model=DataResponse[Sequence[StatServiceAlertCount]])
async def get_services_problems_count(
    query: Annotated[InfiniteTimePeriodWithClientsParams, Query()],
    user_id: JwtUserId,
    clerk: ClerkSdk,
    db: Database,
    response: Response
) -> DataResponse[Sequence[StatServiceAlertCount]]:
    clients = await get_clients_from_query(query, user_id, clerk, db)

    pipeline = [
        # Get relevant problems for the clients
        {"$match": {
            fields(Service).clientId: {"$in": [c.id for c in clients if c.id is not None]},
            **({fields(Service).startedAt: {"$gte": query.start}} if query.start is not None else {}),
            **({fields(Service).startedAt: {"$lte": query.end}} if query.end is not None else {})
        }},

        # Get relevant fields only
        {"$project": {
            fields(Service).clientId: 1,
            fields(Service).serviceName: 1,
            fields(Service).severity: 1
        }},

        # Group by serviceName and count
        {"$group": {
            "_id": {
                fields(Service).clientId: "$" + fields(Service).clientId,
                fields(Service).serviceName: "$" + fields(Service).serviceName,
                fields(Service).severity: "$" + fields(Service).severity
            },
            "count": {"$sum": 1}
        }}
    ]

    cursor = await db[Service.Meta.collection_name()].aggregate(pipeline)
    results = [StatServiceAlertCount(**doc["_id"], count=doc["count"]) async for doc in cursor]

    response.headers["Cache-Control"] = "private, max-age=60"
    return DataResponse(data=results)

@router.get("/trends/problematic-alerts", response_model=DataResponse[Sequence[StatProblematicAlertTrends]])
async def get_problematic_alerts_trends(
    query: Annotated[TimePeriodWithClientsAndSeverityParams, Query()],
    user_id: JwtUserId,
    clerk: ClerkSdk,
    db: Database,
    response: Response
) -> DataResponse[Sequence[StatProblematicAlertTrends]]:
    clients = await get_clients_from_query(query, user_id, clerk, db)

    if query.end is None:
        query.end = now()
    if query.severity is None:
        query.severity = "Warning"

    # pylint: disable=unnecessary-lambda-assignment
    is_problematic: Callable[[Severity], bool] = lambda _: True
    if query.severity == "Information":
        is_problematic = lambda severity: severity != "Not classified"
    elif query.severity == "Warning":
        is_problematic = lambda severity: severity not in ("Not classified", "Information")
    elif query.severity == "Average":
        is_problematic = lambda severity: severity not in ("Not classified", "Information", "Warning")
    elif query.severity == "High":
        is_problematic = lambda severity: severity in ("High", "Disaster")
    elif query.severity == "Disaster":
        is_problematic = lambda severity: severity == "Disaster"

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
    min_time, max_time = bins[0][0], bins[-1][1]
    problems = (
        ServiceDatetimesStatusAndSeverity(**doc)
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
        }, {k: True for k in ServiceDatetimesStatusAndSeverity.model_fields.keys()})
    )

    problem_counts = [0] * num_periods
    total_counts = [0] * num_periods
    async for p in problems:
        for i, (bin_start, bin_end) in enumerate(bins):
            # Started before or in bin and recovered after or in bin
            if ((p.startedAt <= bin_start and (p.recoveryAt is None or bin_start <= p.recoveryAt <= bin_end))
            or ((bin_start <= p.startedAt <= bin_end and (p.recoveryAt is not None and bin_start <= p.recoveryAt <= bin_end)))
            or (bin_start <= p.startedAt <= bin_end and (p.recoveryAt is None or bin_end <= p.recoveryAt))):
                total_counts[i] += 1
                problem_counts[i] += is_problematic(p.severity)

    response.headers["Cache-Control"] = f"private, max-age={IntervalSeconds[query.interval] // 60}, must-revalidate"
    return DataResponse(data=[StatProblematicAlertTrends(
        timestamp=bins[i][0],
        problematic=problem_counts[i],
        total=total_counts[i]
    ) for i in range(num_periods)])

class AlertDurationPerService(ServiceClientIdAndServiceName, StatAlertDurations):
    pass

@router.get("/hosts/duration", response_model=Sequence[AlertDurationPerService])
async def get_alert_duration_per_host(
    query: Annotated[InfiniteTimePeriodWithClientsParams, Query()],
    user_id: JwtUserId,
    clerk: ClerkSdk,
    db: Database,
    response: Response
) -> Sequence[AlertDurationPerService]:
    clients = await get_clients_from_query(query, user_id, clerk, db)

    pipeline = [
        # Get relevant problems for the clients
        {"$match": {
            fields(Service).clientId: {"$in": [c.id for c in clients if c.id is not None]},
            **({fields(Service).startedAt: {"$gte": query.start}} if query.start is not None else {}),
            **({fields(Service).startedAt: {"$lte": query.end}} if query.end is not None else {})
        }},

        # Get relevant fields only
        {"$project": {
            fields(Service).clientId: 1,
            fields(Service).serviceName: 1,
            fields(Service).startedAt: 1,
            fields(Service).recoveryAt: 1
        }},

        # Group by serviceName and list durations
        {"$group": {
            "_id": {
                fields(Service).clientId: "$" + fields(Service).clientId,
                fields(Service).serviceName: "$" + fields(Service).serviceName
            },
            "durationSeconds": {"$push": {"$cond": {
                "if": {"$" + fields(Service).recoveryAt: None}, # type: ignore
                "then": "Infinity",
                "else": {"$divide": [
                    {"$subtract": [
                        "$" + fields(Service).recoveryAt, # type: ignore
                        "$" + fields(Service).startedAt # type: ignore
                    ]},
                    1000
                ]}
            }}}
        }}
    ]

    cursor = await db[Service.Meta.collection_name()].aggregate(pipeline)

    response.headers["Cache-Control"] = "private, max-age=300"
    return [
        AlertDurationPerService(**doc["_id"], durationSeconds=doc["durationSeconds"])
        async for doc in cursor
    ]
