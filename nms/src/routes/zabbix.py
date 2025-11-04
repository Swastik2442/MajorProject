"API Routes for receiving Zabbix Alerts"

from datetime import datetime
import logging

from fastapi import APIRouter, Request, status
from fastapi.exceptions import HTTPException

from common.exceptions import HTTPException as CustomHTTPException
from common.models import Problem, ProblemUpdate, Service, ServiceUpdate
from common.models.problem import Update as PUpdate
from common.models.service import Update as SUpdate
from common.models.utils import fields, to_doc
from common.schemas import Response as CustomResponse
from common.services.db import Database
from src.middlewares.client import ClientFromApiKey
from src.templates import ZABBIX_DATETIME_FORMAT, ZabbixAlert, parse_json_message

logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/zabbix",
    tags=["zabbix"],
)

@router.post("/webhook", response_model=CustomResponse, responses={400: {"model": CustomHTTPException}})
async def receive_alert(
    req: Request,
    alert: ZabbixAlert,
    client: ClientFromApiKey,
    db: Database
):
    if req.client is None or client.id is None:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Cannot determine client")

    logger.debug("Received alert (at %s) from %s with subject \"%s\"", alert.to, req.client.host, alert.subject)
    logger.debug("Message: %s", alert.message)
    try:
        data = parse_json_message(alert.message)
    except ValueError as e:
        logger.warning("Failed to parse alert message: %s", e)
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Invalid alert message") from e

    # Insert/Update in the Database
    match data.type:
        case "problem":
            await db[Problem.Meta.collection_name()].insert_one(to_doc(Problem(
                clientId=client.id,
                zid=data.event.id,
                name=data.event.name,
                severity=data.event.severity,
                startedAt=datetime.strptime(f"{data.event.date} {data.event.time}", ZABBIX_DATETIME_FORMAT),
                hostname=data.host.name,
                status="Started"
            )))
        case "problem_recovery":
            problem = await db[Problem.Meta.collection_name()].find_one({
                fields(Problem).clientId: client.id,
                fields(Problem).zid: data.event.id
            })
            recTime = datetime.strptime(f"{data.event.recovery.date} {data.event.recovery.time}", ZABBIX_DATETIME_FORMAT)
            if problem is None:
                problem = await db[Problem.Meta.collection_name()].insert_one(to_doc(Problem(
                    clientId=client.id,
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
                await db[Problem.Meta.collection_name()].update_one(
                    {fields(Problem).zid: data.event.id},
                    {"$set": to_doc(ProblemUpdate(
                        severity=data.event.severity,
                        recoveryAt=recTime,
                        duration=data.event.duration,
                        status="Recovered"
                    )), "$push": {fields(Problem).updates: to_doc(PUpdate( # type: ignore
                        action="Recovered",
                        message=alert.subject,
                        timestamp=recTime
                    ))}}
                )
        case "problem_update":
            problem = await db[Problem.Meta.collection_name()].find_one({
                fields(Problem).clientId: client.id,
                fields(Problem).zid: data.event.id
            })
            updateTime = datetime.strptime(f"{data.event.update.date} {data.event.update.time}", ZABBIX_DATETIME_FORMAT)
            if problem is None:
                problem = await db[Problem.Meta.collection_name()].insert_one(to_doc(Problem(
                    clientId=client.id,
                    zid=data.event.id,
                    name=data.event.name,
                    severity="Not classified",
                    startedAt=updateTime,
                    hostname="Unknown",
                    age=data.event.age,
                    status=data.event.status
                )))
            else:
                await db[Problem.Meta.collection_name()].update_one(
                    {fields(Problem).zid: data.event.id},
                    {"$push": {fields(Problem).updates: to_doc(PUpdate( # type: ignore
                        action=data.event.update.action,
                        timestamp=updateTime,
                        message=data.event.update.message,
                        username=data.user.fullname
                    ))}}
                )
        case "service":
            await db[Service.Meta.collection_name()].insert_one(to_doc(Service(
                clientId=client.id,
                zid=data.event.id,
                name=data.event.name,
                status="Started",
                serviceName=data.service.name,
                description=data.service.description,
                rootcause=data.service.rootcause,
                startedAt=datetime.strptime(f"{data.event.date} {data.event.time}", ZABBIX_DATETIME_FORMAT),
                severity=data.event.severity
            )))
        case "service_recovery":
            service = await db[Service.Meta.collection_name()].find_one({
                fields(Service).clientId: client.id,
                fields(Service).zid: data.event.id
            })
            recTime = datetime.strptime(f"{data.event.recovery.date} {data.event.recovery.time}", ZABBIX_DATETIME_FORMAT)
            if service is None:
                await db[Service.Meta.collection_name()].insert_one(to_doc(Service(
                    clientId=client.id,
                    zid=data.event.id,
                    name=data.event.name,
                    status="Recovered",
                    serviceName=data.service.name,
                    description=data.service.description,
                    rootcause="Unknown",
                    startedAt=recTime,
                    recoveryAt=recTime,
                    severity=data.event.severity
                )))
            else:
                await db[Service.Meta.collection_name()].update_one(
                    {fields(Problem).zid: data.event.id},
                    {"$set": to_doc(ServiceUpdate(
                        recoveryAt=recTime,
                        status="Recovered",
                        severity=data.event.severity,
                        duration=data.event.duration
                    )), "$push": {fields(Service).updates: to_doc(SUpdate( # type: ignore
                        action="Recovered",
                        message=alert.subject,
                        timestamp=recTime
                    ))}}
                )
        case "service_update":
            service = await db[Service.Meta.collection_name()].find_one({
                fields(Service).clientId: client.id,
                fields(Service).zid: data.event.id
            })
            updateTime = datetime.strptime(f"{data.event.update.date} {data.event.update.time}", ZABBIX_DATETIME_FORMAT)
            if service is None:
                await db[Service.Meta.collection_name()].insert_one(to_doc(Service(
                    clientId=client.id,
                    zid=data.event.id,
                    name=data.event.name,
                    status=data.event.status,
                    serviceName=data.service.name,
                    description=data.service.description,
                    rootcause=data.service.rootcause,
                    startedAt=updateTime,
                    severity=data.event.update.severity
                )))
            else:
                await db[Service.Meta.collection_name()].update_one(
                    {fields(Problem).zid: data.event.id},
                    {"$set": to_doc(ServiceUpdate(
                        status=data.event.status,
                        severity=data.event.update.severity,
                        age=data.event.age
                    )), "$push": {fields(Service).updates: to_doc(SUpdate( # type: ignore
                        action="Updated",
                        message=alert.subject,
                        timestamp=updateTime
                    ))}}
                )
        case _:
            logger.warning("Unknown Alert Type: %s", data.type)
            raise HTTPException(status.HTTP_400_BAD_REQUEST, "Unknown alert type")

    return CustomResponse()
