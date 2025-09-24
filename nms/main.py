"API Service to store and serve Zabbix Alerts"

from contextlib import asynccontextmanager
import logging

from fastapi import FastAPI, Response, status
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from pymongo import AsyncMongoClient
from starlette.exceptions import HTTPException as StarletteHTTPException

from src.config import DB_NAME, MONGO_CONNECTION_URI, PROBLEMS_COL_NAME, SERVICES_COL_NAME
from src.exceptions import RequestValidationError as CustomRequestValidationError, http_exception_handler, validation_exception_handler
from src.models import init_problems_col, init_services_col
from src.routes import alerts_router, zabbix_router
from src.schemas import Response as CustomResponse

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger()

@asynccontextmanager
async def lifespan(app: FastAPI):
    app.state.db_client = AsyncMongoClient(MONGO_CONNECTION_URI)
    app.state.db = app.state.db_client[DB_NAME]
    logger.info("Connected to MongoDB database")
    await init_problems_col(app.state.db[PROBLEMS_COL_NAME])
    await init_services_col(app.state.db[SERVICES_COL_NAME])
    yield

    await app.state.db_client.close()
    logger.info("Closed connection to database")

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
