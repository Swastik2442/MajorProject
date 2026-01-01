"API Routes for handling promptChart API Endpoints"

from collections.abc import Sequence
from typing import Annotated

from common.exceptions import HTTPException as CustomHTTPException
from common.models import ThreadLean
from common.models.thread import PromptResponse, ThreadUpdate
from common.models.utils import PyObjectId
from common.schemas import ChartAndData, ChartsData, DataResponse, PaginatedDataResponse
from common.schemas import Response as CustomResponse
from common.services.auth import JwtUserId
from common.services.db import Database
from common.services.hishel import HishelAsyncCacheClient
from fastapi import APIRouter, Body, HTTPException, Path, Query, status
from fastapi.responses import JSONResponse

from src.config import config
from src.middlewares.client import ClientsFromQuery
from src.schemas import PaginationParams, PromptParams, ThreadParams

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
    res = await hishel.post(
        f"{config.LANGCHAIN_API_URL}/agents/x/invoke",
        json={
            "user_id": str(user_id),
            "prompt": body.prompt
        }
    )
    res.raise_for_status()
    return JSONResponse(
        res.json(),
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
    res = await hishel.post(
        f"{config.LANGCHAIN_API_URL}/agents/x/invoke",
        json={
            "user_id": str(user_id),
            "prompt": body.prompt,
            "thread_id": str(body.thread_id)
        }
    )
    res.raise_for_status()
    return JSONResponse(
        {"message": "Execution started"},
        status_code=status.HTTP_202_ACCEPTED,
    )

@router.get("/threads", response_model=PaginatedDataResponse[Sequence[ThreadLean]])
async def get_prompt_chart_threads(
    query: Annotated[PaginationParams, Query()],
    user_id: JwtUserId,
    hishel: HishelAsyncCacheClient
):
    res = await hishel.get(
        f"{config.LANGCHAIN_API_URL}/threads/{user_id}",
        params={
            "page": query.page,
            "limit": query.limit,
        }
    )
    res.raise_for_status()
    return res.json()

async def run_aggregation_pipeline(
    clients: ClientsFromQuery,
    collection_name: str,
    pipeline: Sequence[dict],
    db: Database
):
    result = await db[collection_name].aggregate([
        {"$match": {"clientId": {"$in": [c.id for c in clients if c.id is not None]}}},
        *pipeline
    ], comment="AI-Generated Pipeline Execution")
    return await result.to_list()

@router.get(
    "/threads/{thread_id}",
    response_model=DataResponse[ChartsData],
    responses={404: {"model": CustomHTTPException}, 422: {"model": CustomHTTPException}}
)
@router.get(
    "/threads/{thread_id}/{index}",
    response_model=DataResponse[ChartsData],
    responses={404: {"model": CustomHTTPException}, 422: {"model": CustomHTTPException}}
)
async def get_prompt_chart_thread_details(
    thread_id: Annotated[PyObjectId, Path()],
    clients: ClientsFromQuery,
    user_id: JwtUserId,
    hishel: HishelAsyncCacheClient,
    db: Database,
    index: Annotated[int, Path()] | None = -1,
):
    if index is None:
        index = -1
    res = await hishel.get(
        f"{config.LANGCHAIN_API_URL}/threads/{user_id}/{thread_id}/response/{index}"
    )
    data = res.json()

    if res.status_code == status.HTTP_404_NOT_FOUND:
        raise HTTPException(status.HTTP_404_NOT_FOUND, data.get('message', 'No data found'))
    if res.status_code == status.HTTP_422_UNPROCESSABLE_CONTENT:
        raise HTTPException(status.HTTP_422_UNPROCESSABLE_CONTENT, data.get('message', 'Unprocessable content'))
    res.raise_for_status()
    data = PromptResponse(**data['data'])

    return {"data": ChartsData(
        createdAt=data.createdAt,
        prompt=data.prompt,
        description=data.response.description if data.response is not None else "",
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
            ) for chart in (data.response.charts or []) # pylint: disable=E1101
        ] if data.response is not None else None
    )}

@router.patch(
    "/threads/{thread_id}",
    response_model=CustomResponse,
    responses={404: {"model": CustomHTTPException}}
)
async def update_thread(
    user_id: JwtUserId,
    thread_id: Annotated[PyObjectId, Path()],
    body: Annotated[ThreadUpdate, Body()],
    hishel: HishelAsyncCacheClient,
):
    res = await hishel.patch(
        f"{config.LANGCHAIN_API_URL}/threads/{user_id}/{thread_id}",
        json=body.model_dump(),
    )
    data = res.json()

    if res.status_code == status.HTTP_404_NOT_FOUND:
        raise HTTPException(status.HTTP_404_NOT_FOUND, data.get('message', 'No Thread found'))
    if res.status_code == status.HTTP_422_UNPROCESSABLE_CONTENT:
        raise HTTPException(status.HTTP_422_UNPROCESSABLE_CONTENT, data.get('message', 'Unprocessable content'))
    res.raise_for_status()
    return {"message": "Thread updated successfully"}

@router.delete(
    "/threads/{thread_id}",
    response_model=CustomResponse,
    responses={404: {"model": CustomHTTPException}}
)
async def delete_thread(
    user_id: JwtUserId,
    thread_id: Annotated[PyObjectId, Path()],
    hishel: HishelAsyncCacheClient,
):
    res = await hishel.delete(
        f"{config.LANGCHAIN_API_URL}/threads/{user_id}/{thread_id}",
    )
    data = res.json()

    if res.status_code == status.HTTP_404_NOT_FOUND:
        raise HTTPException(status.HTTP_404_NOT_FOUND, data.get('message', 'No Thread found'))
    res.raise_for_status()
    return {"message": "Thread deleted successfully"}
