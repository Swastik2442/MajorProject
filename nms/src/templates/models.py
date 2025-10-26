"Models for parsing Zabbix Alert Messages"

import json
from typing import Any, Literal

from pydantic import BaseModel, Field

Severity = Literal["Not classified", "Information", "Warning", "Average", "High", "Disaster"]

ZABBIX_DATETIME_FORMAT = "%Y.%m.%d %H:%M:%S"
ZABBIX_DATE_REGEX = r"^\d{4}.\d{2}.\d{2}$"
ZABBIX_TIME_REGEX = r"^\d{2}:\d{2}:\d{2}$"

class ZabbixAlert(BaseModel):
    "Expected Payload from Zabbix webhook"
    to: str | None = Field(default_factory=lambda: None, description="IP/DNS Address of receiving Server")
    subject: str = Field(description="Subject of the Alert")
    message: str = Field(description="JSON message containing the details of the Alert")

# Common sub-models
class Recovery(BaseModel):
    time: str = Field(pattern=ZABBIX_TIME_REGEX)
    date: str = Field(pattern=ZABBIX_DATE_REGEX)

class Acknowledgement(BaseModel):
    status: str

class Host(BaseModel):
    name: str

class Trigger(BaseModel):
    url: str

class User(BaseModel):
    fullname: str

class Update(BaseModel):
    action: str
    date: str = Field(pattern=ZABBIX_DATE_REGEX)
    time: str = Field(pattern=ZABBIX_TIME_REGEX)
    message: str

class Update2(BaseModel):
    date: str = Field(pattern=ZABBIX_DATE_REGEX)
    time: str = Field(pattern=ZABBIX_TIME_REGEX)
    severity: Severity

class ServiceInfo(BaseModel):
    name: str
    description: str

class ServiceInfoWithRootCause(ServiceInfo):
    rootcause: str

class ProblemEvent(BaseModel):
    id: str
    name: str
    severity: Severity
    time: str = Field(pattern=ZABBIX_TIME_REGEX)
    date: str = Field(pattern=ZABBIX_DATE_REGEX)
    opdata: str

class ProblemUpdateEvent(BaseModel):
    id: str
    name: str
    status: str
    age: str
    update: Update

class ServiceEvent(BaseModel):
    id: str
    name: str
    severity: Severity
    time: str = Field(pattern=ZABBIX_TIME_REGEX)
    date: str = Field(pattern=ZABBIX_DATE_REGEX)
    recovery: Recovery

class ServiceUpdateEvent(BaseModel):
    id: str
    name: str
    age: str
    update: Update2

class RecoveryEvent(BaseModel):
    id: str
    name: str
    severity: Severity
    duration: str
    recovery: Recovery

# Main models
# Problem models
class ProblemRecovery(BaseModel):
    type: Literal["problem_recovery"] = Field("problem_recovery", frozen=True)
    event: RecoveryEvent
    host: Host
    trigger: Trigger

class ProblemUpdate(BaseModel):
    type: Literal["problem_update"] = Field("problem_update", frozen=True)
    event: ProblemUpdateEvent
    user: User

class Problem(BaseModel):
    type: Literal["problem"] = Field("problem", frozen=True)
    event: ProblemEvent
    host: Host
    trigger: Trigger

# Service models
class ServiceRecovery(BaseModel):
    type: Literal["service_recovery"] = Field("service_recovery", frozen=True)
    service: ServiceInfo
    event: RecoveryEvent

class ServiceUpdate(BaseModel):
    type: Literal["service_update"] = Field("service_update", frozen=True)
    service: ServiceInfoWithRootCause
    event: ServiceUpdateEvent

class Service(BaseModel):
    type: Literal["service"] = Field("service", frozen=True)
    service: ServiceInfoWithRootCause
    event: ServiceEvent

TYPE_MAP = {
    "problem_recovery": ProblemRecovery,
    "problem_update": ProblemUpdate,
    "problem": Problem,
    "service_recovery": ServiceRecovery,
    "service_update": ServiceUpdate,
    "service": Service
}
def parse_json_message(data: str | dict[str, Any]):
    "Parse JSON data into the appropriate MessageBaseModel subclass"

    if isinstance(data, str):
        try:
            data = json.loads(data.strip())
        except json.JSONDecodeError as e:
            raise ValueError(f"Invalid JSON data: {e}") from e
    if not isinstance(data, dict):
        raise ValueError("Data must be a JSON string or a dictionary")

    message_type = data.get("type")
    if message_type is None:
        raise ValueError("Missing 'type' field in data")

    model_class = TYPE_MAP.get(message_type)
    if model_class is None:
        raise ValueError(f"Unknown message type: {message_type}")

    return model_class(**data)
