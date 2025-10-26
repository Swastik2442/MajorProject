"API Routes for serving Zabbix Alerts"

import asyncio
from collections.abc import Sequence
from datetime import datetime, timedelta
from math import ceil
from typing import Annotated

from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException, Query, Response, status
from pymongo import DESCENDING

from src.models import Client, ClientListItem, Problem, Service
from src.models.utils import fields, now
from src.services.auth import ClerkSdk, JwtUserId
from src.services.db import Database
from src.schemas import (
    ClientsParams,
    DataResponse,
    InfiniteTimePeriodParams,
    PaginationParams,
    PaginatedDataResponse,
    StatCounts,
    StatHealthScores,
    StatHostProblemCount,
    StatTrends,
    TimePeriodParams
)

router = APIRouter(
    prefix="/alerts",
    tags=["alerts"],
)

async def get_clients(
    clients_query: Annotated[ClientsParams, Query()],
    user_id: JwtUserId,
    clerk: ClerkSdk,
    db: Database
) -> Sequence[ClientListItem]:
    # Get all Clients in the Org
    if clients_query.org_id is not None:
        orgs = await clerk.organizations.list_async(
            organization_id=[clients_query.org_id],
            user_id=[user_id],
            limit=1
        )
        if orgs is None or len(orgs.data) == 0:
            raise HTTPException(
                status.HTTP_401_UNAUTHORIZED,
                "Organization not found or you don't have access to it"
            )

        return [
            ClientListItem(**doc) async for doc in db[Client.Meta.collection_name()].find(
                {fields(Client).ownerId: orgs.data[0].id},
                {fields(Client).idForApi: False, fields(Client).secretForApi: False}
            )
        ]

    # Get specific Clients by ID(s)
    if clients_query.client_id is not None:
        if isinstance(clients_query.client_id, str): # Single ID
            client = await db[Client.Meta.collection_name()].find_one(
                {"_id": ObjectId(clients_query.client_id)},
                {fields(Client).idForApi: False, fields(Client).secretForApi: False}
            )
            if client is None:
                raise HTTPException(status.HTTP_404_NOT_FOUND, "Client not found")
            clients = [ClientListItem(**client)]
        else:                                        # List of IDs
            clients = [
                ClientListItem(**doc) async for doc in db[Client.Meta.collection_name()].find(
                    {"_id": {"$in": [ObjectId(cid) for cid in clients_query.client_id]}},
                    {fields(Client).idForApi: False, fields(Client).secretForApi: False}
                )
            ]

        # Ensure user has access to all requested Clients
        orgs = await clerk.organizations.list_async(
            organization_id=[client.ownerId for client in clients],
            user_id=[user_id]
        )
        if orgs is None or orgs.total_count != len(set(client.ownerId for client in clients)):
            raise HTTPException(
                status.HTTP_401_UNAUTHORIZED,
                "Client not found or you don't have access to it"
            )

        return clients

    # Get all Clients accessible to the user
    orgs = await clerk.organizations.list_async(user_id=[user_id])
    if orgs is None or len(orgs.data) == 0:
        return []
    return [
        ClientListItem(**doc) async for doc in db[Client.Meta.collection_name()].find(
            {fields(Client).ownerId: {"$in": [org.id for org in orgs.data]}},
            {fields(Client).idForApi: False, fields(Client).secretForApi: False}
        )
    ]
ClientsFromQuery = Annotated[Sequence[ClientListItem], Depends(get_clients)]

class PaginationWithClientsParams(PaginationParams, ClientsParams):
    pass

@router.get("/problems", response_model=PaginatedDataResponse[Sequence[Problem]])
async def get_trigger_alerts(
    query: Annotated[PaginationWithClientsParams, Query()],
    user_id: JwtUserId,
    clerk: ClerkSdk,
    db: Database
) -> PaginatedDataResponse[Sequence[Problem]]:
    clients = await get_clients(query, user_id, clerk, db)
    offset = (query.page - 1) * query.limit
    cursor = db[Problem.Meta.collection_name()].find(
        {fields(Problem).clientId: {"$in": [client.id for client in clients if client.id is not None]}},
        sort=[(fields(Problem).updatedAt, DESCENDING), (fields(Problem).createdAt, DESCENDING)],
        skip=offset,
        limit=query.limit
    )
    results = [Problem(**doc) async for doc in cursor]
    return PaginatedDataResponse(data=results, page=query.page, limit=query.limit)

@router.get("/services", response_model=PaginatedDataResponse[Sequence[Service]])
async def get_service_alerts(
    query: Annotated[PaginationWithClientsParams, Query()],
    user_id: JwtUserId,
    clerk: ClerkSdk,
    db: Database
) -> PaginatedDataResponse[Sequence[Service]]:
    clients = await get_clients(query, user_id, clerk, db)
    offset = (query.page - 1) * query.limit
    cursor = db[Service.Meta.collection_name()].find(
        {fields(Service).clientId: {"$in": [client.id for client in clients if client.id is not None]}},
        sort=[(fields(Service).updatedAt, DESCENDING), (fields(Service).createdAt, DESCENDING)],
        skip=offset,
        limit=query.limit
    )
    results = [Service(**doc) async for doc in cursor]
    return PaginatedDataResponse(data=results, page=query.page, limit=query.limit)

@router.get("/problems/count", response_model=DataResponse[StatCounts])
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

class TimePeriodWithClientsParams(TimePeriodParams, ClientsParams):
    pass

IntervalSeconds = {'hour': 3600, 'day': 86400, 'week': 604800, 'month': 2592000}
@router.get("/problems/trends", response_model=DataResponse[Sequence[StatTrends]])
async def get_trigger_alert_trends(
    query: Annotated[TimePeriodWithClientsParams, Query()],
    user_id: JwtUserId,
    clerk: ClerkSdk,
    db: Database,
    response: Response
) -> DataResponse[Sequence[StatTrends]]:
    clients = await get_clients(query, user_id, clerk, db)

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
        Problem(**doc)
        async for doc in db[Problem.Meta.collection_name()].find({
            fields(Service).clientId: {"$in": [client.id for client in clients if client.id is not None]},
            "$or": [
                {fields(Problem).startedAt: {"$gte": min_time, "$lt": max_time}},
                {
                    fields(Problem).startedAt: {"$lt": min_time},
                    fields(Problem).status: {"$ne": "Recovered"},
                    fields(Problem).recoveryAt: {"$gte": min_time}
                }
            ]
        })
    ]

    new_counts = [0] * num_periods
    resolved_counts = [0] * num_periods
    active_counts = [0] * num_periods

    for p in problems:
        # New Problems
        for i, (bin_start, bin_end) in enumerate(bins):
            if bin_start <= p.startedAt < bin_end:
                new_counts[i] += 1
                break

        # Resolved Problems
        if p.status == "Recovered":
            assert p.recoveryAt is not None, "recoveryAt must be set when Recovered"
            for i, (bin_start, bin_end) in enumerate(bins):
                if bin_start <= p.recoveryAt < bin_end:
                    resolved_counts[i] += 1
                    break

        # Active Problems
        for i, (bin_start, bin_end) in enumerate(bins):
            if bin_start >= p.startedAt and (
                p.status != "Recovered" or (p.recoveryAt is not None and p.recoveryAt >= bin_end)
            ):
                active_counts[i] += 1

    response.headers["Cache-Control"] = f"private, max-age={IntervalSeconds[query.interval] // 60}, must-revalidate"
    return DataResponse(data=[StatTrends(
        timestamp=bins[i][0],
        new=new_counts[i],
        resolved=resolved_counts[i],
        active=active_counts[i]
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
            fields(Service).clientId: {"$in": [c.id for c in clients if c.id is not None]}
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

class InfiniteTimePeriodWithClientsParams(InfiniteTimePeriodParams, ClientsParams):
    pass

@router.get("/hosts/problems/count", response_model=DataResponse[Sequence[StatHostProblemCount]])
async def get_hosts_problem_counts(
    query: Annotated[InfiniteTimePeriodWithClientsParams, Query()],
    user_id: JwtUserId,
    clerk: ClerkSdk,
    db: Database,
    response: Response
) -> DataResponse[Sequence[StatHostProblemCount]]:
    clients = await get_clients(query, user_id, clerk, db)

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
    results = [StatHostProblemCount(**doc["_id"], count=doc["count"]) async for doc in cursor]

    response.headers["Cache-Control"] = "private, max-age=60"
    return DataResponse(data=results)
