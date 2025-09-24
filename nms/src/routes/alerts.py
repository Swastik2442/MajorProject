"API Routes for serving Zabbix Alerts"

from datetime import datetime
from typing import Annotated

from fastapi import APIRouter, Query, Request
from pymongo import DESCENDING
from pymongo.asynchronous.database import AsyncDatabase

from ..config import PROBLEMS_COL_NAME, SERVICES_COL_NAME
from ..models import Problem, Service
from ..schemas import DataResponse, PaginationParams, PaginatedDataResponse, StatCounts, StatHealthScores
from ..utils import fields

router = APIRouter(
    prefix="/alerts",
    tags=["alerts"],
)

@router.get("/problems", response_model=PaginatedDataResponse[list[Problem]])
async def get_trigger_alerts(req: Request, filter_query: Annotated[PaginationParams, Query()]):
    offset = (filter_query.page - 1) * filter_query.limit
    db: AsyncDatabase = req.app.state.db
    cursor = db[PROBLEMS_COL_NAME].find(
        sort=[(fields(Problem).updatedAt, DESCENDING), (fields(Problem).createdAt, DESCENDING)],
        skip=offset,
        limit=filter_query.limit
    )
    results = [Problem(**doc) async for doc in cursor]
    return PaginatedDataResponse[list[Problem]](data=results, page=filter_query.page, limit=filter_query.limit)

@router.get("/services", response_model=PaginatedDataResponse[list[Service]])
async def get_service_alerts(req: Request, filter_query: Annotated[PaginationParams, Query()]):
    offset = (filter_query.page - 1) * filter_query.limit
    db: AsyncDatabase = req.app.state.db
    cursor = db[SERVICES_COL_NAME].find(
        sort=[(fields(Service).updatedAt, DESCENDING), (fields(Service).createdAt, DESCENDING)],
        skip=offset,
        limit=filter_query.limit
    )
    results = [Service(**doc) async for doc in cursor]
    return PaginatedDataResponse[list[Service]](data=results, page=filter_query.page, limit=filter_query.limit)

@router.get("/problems/count", response_model=DataResponse[StatCounts])
async def get_trigger_alerts_count(req: Request):
    db: AsyncDatabase = req.app.state.db

    now = datetime.now().timestamp()
    activeProblems = await db[PROBLEMS_COL_NAME].count_documents(
        {fields(Problem).status: {"$ne": "Recovered"}}
    )
    problemsInLast24Hours = await db[PROBLEMS_COL_NAME].count_documents(
        {fields(Problem).createdAt: {"$gte": (now - 86400)}} # type: ignore
    )
    problemsInLastWeek = await db[PROBLEMS_COL_NAME].count_documents(
        {fields(Problem).createdAt: {"$gte": (now - 604800)}} # type: ignore
    )
    problemsInLastMonth = await db[PROBLEMS_COL_NAME].count_documents(
        {fields(Problem).createdAt: {"$gte": (now - 2592000)}} # type: ignore
    )

    return DataResponse[StatCounts](data=StatCounts(
        activeProblems=activeProblems,
        problemsInLast24Hours=problemsInLast24Hours,
        problemsInLastWeek=problemsInLastWeek,
        problemsInLastMonth=problemsInLastMonth
    ))

@router.get("/hosts/health", response_model=DataResponse[list[StatHealthScores]])
async def hosts_health_scores(req: Request):
    db: AsyncDatabase = req.app.state.db

    # Aggregate problem severity counts per host
    pipeline = [
        {"$match": {fields(Problem).status: {"$ne": "Recovered"}}},
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
    cursor = await db[PROBLEMS_COL_NAME].aggregate(pipeline)
    results = [StatHealthScores(**doc) async for doc in cursor]
    return DataResponse[list[StatHealthScores]](data=results)
