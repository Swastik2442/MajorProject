"API Routes for handling promptChart API Endpoints"

from collections.abc import Sequence
from logging import getLogger
from typing import Annotated

from fastapi import APIRouter, Body, HTTPException, Path, status
from fastapi.responses import JSONResponse

from common.models import ThreadLean
from common.models.utils import PyObjectId
from common.services.db import Database
from common.services.auth import JwtUserId
from common.services.hishel import HishelAsyncCacheClient
from common.schemas import ChartAgg, ChartsData, ChartAndData, DataResponse, PaginatedDataResponse, Response as CustomResponse

from src.config import config
from src.middlewares.client import ClientsFromQuery
from src.schemas import PaginationParams, PromptParams, ThreadParams

logger = getLogger(__name__)

router = APIRouter(
    prefix="/promptChart",
    tags=["ai"],
)

@router.post("/start", response_model=DataResponse[ThreadParams])
async def start_prompt_chart(
    body: Annotated[PromptParams, Body()],
    user_id: JwtUserId,
    hishel: HishelAsyncCacheClient
):
    req = await hishel.post(f"{config.LANGCHAIN_API_URL}/agents/x/invoke", data={
        "user_id": str(user_id),
        "prompt": body.prompt
    })
    req.raise_for_status()
    res = await req.json()

    return JSONResponse(
        {"data": {"thread_id": res['data']['thread_id']}, "message": "Execution started"},
        status_code=status.HTTP_202_ACCEPTED,
    )

class ContinuePromptParams(PromptParams, ThreadParams):
    pass

@router.post("/continue", response_model=CustomResponse)
async def continue_prompt_chart(
    body: Annotated[ContinuePromptParams, Body()],
    user_id: JwtUserId,
    hishel: HishelAsyncCacheClient
):
    req = await hishel.post(f"{config.LANGCHAIN_API_URL}/agents/x/invoke", data={
        "user_id": str(user_id),
        "prompt": body.prompt,
        "thread_id": body.thread_id
    })
    req.raise_for_status()
    return JSONResponse(
        {"message": "Execution started"},
        status_code=status.HTTP_202_ACCEPTED,
    )

@router.get("/threads", response_model=PaginatedDataResponse[Sequence[ThreadLean]])
async def get_prompt_chart_threads(
    query: PaginationParams,
    user_id: JwtUserId,
    hishel: HishelAsyncCacheClient
):
    req = await hishel.get(f"{config.LANGCHAIN_API_URL}/threads", params={
        "user_id": str(user_id),
        "page": query.page,
        "limit": query.limit,
    })
    req.raise_for_status()
    res = await req.json()

    return JSONResponse(
        {"data": res['data'], "page": res['page'], "limit": res['limit'], "message": "Threads fetched successfully"},
        status_code=status.HTTP_200_OK,
    )

async def run_aggregation_pipeline(
    clients: ClientsFromQuery,
    collection_name: str,
    pipeline: Sequence[dict],
    db: Database
):
    result = await db[collection_name].aggregate([
        {"$match": {"clientId": {"$in": [c.id for c in clients if c.id is not None]}}},
        *pipeline
    ])
    return await result.to_list()

@router.get("/threads/{thread_id}", response_model=DataResponse[ChartsData])
@router.get("/threads/{thread_id}/{index}", response_model=DataResponse[ChartsData])
async def get_prompt_chart_thread_details(
    thread_id: Annotated[PyObjectId, Path()],
    clients: ClientsFromQuery,
    user_id: JwtUserId,
    hishel: HishelAsyncCacheClient,
    db: Database,
    index: Annotated[int, Path()] | None = -1,
):
    req = await hishel.get(f"{config.LANGCHAIN_API_URL}/threads/{thread_id}/response/{index}", params={
        "user_id": str(user_id),
    })
    req.raise_for_status()
    res = await req.json()
    if res['data'] is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=res.get('message', 'No data found'))
    res=ChartAgg(**res['data'])
    ret=ChartsData(
        description=res.description,
        charts=[
            ChartAndData(
                type=chart.type,
                description=chart.description,
                data_series=chart.data_series,
                data=await run_aggregation_pipeline(
                    clients,
                    chart.collection_name,
                    chart.mongodb_aggregation_pipeline,
                    db
                )
            ) for chart in res.charts or []
        ]
    )

    return JSONResponse(
        {"data": ret, "message": "Thread details fetched successfully"},
        status_code=status.HTTP_200_OK,
    )
