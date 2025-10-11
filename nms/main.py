"API Service to store and serve Zabbix Alerts"

from contextlib import asynccontextmanager
import logging

from fastapi import FastAPI, Response, status
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from starlette.exceptions import HTTPException as StarletteHTTPException

from src.exceptions import RequestValidationError as CustomRequestValidationError, http_exception_handler, validation_exception_handler
from src.routes import alerts_router, clients_router, zabbix_router
from src.services.db import connect, disconnect
from src.schemas import Response as CustomResponse

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger()

@asynccontextmanager
async def lifespan(_app: FastAPI):
    await connect()
    yield
    await disconnect()

app = FastAPI(
    title="NMS API",
    lifespan=lifespan,
    exception_handlers={
        StarletteHTTPException: http_exception_handler,
        RequestValidationError: validation_exception_handler
    },
    responses={
        422: {"model": CustomRequestValidationError}
    }
)

origins = ["http://localhost:5173"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

@app.get("/", include_in_schema=False)
def root():
    return CustomResponse(message="API for Zabbix Alerts Storage")

@app.get("/favicon.ico", include_in_schema=False)
def favicon():
    return Response(status_code=status.HTTP_204_NO_CONTENT)

app.include_router(zabbix_router)
app.include_router(alerts_router)
app.include_router(clients_router)
