"API Routes for serving Zabbix Trigger Alerts"

import asyncio
from collections.abc import Callable, Sequence
from datetime import datetime, timedelta
from math import ceil
from typing import Annotated

from fastapi import APIRouter, Response, Query
from pymongo import DESCENDING

from src.middlewares.client import get_clients_from_query, ClientsFromQuery
from src.models import Problem, ProblemDatetimesAndStatus, ProblemDatetimesStatusAndSeverity, ProblemClientIdAndHostname
from src.models.utils import fields, now
from src.services.auth import ClerkSdk, JwtUserId
from src.services.db import Database
from src.schemas import (
    DataResponse,
    InfiniteTimePeriodWithClientsParams,
    IntervalSeconds,
    PaginationWithClientsParams,
    PaginatedDataResponse,
    StatAlertDurations,
    StatCounts,
    StatHealthScores,
    StatHostAlertCount,
    StatProblematicAlertTrends,
    StatTrends,
    TimePeriodWithClientsAndSeverityParams,
    TimePeriodWithClientsParams
)
from src.templates.models import Severity

router = APIRouter(
    prefix="/triggers",
    tags=["trigger alerts"],
)

@router.get("/", response_model=PaginatedDataResponse[Sequence[Problem]])
async def get_trigger_alerts(
    query: Annotated[PaginationWithClientsParams, Query()],
    user_id: JwtUserId,
    clerk: ClerkSdk,
    db: Database
) -> PaginatedDataResponse[Sequence[Problem]]:
    clients = await get_clients_from_query(query, user_id, clerk, db)
    offset = (query.page - 1) * query.limit
    cursor = db[Problem.Meta.collection_name()].find(
        {fields(Problem).clientId: {"$in": [client.id for client in clients if client.id is not None]}},
        sort=[(fields(Problem).updatedAt, DESCENDING), (fields(Problem).createdAt, DESCENDING)],
        skip=offset,
        limit=query.limit
    )
    results = [Problem(**doc) async for doc in cursor]
    return PaginatedDataResponse(data=results, page=query.page, limit=query.limit)

@router.get("/count", response_model=DataResponse[StatCounts])
async def get_trigger_alerts_count(
    clients: ClientsFromQuery,
    db: Database,
    response: Response
) -> DataResponse[StatCounts]:
    curr = now()
    clientIds = [client.id for client in clients if client.id is not None]
    results = await asyncio.gather(
        db[Problem.Meta.collection_name()].count_documents({
            fields(Problem).clientId: {"$in": clientIds},
            fields(Problem).status: {"$ne": "Recovered"}
        }),
        db[Problem.Meta.collection_name()].count_documents({
            fields(Problem).clientId: {"$in": clientIds},
            fields(Problem).status: {"$ne": "Recovered"},
            fields(Problem).createdAt: {"$gte": curr - timedelta(days=1)} # type: ignore
        }),
        db[Problem.Meta.collection_name()].count_documents({
            fields(Problem).clientId: {"$in": clientIds},
            fields(Problem).createdAt: {"$gte": curr - timedelta(days=1)} # type: ignore
        }),
        db[Problem.Meta.collection_name()].count_documents({
            fields(Problem).clientId: {"$in": clientIds},
            fields(Problem).createdAt: {"$gte": curr - timedelta(weeks=1)} # type: ignore
        }),
        db[Problem.Meta.collection_name()].count_documents({
            fields(Problem).clientId: {"$in": clientIds},
            fields(Problem).createdAt: {"$gte": curr - timedelta(days=30)} # type: ignore
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
async def get_trigger_alert_trends(
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
        ProblemDatetimesAndStatus(**doc)
        async for doc in db[Problem.Meta.collection_name()].find({
            fields(Problem).clientId: {"$in": [client.id for client in clients if client.id is not None]},
            "$or": [
                {fields(Problem).startedAt: {"$gte": min_time, "$lt": max_time}},
                {
                    fields(Problem).startedAt: {"$lt": min_time},
                    "$or": [
                        {fields(Problem).status: {"$ne": "Recovered"}},
                        {fields(Problem).recoveryAt: {"$gte": min_time}}
                    ]
                }
            ]
        }, {k: True for k in ProblemDatetimesAndStatus.model_fields.keys()})
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

@router.get("/hosts/health", response_model=DataResponse[Sequence[StatHealthScores]])
async def get_hosts_health_scores(
    clients: ClientsFromQuery,
    db: Database,
    response: Response
) -> DataResponse[Sequence[StatHealthScores]]:
    # Aggregate problem severity counts per host
    pipeline = [
        # Get relevant problems for the clients
        {"$match": {
            fields(Problem).clientId: {"$in": [c.id for c in clients if c.id is not None]}
        }},

        # Get relevant fields only
        {"$project": {
            fields(Problem).hostname: 1,
            fields(Problem).severity: 1,
            fields(Problem).status: 1
        }},

        # Group all problems by hostname
        {"$group": {
            "_id": "$" + fields(Problem).hostname,
            "totalProblems": {"$sum": {"$cond": [{"$ne": ["$" + fields(Problem).status, "Recovered"]}, 1, 0]}},
            "notClassified": {"$sum": {"$cond": [{"$and": [
                {"$eq": ["$" + fields(Problem).severity, "Not classified"]},
                {"$ne": ["$" + fields(Problem).status, "Recovered"] }
            ]}, 1, 0]}},
            "information": {"$sum": {"$cond": [{"$and": [
                {"$eq": ["$" + fields(Problem).severity, "Information"]},
                {"$ne": ["$" + fields(Problem).status, "Recovered"]}]
            }, 1, 0]}},
            "warning": {"$sum": {"$cond": [{"$and": [
                { "$eq": ["$" + fields(Problem).severity, "Warning"] },
                { "$ne": ["$" + fields(Problem).status, "Recovered"] }
            ]}, 1, 0]}},
            "average": {"$sum": {"$cond": [{"$and": [
                {"$eq": ["$" + fields(Problem).severity, "Average"]},
                {"$ne": ["$" + fields(Problem).status, "Recovered"]}
            ]}, 1, 0]}},
            "high": {"$sum": {"$cond": [{"$and": [
                {"$eq": ["$" + fields(Problem).severity, "High"]},
                {"$ne": ["$" + fields(Problem).status, "Recovered"]}
            ]}, 1, 0]}},
            "disaster": {"$sum": {"$cond": [{"$and": [
                { "$eq": ["$" + fields(Problem).severity, "Disaster"]},
                { "$ne": ["$" + fields(Problem).status, "Recovered"] }
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

    cursor = await db[Problem.Meta.collection_name()].aggregate(pipeline)
    results = [StatHealthScores(**doc) async for doc in cursor]

    response.headers["Cache-Control"] = "private, max-age=120"
    return DataResponse(data=results)

@router.get("/hosts/count", response_model=DataResponse[Sequence[StatHostAlertCount]])
async def get_hosts_problems_count(
    query: Annotated[InfiniteTimePeriodWithClientsParams, Query()],
    user_id: JwtUserId,
    clerk: ClerkSdk,
    db: Database,
    response: Response
) -> DataResponse[Sequence[StatHostAlertCount]]:
    clients = await get_clients_from_query(query, user_id, clerk, db)

    pipeline = [
        # Get relevant problems for the clients
        {"$match": {
            fields(Problem).clientId: {"$in": [c.id for c in clients if c.id is not None]},
            **({fields(Problem).startedAt: {"$gte": query.start}} if query.start is not None else {}),
            **({fields(Problem).startedAt: {"$lte": query.end}} if query.end is not None else {})
        }},

        # Get relevant fields only
        {"$project": {
            fields(Problem).clientId: 1,
            fields(Problem).hostname: 1,
            fields(Problem).severity: 1
        }},

        # Group by hostname and count
        {"$group": {
            "_id": {
                fields(Problem).clientId: "$" + fields(Problem).clientId,
                fields(Problem).hostname: "$" + fields(Problem).hostname,
                fields(Problem).severity: "$" + fields(Problem).severity
            },
            "count": {"$sum": 1}
        }}
    ]

    cursor = await db[Problem.Meta.collection_name()].aggregate(pipeline)
    results = [StatHostAlertCount(**doc["_id"], count=doc["count"]) async for doc in cursor]

    response.headers["Cache-Control"] = "private, max-age=60"
    return DataResponse(data=results)

@router.get("/trends/problematic-alerts", response_model=DataResponse[Sequence[StatProblematicAlertTrends]])
async def get_problematic_trigger_alert_trends(
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
        ProblemDatetimesStatusAndSeverity(**doc)
        async for doc in db[Problem.Meta.collection_name()].find({
            fields(Problem).clientId: {"$in": [client.id for client in clients if client.id is not None]},
            "$or": [
                {fields(Problem).startedAt: {"$gte": min_time, "$lt": max_time}},
                {
                    fields(Problem).startedAt: {"$lt": min_time},
                    "$or": [
                        {fields(Problem).status: {"$ne": "Recovered"}},
                        {fields(Problem).recoveryAt: {"$gte": min_time}}
                    ]
                }
            ]
        }, {k: True for k in ProblemDatetimesStatusAndSeverity.model_fields.keys()})
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

class AlertDurationPerHost(ProblemClientIdAndHostname, StatAlertDurations):
    pass

@router.get("/hosts/duration", response_model=DataResponse[Sequence[AlertDurationPerHost]])
async def get_alert_duration_per_host(
    query: Annotated[InfiniteTimePeriodWithClientsParams, Query()],
    user_id: JwtUserId,
    clerk: ClerkSdk,
    db: Database,
    response: Response
) -> DataResponse[Sequence[AlertDurationPerHost]]:
    clients = await get_clients_from_query(query, user_id, clerk, db)

    pipeline = [
        # Get relevant problems for the clients
        {"$match": {
            fields(Problem).clientId: {"$in": [c.id for c in clients if c.id is not None]},
            **({fields(Problem).startedAt: {"$gte": query.start}} if query.start is not None else {}),
            **({fields(Problem).startedAt: {"$lte": query.end}} if query.end is not None else {})
        }},

        # Get relevant fields only
        {"$project": {
            fields(Problem).clientId: 1,
            fields(Problem).hostname: 1,
            fields(Problem).startedAt: 1,
            fields(Problem).recoveryAt: 1
        }},

        # Group by hostname and list durations
        {"$group": {
            "_id": {
                fields(Problem).clientId: "$" + fields(Problem).clientId,
                fields(Problem).hostname: "$" + fields(Problem).hostname
            },
            "durationSeconds": {"$push": {"$cond": {
                "if": {"$or": [
                    {"$eq": ["$" + fields(Problem).recoveryAt, None]}, # type: ignore
                    {"$not": ["$" + fields(Problem).recoveryAt]} # type: ignore
                ]},
                "then": "Infinity",
                "else": {"$divide": [
                    {"$subtract": [
                        "$" + fields(Problem).recoveryAt, # type: ignore
                        "$" + fields(Problem).startedAt # type: ignore
                    ]},
                    1000
                ]}
            }}}
        }}
    ]

    cursor = await db[Problem.Meta.collection_name()].aggregate(pipeline)

    response.headers["Cache-Control"] = "private, max-age=300"
    return DataResponse(data=[
        AlertDurationPerHost(**doc["_id"], durationSeconds=doc["durationSeconds"])
        async for doc in cursor
    ])
