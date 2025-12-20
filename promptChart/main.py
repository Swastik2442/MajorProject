"""API Service to serve LangChain based agents"""

from contextlib import asynccontextmanager
import logging

from fastapi import FastAPI, Response, status
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from starlette.exceptions import HTTPException as StarletteHTTPException

from common.exceptions import RequestValidationError as CustomRequestValidationError, http_exception_handler, validation_exception_handler
from common.services.db import db_service
from common.schemas import Response as CustomResponse

from src.config import config
from src.routes import agents_router, threads_router

if config.DEBUG:
    logging.basicConfig(level=logging.DEBUG)
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

@app.get("/", include_in_schema=False)
def root():
    return CustomResponse(message="API for LangChain based agents")

@app.get("/favicon.png", include_in_schema=False)
@app.get("/favicon.ico", include_in_schema=False)
def favicon():
    return Response(status_code=status.HTTP_204_NO_CONTENT)

app.include_router(agents_router)
app.include_router(threads_router)
