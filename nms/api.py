"API Service to store Zabbix Alerts in Local Storage"

from contextlib import asynccontextmanager
import logging

from fastapi import FastAPI, Request, Response, status
from pydantic import BaseModel, Field
from pymongo import MongoClient
from pymongo.database import Database

from templates import parse_json_message
from config import DB_NAME, MONGO_CONNECTION_URI, PROBLEMS_COL_NAME, SERVICES_COL_NAME
from models import Problem, ProblemUpdate, Service, ServiceUpdate, Update, init_problems_col, init_services_col
from utils import none, to_doc

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger()

@asynccontextmanager
async def lifespan(app: FastAPI):
    app.state.db_client = MongoClient(MONGO_CONNECTION_URI)
    app.state.db = app.state.db_client[DB_NAME]
    logger.info("Connected to MongoDB database")
    init_problems_col(app.state.db[PROBLEMS_COL_NAME])
    init_services_col(app.state.db[SERVICES_COL_NAME])
    yield

    app.state.db_client.close()
    logger.info("Closed connection to database")

app = FastAPI(lifespan=lifespan)

class ZabbixAlert(BaseModel):
    "Expected Payload from Zabbix webhook"
    to: str | None = Field(default_factory=none, description="IP/DNS Address of receiving Server")
    subject: str = Field(description="Subject of the Alert")
    message: str = Field(description="JSON message containing the details of the Alert")

@app.post("/zabbix/webhook")
async def receive_alert(alert: ZabbixAlert, request: Request):
    if request.client is None:
        return {"status": "error"}

    logger.debug("Received alert (at %s) from %s with subject \"%s\"", alert.to, request.client.host, alert.subject)
    logger.debug("Message: %s", alert.message)
    try:
        data = parse_json_message(alert.message)
    except ValueError as e:
        logger.warning("Failed to parse alert message: %s", e)
        return {"status": "error", "message": "Invalid alert message"}

    # Insert/Update in the Database
    db: Database = request.app.state.db
    match data.type:
        case "problem":
            db[PROBLEMS_COL_NAME].insert_one(to_doc(Problem(
                zid=data.event.id,
                name=data.event.name,
                severity=data.event.severity,
                start_time=data.event.time,
                start_date=data.event.date,
                hostname=data.host.name,
                status="Started"
            )))
        case "problem_recovery":
            problem = db[PROBLEMS_COL_NAME].find_one({"zid": data.event.id})
            if problem is None:
                problem = db[PROBLEMS_COL_NAME].insert_one(to_doc(Problem(
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
                db[PROBLEMS_COL_NAME].update_one(
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
            problem = db[PROBLEMS_COL_NAME].find_one({"zid": data.event.id})
            if problem is None:
                problem = db[PROBLEMS_COL_NAME].insert_one(to_doc(Problem(
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
                db[PROBLEMS_COL_NAME].update_one(
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
            db[SERVICES_COL_NAME].insert_one(to_doc(Service(
                zid=data.event.id,
                name=data.event.name,
                description=data.service.description,
                rootcause=data.service.rootcause,
                start_date=data.event.date,
                start_time=data.event.time,
                severity=data.event.severity
            )))
        case "service_recovery":
            service = db[SERVICES_COL_NAME].find_one({"zid": data.event.id})
            if service is None:
                db[SERVICES_COL_NAME].insert_one(to_doc(Service(
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
                db[SERVICES_COL_NAME].update_one(
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
            service = db[SERVICES_COL_NAME].find_one({"zid": data.event.id})
            if service is None:
                db[SERVICES_COL_NAME].insert_one(to_doc(Service(
                    zid=data.event.id,
                    name=data.event.name,
                    description=data.service.description,
                    rootcause=data.service.rootcause,
                    start_date=data.event.update.date,
                    start_time=data.event.update.time,
                    severity=data.event.update.severity
                )))
            else:
                db[SERVICES_COL_NAME].update_one(
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
            return {"status": "error", "message": "Unknown alert type"}

    return {"status": "success"}

@app.get("/")
def root():
    return {"message": "API for Zabbix Alerts Storage"}

@app.get("/favicon.ico")
def favicon():
    return Response(status_code=status.HTTP_204_NO_CONTENT)
