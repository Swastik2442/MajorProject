"API Service to store and serve Zabbix Alerts"

from contextlib import asynccontextmanager
import logging

from fastapi import FastAPI, Response, status
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from starlette.exceptions import HTTPException as StarletteHTTPException

from src.config import config
from src.exceptions import RequestValidationError as CustomRequestValidationError, http_exception_handler, validation_exception_handler
from src.routes import alerts_router, clients_router, zabbix_router
from src.services.auth.clerk import clerk_service
from src.services.db import db_service
from src.services.hishel import hishel_service
from src.services.redis import redis_service
from src.schemas import Response as CustomResponse

logging.basicConfig(level=logging.DEBUG if config.DEBUG else None)
logger = logging.getLogger()

@asynccontextmanager
async def lifespan(_app: FastAPI):
    await db_service.connect()
    await redis_service.connect()
    await hishel_service.connect()
    await clerk_service.connect()

    yield

    await db_service.disconnect()
    await redis_service.disconnect()
    await hishel_service.disconnect()
    await clerk_service.disconnect()

app = FastAPI(
    title="NMS API",
    version="0.3.2",
    description="API Service to store and serve Zabbix Alerts",
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
    return CustomResponse(message="API for Zabbix Alerts Storage")

@app.get("/favicon.png", include_in_schema=False)
@app.get("/favicon.ico", include_in_schema=False)
def favicon():
    return Response(status_code=status.HTTP_204_NO_CONTENT)

app.include_router(zabbix_router)
app.include_router(alerts_router)
app.include_router(clients_router)
