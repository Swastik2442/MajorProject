"""API Service to serve LangChain based agents"""

from collections.abc import Sequence
from logging import getLogger
from typing import Annotated

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

@router.get("{thread_id}/response", response_model=DataResponse[ResponseFormat])
@router.get("{thread_id}/response/{index}", response_model=DataResponse[ResponseFormat])
async def get_thread_response(
    thread_id: PyObjectId,
    db: Database,
    index: int = -1,
) -> DataResponse[ResponseFormat]:
    thread = await db[Thread.Meta.collection_name()].find_one({"_id": thread_id})
    if thread is None:
        return DataResponse(message="No such thread ID found")

    thread = Thread(**thread)
    if len(thread.promptResponses) == 0:
        return DataResponse(message="No responses found for the given thread ID")

    if index < -len(thread.promptResponses) or index >= len(thread.promptResponses):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Index out of bounds for prompt responses.")

    last_response = thread.promptResponses[index].response
    return DataResponse(data=last_response)
