"API Service to store Zabbix Alerts in Local Storage"

from contextlib import asynccontextmanager
import logging
from typing import Annotated

from fastapi import FastAPI, HTTPException, Query, Request, Response, status
from fastapi.exceptions import RequestValidationError
from pydantic import BaseModel, Field
from pymongo import AsyncMongoClient, DESCENDING
from pymongo.asynchronous.database import AsyncDatabase
from starlette.exceptions import HTTPException as StarletteHTTPException

from templates import parse_json_message
from config import DB_NAME, MONGO_CONNECTION_URI, PROBLEMS_COL_NAME, SERVICES_COL_NAME
from models import Problem, ProblemUpdate, Service, ServiceUpdate, Update, init_problems_col, init_services_col
from utils import CustomRequestValidationError, FilterParams, PaginatedResponseModel, ResponseModel, none, to_doc

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

app = FastAPI(title="NMS API", lifespan=lifespan)

@app.exception_handler(StarletteHTTPException)
async def http_exception_handler(_req: Request, exc: StarletteHTTPException):
    return Response(
        ResponseModel(status="error", message=exc.detail).model_dump_json(),
        status_code=exc.status_code
    )

@app.exception_handler(RequestValidationError)
def validation_exception_handler(_req: Request, exc: RequestValidationError):
    return Response(
        CustomRequestValidationError(error=list(exc.errors())[0]).model_dump_json(),
        status.HTTP_422_UNPROCESSABLE_ENTITY,
    )

class ZabbixAlert(BaseModel):
    "Expected Payload from Zabbix webhook"
    to: str | None = Field(default_factory=none, description="IP/DNS Address of receiving Server")
    subject: str = Field(description="Subject of the Alert")
    message: str = Field(description="JSON message containing the details of the Alert")

@app.post("/zabbix/webhook", response_model=ResponseModel[None])
async def receive_alert(request: Request, alert: ZabbixAlert):
    if request.client is None:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Cannot determine client address")

    logger.debug("Received alert (at %s) from %s with subject \"%s\"", alert.to, request.client.host, alert.subject)
    logger.debug("Message: %s", alert.message)
    try:
        data = parse_json_message(alert.message)
    except ValueError as e:
        logger.warning("Failed to parse alert message: %s", e)
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid alert message") from e

    # Insert/Update in the Database
    db: AsyncDatabase = request.app.state.db
    match data.type:
        case "problem":
            await db[PROBLEMS_COL_NAME].insert_one(to_doc(Problem(
                zid=data.event.id,
                name=data.event.name,
                severity=data.event.severity,
                start_time=data.event.time,
                start_date=data.event.date,
                hostname=data.host.name,
                status="Started"
            )))
        case "problem_recovery":
            problem = await db[PROBLEMS_COL_NAME].find_one({"zid": data.event.id})
            if problem is None:
                problem = await db[PROBLEMS_COL_NAME].insert_one(to_doc(Problem(
                    zid=data.event.id,
                    name=data.event.name,
                    severity=data.event.severity,
                    start_time=data.event.recovery.time,
                    start_date=data.event.recovery.date,
                    recovery_time=data.event.recovery.time,
                    recovery_date=data.event.recovery.date,
                    duration=data.event.duration,
                    hostname=data.host.name,
                    status="Recovered"
                )))
            else:
                await db[PROBLEMS_COL_NAME].update_one(
                    {"zid": data.event.id},
                    {"$set": to_doc(ProblemUpdate(
                        severity=data.event.severity,
                        recovery_time=data.event.recovery.time,
                        recovery_date=data.event.recovery.date,
                        duration=data.event.duration,
                        status="Recovered"
                    )), "$push": {"updates": to_doc(Update(
                        action="Recovered",
                        date=data.event.recovery.date,
                        time=data.event.recovery.time
                    ))}}
                )
        case "problem_update":
            problem = await db[PROBLEMS_COL_NAME].find_one({"zid": data.event.id})
            if problem is None:
                problem = await db[PROBLEMS_COL_NAME].insert_one(to_doc(Problem(
                    zid=data.event.id,
                    name=data.event.name,
                    severity="Not classified",
                    start_time=data.event.update.time,
                    start_date=data.event.update.date,
                    hostname="Unknown",
                    age=data.event.age,
                    status=data.event.status
                )))
            else:
                await db[PROBLEMS_COL_NAME].update_one(
                    {"zid": data.event.id},
                    {"$push": {"updates": to_doc(Update(
                        action=data.event.update.action,
                        date=data.event.update.date,
                        time=data.event.update.time,
                        message=data.event.update.message,
                        username=data.user.fullname
                    ))}}
                )
        case "service":
            await db[SERVICES_COL_NAME].insert_one(to_doc(Service(
                zid=data.event.id,
                name=data.event.name,
                description=data.service.description,
                rootcause=data.service.rootcause,
                start_date=data.event.date,
                start_time=data.event.time,
                severity=data.event.severity
            )))
        case "service_recovery":
            service = await db[SERVICES_COL_NAME].find_one({"zid": data.event.id})
            if service is None:
                await db[SERVICES_COL_NAME].insert_one(to_doc(Service(
                    zid=data.event.id,
                    name=data.event.name,
                    description=data.service.description,
                    rootcause="Unknown",
                    start_date=data.event.recovery.date,
                    start_time=data.event.recovery.time,
                    recovery_date=data.event.recovery.date,
                    recovery_time=data.event.recovery.time,
                    severity=data.event.severity
                )))
            else:
                await db[SERVICES_COL_NAME].update_one(
                    {"zid": data.event.id},
                    {"$set": to_doc(ServiceUpdate(
                        recovery_date=data.event.recovery.date,
                        recovery_time=data.event.recovery.time,
                        severity=data.event.severity,
                        duration=data.event.duration
                    )), "$push": {"updates": to_doc(Update(
                        action="Recovered",
                        date=data.event.recovery.date,
                        time=data.event.recovery.time
                    ))}}
                )
        case "service_update":
            service = await db[SERVICES_COL_NAME].find_one({"zid": data.event.id})
            if service is None:
                await db[SERVICES_COL_NAME].insert_one(to_doc(Service(
                    zid=data.event.id,
                    name=data.event.name,
                    description=data.service.description,
                    rootcause=data.service.rootcause,
                    start_date=data.event.update.date,
                    start_time=data.event.update.time,
                    severity=data.event.update.severity
                )))
            else:
                await db[SERVICES_COL_NAME].update_one(
                    {"zid": data.event.id},
                    {"$set": to_doc(ServiceUpdate(
                        severity=data.event.update.severity,
                        age=data.event.age
                    )), "$push": {"updates": to_doc(Update(
                        action="Updated",
                        date=data.event.update.date,
                        time=data.event.update.time
                    ))}}
                )
        case _:
            logger.warning("Unknown Alert Type: %s", data.type)
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Unknown alert type")

    return ResponseModel[None]()

@app.get("/alerts/problems", response_model=PaginatedResponseModel[list[Problem]])
async def get_trigger_alerts(request: Request, filter_query: Annotated[FilterParams, Query()]):
    offset = (filter_query.page - 1) * filter_query.limit
    db: AsyncDatabase = request.app.state.db
    cursor = db[PROBLEMS_COL_NAME].find(
        sort=[("updatedAt", DESCENDING), ("createdAt", DESCENDING)],
        skip=offset,
        limit=filter_query.limit
    )
    results = [Problem(**doc) async for doc in cursor]
    return PaginatedResponseModel[list[Problem]](data=results, page=filter_query.page, limit=filter_query.limit)

@app.get("/alerts/services", response_model=PaginatedResponseModel[list[Service]])
async def get_service_alerts(request: Request, filter_query: Annotated[FilterParams, Query()]):
    offset = (filter_query.page - 1) * filter_query.limit
    db: AsyncDatabase = request.app.state.db
    cursor = db[SERVICES_COL_NAME].find(
        sort=[("updatedAt", DESCENDING), ("createdAt", DESCENDING)],
        skip=offset,
        limit=filter_query.limit
    )
    results = [Service(**doc) async for doc in cursor]
    return PaginatedResponseModel[list[Service]](data=results, page=filter_query.page, limit=filter_query.limit)

@app.get("/", include_in_schema=False)
def root():
    return ResponseModel[None](message="API for Zabbix Alerts Storage")

@app.get("/favicon.ico", include_in_schema=False)
def favicon():
    return Response(status_code=status.HTTP_204_NO_CONTENT)
