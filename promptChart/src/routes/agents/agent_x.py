"""API Service to serve LangChain based agents"""

import logging
from typing import Annotated

from bson import ObjectId
from fastapi import APIRouter, BackgroundTasks, Body, HTTPException, status, Query
from fastapi.responses import JSONResponse
from langchain_core.runnables import RunnableConfig

from common.models.thread import Thread, PromptResponse
from common.models.utils import fields, to_doc, PyObjectId
from common.services.db import Database
from common.schemas import DataResponse
from common.schemas.chartAgg import ChartAgg as ResponseFormat

from src.agent_x import agent_x, ContextSchema
from src.schemas import InvokeParams, InvokeRequestSchema, InvokeResponseSchema

logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/x",
    tags=["agents", "agent_x"]
)

async def execute_agent_x(
    prompt: str,
    context: ContextSchema,
    thread_id: PyObjectId
) -> ResponseFormat | None:
    aiResponse = await agent_x.ainvoke(
        {"messages": [{"role": "user", "content": prompt}]},
        config=RunnableConfig(
            configurable={"thread_id": thread_id},
            recursion_limit=100
        ),
        context=context # type: ignore
    )
    aiContent = aiResponse["messages"][-1].content

    if aiContent is None or aiContent.strip() == "":
        finalResponse = None
        logger.error("Agent X returned empty content for thread %s", thread_id)
    else:
        finalResponse = ResponseFormat.model_validate_json(aiContent)
        logger.info("Agent X completed for thread %s", thread_id)
        logger.debug("Final Response: %s", finalResponse)

    return finalResponse

async def update_or_insert_thread(
    thread_id: PyObjectId,
    prompt: str,
    response: ResponseFormat | None,
    user_id: str,
    db: Database
):
    thread_exists = await db[Thread.Meta.collection_name()].find_one(
        {"_id": ObjectId(thread_id), fields(Thread).userId: user_id},
        {k: False for k in Thread.model_fields.keys()}
    )

    if thread_exists is None:
        await db[Thread.Meta.collection_name()].insert_one({**to_doc(Thread(
            userId=user_id,
            title=prompt,
            numberOfPrompts=1,
            promptResponses=[PromptResponse(prompt=prompt, response=response)]
        )), "_id": ObjectId(thread_id)})
    else:
        await db[Thread.Meta.collection_name()].update_one(
            {"_id": ObjectId(thread_id)},
            {
                "$push": {
                    fields(Thread).promptResponses: to_doc(PromptResponse(
                        prompt=prompt,
                        response=response
                    ))
                },
                "$inc": {fields(Thread).numberOfPrompts: 1}
            }
        )

async def start_agent_x(
    prompt: str,
    user_id: str,
    thread_id: PyObjectId,
    context: ContextSchema,
    db: Database
):
    try:
        response = await execute_agent_x(prompt, context, thread_id)
    except Exception as e:
        logger.error("Error executing Agent X for thread %s: %s", thread_id, e)
        response = None

    await update_or_insert_thread(thread_id, prompt, response, user_id, db)

# TODO: Add Langfuse for tracing
@router.post("/invoke", response_model=DataResponse[InvokeResponseSchema])
async def invoke_agent_x(
    background_tasks: BackgroundTasks,
    db: Database,
    body: Annotated[InvokeRequestSchema, Body()],
    query: Annotated[InvokeParams, Query()],
):
    # Sanitize inputs
    thread_id = query.thread_id or body.thread_id
    user_id = query.user_id or body.user_id
    if thread_id is None:
        thread_id = PyObjectId(ObjectId())
    if user_id is None:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "user_id is required either in query params or in body.")

    # Start agent in background
    context = ContextSchema(db=db)
    background_tasks.add_task(start_agent_x, body.prompt, user_id, thread_id, context, db)

    return JSONResponse(
        {"data": {"thread_id": str(thread_id)}, "message": "Agent execution started in background."},
        status.HTTP_202_ACCEPTED
    )
