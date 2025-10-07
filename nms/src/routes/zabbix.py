"API Routes for receiving Zabbix Alerts"

from datetime import datetime
import logging

from fastapi import APIRouter, Request, status
from fastapi.exceptions import HTTPException
from pydantic import BaseModel, Field
from pymongo.asynchronous.database import AsyncDatabase

from ..templates import ZABBIX_DATETIME_FORMAT, parse_json_message
from ..config import PROBLEMS_COL_NAME, SERVICES_COL_NAME
from ..exceptions import HTTPException as CustomHTTPException
from ..models import Problem, ProblemUpdate, Service, ServiceUpdate
from ..models.problem import Update as PUpdate
from ..models.service import Update as SUpdate
from ..schemas import Response as CustomResponse
from ..models.utils import none, to_doc

logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/zabbix",
    tags=["zabbix"],
)

class ZabbixAlert(BaseModel):
    "Expected Payload from Zabbix webhook"
    to: str | None = Field(default_factory=none, description="IP/DNS Address of receiving Server")
    subject: str = Field(description="Subject of the Alert")
    message: str = Field(description="JSON message containing the details of the Alert")

@router.post("/webhook", response_model=CustomResponse, responses={400: {"model": CustomHTTPException}})
async def receive_alert(req: Request, alert: ZabbixAlert):
    if req.client is None:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Cannot determine client address")

    logger.debug("Received alert (at %s) from %s with subject \"%s\"", alert.to, req.client.host, alert.subject)
    logger.debug("Message: %s", alert.message)
    try:
        data = parse_json_message(alert.message)
    except ValueError as e:
        logger.warning("Failed to parse alert message: %s", e)
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid alert message") from e

    # Insert/Update in the Database
    db: AsyncDatabase = req.app.state.db
    match data.type:
        case "problem":
            await db[PROBLEMS_COL_NAME].insert_one(to_doc(Problem(
                zid=data.event.id,
                name=data.event.name,
                severity=data.event.severity,
                startedAt=datetime.strptime(f"{data.event.date} {data.event.time}", ZABBIX_DATETIME_FORMAT),
                hostname=data.host.name,
                status="Started"
            )))
        case "problem_recovery":
            problem = await db[PROBLEMS_COL_NAME].find_one({"zid": data.event.id})
            recTime = datetime.strptime(f"{data.event.recovery.date} {data.event.recovery.time}", ZABBIX_DATETIME_FORMAT)
            if problem is None:
                problem = await db[PROBLEMS_COL_NAME].insert_one(to_doc(Problem(
                    zid=data.event.id,
                    name=data.event.name,
                    severity=data.event.severity,
                    startedAt=recTime,
                    recoveryAt=recTime,
                    duration=data.event.duration,
                    hostname=data.host.name,
                    status="Recovered"
                )))
            else:
                await db[PROBLEMS_COL_NAME].update_one(
                    {"zid": data.event.id},
                    {"$set": to_doc(ProblemUpdate(
                        severity=data.event.severity,
                        recoveryAt=recTime,
                        duration=data.event.duration,
                        status="Recovered"
                    )), "$push": {"updates": to_doc(PUpdate(
                        action="Recovered",
                        timestamp=recTime
                    ))}}
                )
        case "problem_update":
            problem = await db[PROBLEMS_COL_NAME].find_one({"zid": data.event.id})
            updateTime = datetime.strptime(f"{data.event.update.date} {data.event.update.time}", ZABBIX_DATETIME_FORMAT)
            if problem is None:
                problem = await db[PROBLEMS_COL_NAME].insert_one(to_doc(Problem(
                    zid=data.event.id,
                    name=data.event.name,
                    severity="Not classified",
                    startedAt=updateTime,
                    hostname="Unknown",
                    age=data.event.age,
                    status=data.event.status
                )))
            else:
                await db[PROBLEMS_COL_NAME].update_one(
                    {"zid": data.event.id},
                    {"$push": {"updates": to_doc(PUpdate(
                        action=data.event.update.action,
                        timestamp=updateTime,
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
                startedAt=datetime.strptime(f"{data.event.date} {data.event.time}", ZABBIX_DATETIME_FORMAT),
                severity=data.event.severity
            )))
        case "service_recovery":
            service = await db[SERVICES_COL_NAME].find_one({"zid": data.event.id})
            recTime = datetime.strptime(f"{data.event.recovery.date} {data.event.recovery.time}", ZABBIX_DATETIME_FORMAT)
            if service is None:
                await db[SERVICES_COL_NAME].insert_one(to_doc(Service(
                    zid=data.event.id,
                    name=data.event.name,
                    description=data.service.description,
                    rootcause="Unknown",
                    startedAt=recTime,
                    recoveryAt=recTime,
                    severity=data.event.severity
                )))
            else:
                await db[SERVICES_COL_NAME].update_one(
                    {"zid": data.event.id},
                    {"$set": to_doc(ServiceUpdate(
                        recoveryAt=recTime,
                        severity=data.event.severity,
                        duration=data.event.duration
                    )), "$push": {"updates": to_doc(SUpdate(
                        action="Recovered",
                        timestamp=recTime
                    ))}}
                )
        case "service_update":
            service = await db[SERVICES_COL_NAME].find_one({"zid": data.event.id})
            updateTime = datetime.strptime(f"{data.event.update.date} {data.event.update.time}", ZABBIX_DATETIME_FORMAT)
            if service is None:
                await db[SERVICES_COL_NAME].insert_one(to_doc(Service(
                    zid=data.event.id,
                    name=data.event.name,
                    description=data.service.description,
                    rootcause=data.service.rootcause,
                    startedAt=updateTime,
                    severity=data.event.update.severity
                )))
            else:
                await db[SERVICES_COL_NAME].update_one(
                    {"zid": data.event.id},
                    {"$set": to_doc(ServiceUpdate(
                        severity=data.event.update.severity,
                        age=data.event.age
                    )), "$push": {"updates": to_doc(SUpdate(
                        action="Updated",
                        timestamp=updateTime
                    ))}}
                )
        case _:
            logger.warning("Unknown Alert Type: %s", data.type)
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Unknown alert type")

    return CustomResponse()
