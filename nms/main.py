"API Service to store NMS Alerts"

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
from src.routes import zabbix_router

if config.DEBUG:
    logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger()

@asynccontextmanager
async def lifespan(_app: FastAPI):
    await db_service.connect(dsn=config.MONGO_CONNECTION_URI, db_name=config.DB_NAME)
    yield
    await db_service.disconnect()

app = FastAPI(
    title="NMS API",
    version="0.4.1",
    description="API Service to store Zabbix Alerts",
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
    return CustomResponse(message="API for NMS Alerts Storage")

@app.get("/favicon.png", include_in_schema=False)
@app.get("/favicon.ico", include_in_schema=False)
def favicon():
    return Response(status_code=status.HTTP_204_NO_CONTENT)

app.include_router(zabbix_router)
