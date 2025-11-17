"""API Service to serve LangChain based agents"""

from contextlib import asynccontextmanager
import logging
from typing import Annotated

from bson import ObjectId
from fastapi import BackgroundTasks, Body, FastAPI, HTTPException, Response, status, Query
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from langchain_core.runnables import RunnableConfig
from pydantic import BaseModel, Field
from starlette.exceptions import HTTPException as StarletteHTTPException

from common.exceptions import RequestValidationError as CustomRequestValidationError, http_exception_handler, validation_exception_handler
from common.models.thread import Thread, PromptResponse
from common.models.utils import fields, none, to_doc, PyObjectId
from common.services.db import Database, db_service
from common.schemas import Response as CustomResponse, DataResponse
from common.schemas.chartAgg import ChartAgg as ResponseFormat

from src.agent_x import agent_x, ContextSchema
from src.config import config

logging.basicConfig(level=logging.DEBUG if config.DEBUG else None)
logger = logging.getLogger()

@asynccontextmanager
async def lifespan(_app: FastAPI):
    await db_service.connect(dsn=config.MONGO_CONNECTION_URI, db_name=config.MONGO_DB_NAME)
    yield
    await db_service.disconnect()

app = FastAPI(
    title="LangChain API",
    version="0.2.0",
    description="API Service to serve LangChain based agents",
    lifespan=lifespan,
    exception_handlers={
        StarletteHTTPException: http_exception_handler,
        RequestValidationError: validation_exception_handler
    },
    responses={
        422: {"model": CustomRequestValidationError}
    },
    **({} if config.ENV == "dev" else { # type: ignore[argument-type]
        "openapi_url": None,
        "docs_url": None,
        "redoc_url": None,
        "swagger_ui_oauth2_redirect_url": None
    })
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=config.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

async def start_agent_x(
    prompt: str,
    user_id: str,
    thread_id: PyObjectId,
    context: ContextSchema,
    db: Database
):
    agent_config = RunnableConfig(configurable={"thread_id": thread_id}, recursion_limit=100)
    response = await agent_x.ainvoke(
        {"messages": [{"role": "user", "content": prompt}]},
        config=agent_config,
        context=context
    )
    finalResponse = ResponseFormat.model_validate_json(response["messages"][-1].content)
    logger.info("Agent X completed for thread %s. Final Response: %s", thread_id, finalResponse)

    # save last response to database
    thread = await db[Thread.Meta.collection_name()].find_one({"_id": thread_id, fields(Thread).userId: user_id})
    if thread is None:
        await db[Thread.Meta.collection_name()].insert_one(to_doc(Thread(
            _id=thread_id,
            userId=user_id,
            promptResponses=[
                PromptResponse(prompt=prompt, response=finalResponse)
            ]
        )))
    else:
        await db[Thread.Meta.collection_name()].update_one(
            {"_id": thread_id},
            {"$push": {
                fields(Thread).promptResponses: to_doc(PromptResponse(prompt=prompt, response=finalResponse))
            }}
        )

class InputSchema(BaseModel):
    prompt: str
    user_id: str | None = Field(default_factory=none)
    thread_id: PyObjectId | None = Field(default_factory=none)
class InvokeResponseSchema(BaseModel):
    thread_id: str

# TODO: Add Langfuse for tracing
@app.post("/agent_x/execute", response_model=DataResponse[InvokeResponseSchema])
async def invoke_agent_x(
    background_tasks: BackgroundTasks,
    db: Database,
    body: Annotated[InputSchema, Body()],
    user_id: Annotated[str | None, Query()] = None,
    thread_id: Annotated[PyObjectId | None, Query()] = None,
):
    context = ContextSchema(db=db)

    thread_id = thread_id or body.thread_id
    user_id = user_id or body.user_id
    if thread_id is None:
        thread_id = PyObjectId(ObjectId())
    if user_id is None:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="user_id is required either in query params or in body.")

    background_tasks.add_task(start_agent_x, body.prompt, user_id, thread_id, context, db)
    return JSONResponse(
        {"data": {"thread_id": thread_id}, "message": "Agent execution started in background."},
        status_code=status.HTTP_202_ACCEPTED,
    )

@app.get("/agent_x/response", response_model=DataResponse[ResponseFormat])
@app.get("/agent_x/response/{index}", response_model=DataResponse[ResponseFormat])
async def get_agent_response(
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

@app.get("/", include_in_schema=False)
def root():
    return CustomResponse(message="API for LangChain based agents")

@app.get("/favicon.png", include_in_schema=False)
@app.get("/favicon.ico", include_in_schema=False)
def favicon():
    return Response(status_code=status.HTTP_204_NO_CONTENT)
