import json
from typing import Any, Literal

from pydantic import BaseModel, Field

# Common sub-models
class Recovery(BaseModel):
    time: str
    date: str

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
    date: str
    time: str
    message: str

class Update2(BaseModel):
    date: str
    time: str
    severity: str

class ServiceInfo(BaseModel):
    name: str
    description: str

class ServiceInfoWithRootCause(ServiceInfo):
    rootcause: str

class ProblemEvent(BaseModel):
    id: str
    name: str
    severity: str
    time: str
    date: str
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
    severity: str
    time: str
    date: str
    recovery: Recovery

class ServiceUpdateEvent(BaseModel):
    id: str
    name: str
    age: str
    update: Update2

class RecoveryEvent(BaseModel):
    id: str
    name: str
    severity: str
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
