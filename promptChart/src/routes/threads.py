"""API Service to serve LangChain based agents"""

from collections.abc import Sequence
from logging import getLogger
from typing import Annotated

from bson import ObjectId
from fastapi import APIRouter, HTTPException, Path, Query, status
from pymongo import DESCENDING

from common.models import Thread, ThreadLean
from common.models.utils import fields, PyObjectId
from common.services.db import Database
from common.schemas import ChartAgg as ResponseFormat, DataResponse, PaginatedDataResponse

from src.schemas import PaginationParams

logger = getLogger(__name__)

router = APIRouter(
    prefix="/threads",
    tags=["threads"]
)

@router.get("/{user_id}", response_model=PaginatedDataResponse[Sequence[ThreadLean]])
async def get_user_threads(
    query: Annotated[PaginationParams, Query()],
    user_id: Annotated[str, Path()],
    db: Database
) -> PaginatedDataResponse[Sequence[ThreadLean]]:
    offset = (query.page - 1) * query.limit
    threads_cursor = db[Thread.Meta.collection_name()].find(
        {fields(Thread).userId: user_id},
        {fields(Thread).promptResponses: False},
        sort=[(fields(Thread).updatedAt, DESCENDING), (fields(Thread).createdAt, DESCENDING)],
        skip=offset,
        limit=query.limit
    )
    threads = [ThreadLean(**thread_doc) async for thread_doc in threads_cursor]
    return PaginatedDataResponse(data=threads, page=query.page, limit=query.limit)

@router.get("/{user_id}/{thread_id}/response", response_model=DataResponse[ResponseFormat])
@router.get("/{user_id}/{thread_id}/response/{index}", response_model=DataResponse[ResponseFormat])
async def get_thread_response(
    user_id: Annotated[str, Path()],
    thread_id: Annotated[PyObjectId, Path()],
    db: Database,
    index: Annotated[int, Path()] | Annotated[int | None, Query()] = -1,
) -> DataResponse[ResponseFormat]:
    logger.warning("Fetching response for thread_id: %s, user_id: %s, index: %s", thread_id, user_id, index)
    thread = await db[Thread.Meta.collection_name()].find_one(
        {"_id": ObjectId(thread_id), fields(Thread).userId: user_id}
    )
    if thread is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "No such thread ID found")

    thread = Thread(**thread)
    if len(thread.promptResponses) == 0:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "No responses found for the given thread ID")

    if index is None:
        index = -1
    if index < -len(thread.promptResponses) or index >= len(thread.promptResponses):
        raise HTTPException(status.HTTP_422_UNPROCESSABLE_CONTENT, "Index out of bounds for prompt responses.")

    return DataResponse(data=thread.promptResponses[index].response)
