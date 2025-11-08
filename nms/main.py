"API Service to store NMS Alerts"

from contextlib import asynccontextmanager
import logging

from fastapi import FastAPI, Response, status
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from starlette.exceptions import HTTPException as StarletteHTTPException

from common.exceptions import RequestValidationError as CustomRequestValidationError, http_exception_handler, validation_exception_handler
from common.services.auth.clerk import clerk_service
from common.services.db import db_service
from common.services.hishel import hishel_service
from common.services.redis import redis_service
from common.schemas import Response as CustomResponse
from src.config import config
from src.routes import zabbix_router

logging.basicConfig(level=logging.DEBUG if config.DEBUG else None)
logger = logging.getLogger()

@asynccontextmanager
async def lifespan(_app: FastAPI):
    await db_service.connect(dsn=config.MONGO_CONNECTION_URI, db_name=config.DB_NAME)
    await redis_service.connect(dsn=config.REDIS_URL)
    await hishel_service.connect()
    await clerk_service.connect(bearer_auth=config.CLERK_SECRET_KEY, jwks_url=config.CLERK_JWKS_URL, issuer=config.CLERK_ISSUER)

    yield

    await db_service.disconnect()
    await redis_service.disconnect()
    await hishel_service.disconnect()
    await clerk_service.disconnect()

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
