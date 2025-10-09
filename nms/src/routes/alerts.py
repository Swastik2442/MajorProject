"API Routes for serving Zabbix Alerts"

from datetime import datetime, timedelta
from math import ceil
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query, status
from pymongo import DESCENDING

from src.models import Client, Problem, Service
from src.schemas import ClientsParams, DataResponse, PaginationParams, PaginatedDataResponse, StatCounts, StatHealthScores, StatTrends, TimePeriodParams
from src.services.auth import ClerkSdk, JwtUserId
from src.services.db import Database
from src.models.utils import fields, now

router = APIRouter(
    prefix="/alerts",
    tags=["alerts"],
)

async def get_clients(
    clients_query: Annotated[ClientsParams, Query()],
    user_id: JwtUserId,
    clerk: ClerkSdk,
    db: Database
) -> list[Client]:
    # Get all Clients in the Org
    if clients_query.org_id is not None:
        orgs = await clerk.organizations.list_async(
            organization_id=[clients_query.org_id],
            user_id=[user_id],
            limit=1
        )
        if orgs is None or len(orgs.data) == 0:
            raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Organization not found or you don't have access to it")

        return [
            Client(**doc) async for doc in db[Client.Meta.collection_name()].find({
                fields(Client).ownerId: orgs.data[0].id
            })
        ]

    # Get specific Clients by ID(s)
    if clients_query.client_id is not None:
        if isinstance(clients_query.client_id, str):
            client = await db[Client.Meta.collection_name()].find_one({
                fields(Client).id: clients_query.client_id
            })
            if client is None:
                raise HTTPException(status.HTTP_404_NOT_FOUND, "Client not found")
            clients = [Client(**client)]
        else:
            clients = [
                Client(**doc) async for doc in db[Client.Meta.collection_name()].find({
                    fields(Client).id: {"$in": clients_query.client_id}
                })
            ]

        orgs = await clerk.organizations.list_async(
            organization_id=[client.ownerId for client in clients],
            user_id=[user_id]
        )
        if orgs is None or len(orgs.data) != len(set(client.ownerId for client in clients)):
            raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Client not found or you don't have access to it")

        return clients

    # Get all Clients accessible to the user
    orgs = await clerk.organizations.list_async(user_id=[user_id])
    if orgs is None or len(orgs.data) == 0:
        return []
    return [
        Client(**doc) async for doc in db[Client.Meta.collection_name()].find({
            fields(Client).ownerId: {"$in": [org.id for org in orgs.data]}
        })
    ]
ClientsFromQuery = Annotated[list[Client], Depends(get_clients)]

@router.get("/problems", response_model=PaginatedDataResponse[list[Problem]])
async def get_trigger_alerts(filter_query: Annotated[PaginationParams, Query()], clients: ClientsFromQuery, db: Database):
    offset = (filter_query.page - 1) * filter_query.limit
    cursor = db[Problem.Meta.collection_name()].find(
        {fields(Problem).clientId: {"$in": [client.id for client in clients if client.id is not None]}},
        sort=[(fields(Problem).updatedAt, DESCENDING), (fields(Problem).createdAt, DESCENDING)],
        skip=offset,
        limit=filter_query.limit
    )
    results = [Problem(**doc) async for doc in cursor]
    return PaginatedDataResponse[list[Problem]](data=results, page=filter_query.page, limit=filter_query.limit)

@router.get("/services", response_model=PaginatedDataResponse[list[Service]])
async def get_service_alerts(filter_query: Annotated[PaginationParams, Query()], clients: ClientsFromQuery, db: Database):
    offset = (filter_query.page - 1) * filter_query.limit
    cursor = db[Service.Meta.collection_name()].find(
        {fields(Service).clientId: {"$in": [client.id for client in clients if client.id is not None]}},
        sort=[(fields(Service).updatedAt, DESCENDING), (fields(Service).createdAt, DESCENDING)],
        skip=offset,
        limit=filter_query.limit
    )
    results = [Service(**doc) async for doc in cursor]
    return PaginatedDataResponse[list[Service]](data=results, page=filter_query.page, limit=filter_query.limit)

@router.get("/problems/count", response_model=DataResponse[StatCounts])
async def get_trigger_alerts_count(clients: ClientsFromQuery, db: Database):
    curr = now().timestamp()
    clientIds = [client.id for client in clients if client.id is not None]
    activeProblems = await db[Problem.Meta.collection_name()].count_documents({
        fields(Problem).clientId: {"$in": clientIds},
        fields(Problem).status: {"$ne": "Recovered"}
    })
    problemsInLast24Hours = await db[Problem.Meta.collection_name()].count_documents({
        fields(Problem).clientId: {"$in": clientIds},
        fields(Problem).createdAt: {"$gte": (curr - 86400)}  # type: ignore
    })
    problemsInLastWeek = await db[Problem.Meta.collection_name()].count_documents({
        fields(Problem).clientId: {"$in": clientIds},
        fields(Problem).createdAt: {"$gte": (curr - 604800)}  # type: ignore
    })
    problemsInLastMonth = await db[Problem.Meta.collection_name()].count_documents({
        fields(Problem).clientId: {"$in": clientIds},
        fields(Problem).createdAt: {"$gte": (curr - 2592000)}  # type: ignore
    })

    return DataResponse[StatCounts](data=StatCounts(
        activeProblems=activeProblems,
        problemsInLast24Hours=problemsInLast24Hours,
        problemsInLastWeek=problemsInLastWeek,
        problemsInLastMonth=problemsInLastMonth
    ))

IntervalSeconds = {'hour': 3600, 'day': 86400, 'week': 604800, 'month': 2592000}
@router.get("/problems/trends", response_model=DataResponse[list[StatTrends]])
async def get_trigger_alert_trends(search_query: Annotated[TimePeriodParams, Query()], clients: ClientsFromQuery, db: Database):
    # Get specific time periods
    bins: list[tuple[datetime, datetime]] = []
    intervalStr = "days" if search_query.interval == "month" else search_query.interval + "s"
    intervalDiff = 30 if search_query.interval == "month" else 1
    num_periods = ceil((search_query.end.timestamp() - search_query.start.timestamp()) / IntervalSeconds[search_query.interval])
    for i in range(num_periods):
        bin_start = search_query.start + timedelta(**{intervalStr: i * intervalDiff})
        bin_end = bin_start + timedelta(**{intervalStr: intervalDiff})
        if bin_end > search_query.end:
            bins.append((bin_start, search_query.end))
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

    return DataResponse[list[StatTrends]](data=[StatTrends(
        timestamp=bins[i][0],
        new=new_counts[i],
        resolved=resolved_counts[i],
        active=active_counts[i]
    ) for i in range(num_periods)])

@router.get("/hosts/health", response_model=DataResponse[list[StatHealthScores]])
async def get_hosts_health_scores(clients: ClientsFromQuery, db: Database):
    # Aggregate problem severity counts per host
    pipeline = [
        {"$match": {
            fields(Service).clientId: {"$in": [client.id for client in clients if client.id is not None]},
            fields(Problem).status: {"$ne": "Recovered"}}
        },
        {"$group": {
            "_id": "$" + fields(Problem).hostname,
            "totalProblems": {"$sum": 1},
            "notClassified": {"$sum": {"$cond": [{"$eq": ["$" + fields(Problem).severity, "Not classified"]}, 1, 0]}},
            "information": {"$sum": {"$cond": [{"$eq": ["$" + fields(Problem).severity, "Information"]}, 1, 0]}},
            "warning": {"$sum": {"$cond": [{"$eq": ["$" + fields(Problem).severity, "Warning"]}, 1, 0]}},
            "average": {"$sum": {"$cond": [{"$eq": ["$" + fields(Problem).severity, "Average"]}, 1, 0]}},
            "high": {"$sum": {"$cond": [{"$eq": ["$" + fields(Problem).severity, "High"]}, 1, 0]}},
            "disaster": {"$sum": {"$cond": [{"$eq": ["$" + fields(Problem).severity, "Disaster"]}, 1, 0]}},
        }},
        {"$project": {
            "totalProblems": 1,
            "notClassified": 1,
            "information": 1,
            "warning": 1,
            "average": 1,
            "high": 1,
            "disaster": 1,
            "healthScore": {
                "$cond": [
                    {"$eq": ["$totalProblems", 0]},
                    100,
                    {"$max": [0, { # max(0, 100 - (100 * (weighted_score / (50 * total_problems))))
                        "$subtract": [
                            100,
                            {"$multiply": [
                                100,
                                {
                                    "$divide": [
                                        {"$add": [
                                            {"$multiply": ["$notClassified", 1]},
                                            {"$multiply": ["$information", 3]},
                                            {"$multiply": ["$warning", 5]},
                                            {"$multiply": ["$average", 10]},
                                            {"$multiply": ["$high", 20]},
                                            {"$multiply": ["$disaster", 50]},
                                        ]},
                                        { "$multiply": ["$totalProblems", 50] }
                                    ]
                                }
                            ]}
                        ]
                    }]}
                ]
            }
        }},
        {"$sort": {"healthScore": -1}}
    ]
    cursor = await db[Problem.Meta.collection_name()].aggregate(pipeline)
    results = [StatHealthScores(**doc) async for doc in cursor]
    return DataResponse[list[StatHealthScores]](data=results)
