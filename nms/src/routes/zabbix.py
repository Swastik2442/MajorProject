"API Routes for receiving Zabbix Alerts"

from datetime import datetime
from logging import getLogger
from zoneinfo import ZoneInfo

from common.exceptions import HTTPException as CustomHTTPException
from common.models import Problem, ProblemUpdate, Service, ServiceUpdate
from common.models.problem import Update as PUpdate
from common.models.service import Update as SUpdate
from common.models.utils import fields, to_doc
from common.schemas import Response as CustomResponse
from common.services.db import Database
from fastapi import APIRouter, BackgroundTasks, Request, status
from fastapi.exceptions import HTTPException

from src.events.dispatch import send_event
from src.events.models import ServiceProblem, ServiceProblemRecovery, ServiceProblemUpdate, TriggerAlert, TriggerAlertRecovery, TriggerAlertUpdate
from src.middlewares.client import ClientFromApiKey
from src.templates import ZABBIX_DATETIME_FORMAT, ZabbixAlert, parse_json_message

logger = getLogger(__name__)

router = APIRouter(
    prefix="/zabbix",
    tags=["zabbix"],
)

@router.post("/webhook", response_model=CustomResponse, responses={400: {"model": CustomHTTPException}})
async def receive_alert(
    req: Request,
    alert: ZabbixAlert,
    client: ClientFromApiKey,
    db: Database,
    background_tasks: BackgroundTasks
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

    def to_db_datetime(date_str: str, time_str: str) -> datetime:
        return datetime.strptime(f"{date_str} {time_str}", ZABBIX_DATETIME_FORMAT).astimezone(ZoneInfo(client.timezone))

    # Insert/Update in the Database
    match data.type:
        case "problem":
            problem = Problem(
                clientId=client.id,
                zid=data.event.id,
                name=data.event.name,
                severity=data.event.severity,
                startedAt=to_db_datetime(data.event.date, data.event.time),
                hostname=data.host.name,
                status="Started"
            )
            ins = await db[Problem.Meta.collection_name()].insert_one(to_doc(problem))
            problem.id = ins.inserted_id
            event_data = TriggerAlert.from_problem(problem, client_id=client.id)
        case "problem_recovery":
            docFilter = {
                fields(Problem).clientId: client.id,
                fields(Problem).zid: data.event.id
            }
            problemExists = await db[Problem.Meta.collection_name()].find_one(docFilter)
            recTime = to_db_datetime(data.event.recovery.date, data.event.recovery.time)
            if problemExists is None:
                problem = Problem(
                    clientId=client.id,
                    zid=data.event.id,
                    name=data.event.name,
                    severity=data.event.severity,
                    startedAt=recTime,
                    recoveryAt=recTime,
                    duration=data.event.duration,
                    hostname=data.host.name,
                    status="Recovered"
                )
                ins = await db[Problem.Meta.collection_name()].insert_one(to_doc(problem))
                problem.id = ins.inserted_id
                event_data = TriggerAlert.from_problem(problem, client_id=client.id)
            else:
                problemUpdate = ProblemUpdate(
                    severity=data.event.severity,
                    recoveryAt=recTime,
                    duration=data.event.duration,
                    status="Recovered"
                )
                updateItem = PUpdate(
                    action="Recovered",
                    message=alert.subject,
                    timestamp=recTime
                )
                await db[Problem.Meta.collection_name()].update_one(
                    docFilter,
                    {
                        "$set": to_doc(problemUpdate),
                        "$push": {fields(Problem).updates: to_doc(updateItem)}
                    }
                )
                event_data = TriggerAlertRecovery.from_problem_update(
                    problemUpdate,
                    id=problemExists["_id"],
                    client_id=client.id,
                    update_item=updateItem
                )
        case "problem_update":
            docFilter = {
                fields(Problem).clientId: client.id,
                fields(Problem).zid: data.event.id
            }
            problemExists = await db[Problem.Meta.collection_name()].find_one(docFilter)
            updateTime = to_db_datetime(data.event.update.date, data.event.update.time)
            if problemExists is None:
                problem = Problem(
                    clientId=client.id,
                    zid=data.event.id,
                    name=data.event.name,
                    severity="Not classified",
                    startedAt=updateTime,
                    hostname="Unknown",
                    age=data.event.age,
                    status=data.event.status
                )
                ins = await db[Problem.Meta.collection_name()].insert_one(to_doc(problem))
                problem.id = ins.inserted_id
                event_data = TriggerAlert.from_problem(problem, client_id=client.id)
            else:
                problemUpdate = ProblemUpdate(
                    status=data.event.status,
                    severity="Not classified", # BUG: Zabbix does not send severity in update events
                )
                updateItem = PUpdate(
                    action=data.event.update.action,
                    timestamp=updateTime,
                    message=data.event.update.message,
                    username=data.user.fullname
                )
                await db[Problem.Meta.collection_name()].update_one(
                    docFilter,
                    {
                        "$set": to_doc(problemUpdate),
                        "$push": {fields(Problem).updates: to_doc(updateItem)}
                    }
                )
                event_data = TriggerAlertUpdate.from_problem_update(
                    problemUpdate,
                    id=problemExists["_id"],
                    client_id=client.id,
                    update_item=updateItem
                )
        case "service":
            service = Service(
                clientId=client.id,
                zid=data.event.id,
                name=data.event.name,
                status="Started",
                serviceName=data.service.name,
                description=data.service.description,
                rootcause=data.service.rootcause,
                startedAt=to_db_datetime(data.event.date, data.event.time),
                severity=data.event.severity
            )
            ins = await db[Service.Meta.collection_name()].insert_one(to_doc(service))
            service.id = ins.inserted_id
            event_data = ServiceProblem.from_service(service, client_id=client.id)
        case "service_recovery":
            docFilter = {
                fields(Service).clientId: client.id,
                fields(Service).zid: data.event.id
            }
            serviceExists = await db[Service.Meta.collection_name()].find_one(docFilter)
            recTime = to_db_datetime(data.event.recovery.date, data.event.recovery.time)
            if serviceExists is None:
                service = Service(
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
                )
                ins = await db[Service.Meta.collection_name()].insert_one(to_doc(service))
                service.id = ins.inserted_id
                event_data = ServiceProblem.from_service(service, client_id=client.id)
            else:
                serviceUpdate = ServiceUpdate(
                    recoveryAt=recTime,
                    status="Recovered",
                    severity=data.event.severity,
                    duration=data.event.duration
                )
                updateItem = SUpdate(
                    action="Recovered",
                    message=alert.subject,
                    timestamp=recTime
                )
                await db[Service.Meta.collection_name()].update_one(
                    docFilter,
                    {
                        "$set": to_doc(serviceUpdate),
                        "$push": {fields(Service).updates: to_doc(updateItem)}
                    }
                )
                event_data = ServiceProblemRecovery.from_service_update(
                    serviceUpdate,
                    id=serviceExists["_id"],
                    client_id=client.id,
                    update_item=updateItem
                )
        case "service_update":
            docFilter = {
                fields(Service).clientId: client.id,
                fields(Service).zid: data.event.id
            }
            serviceExists = await db[Service.Meta.collection_name()].find_one(docFilter)
            updateTime = to_db_datetime(data.event.update.date, data.event.update.time)
            if serviceExists is None:
                service = Service(
                    clientId=client.id,
                    zid=data.event.id,
                    name=data.event.name,
                    status=data.event.status,
                    serviceName=data.service.name,
                    description=data.service.description,
                    rootcause=data.service.rootcause,
                    startedAt=updateTime,
                    severity=data.event.update.severity
                )
                ins = await db[Service.Meta.collection_name()].insert_one(to_doc(service))
                service.id = ins.inserted_id
                event_data = ServiceProblem.from_service(service, client_id=client.id)
            else:
                serviceUpdate = ServiceUpdate(
                    status=data.event.status,
                    severity=data.event.update.severity,
                    age=data.event.age
                )
                updateItem = SUpdate(
                    action="Updated",
                    message=alert.subject,
                    timestamp=updateTime
                )
                await db[Service.Meta.collection_name()].update_one(
                    docFilter,
                    {
                        "$set": to_doc(serviceUpdate),
                        "$push": {fields(Service).updates: to_doc(updateItem)}
                    }
                )
                event_data = ServiceProblemUpdate.from_service_update(
                    serviceUpdate,
                    id=serviceExists["_id"],
                    client_id=client.id,
                    update_item=updateItem
                )
        case _:
            logger.warning("Unknown Alert Type: %s", data.type)
            raise HTTPException(status.HTTP_400_BAD_REQUEST, "Unknown alert type")

    background_tasks.add_task(send_event, event_data)
    return CustomResponse()
