import json
from typing import Any

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
    status: str
    age: str
    update: Update2

class ServiceUpdateEvent(BaseModel):
    age: str
    update: Update2

class RecoveryEvent(BaseModel):
    id: str
    name: str
    severity: str
    duration: str
    recovery: Recovery

# Main models
class MessageBaseModel(BaseModel):
    type: str

# Problem models
class ProblemRecovery(MessageBaseModel):
    type: str = Field("problem_recovery", frozen=True)
    event: RecoveryEvent
    host: Host
    trigger: Trigger

class ProblemUpdate(MessageBaseModel):
    type: str = Field("problem_update", frozen=True)
    event: ProblemUpdateEvent
    user: User

class Problem(MessageBaseModel):
    type: str = Field("problem", frozen=True)
    event: ProblemEvent
    host: Host
    trigger: Trigger

# Service models
class ServiceRecovery(MessageBaseModel):
    type: str = Field("service_recovery", frozen=True)
    service: ServiceInfo
    event: RecoveryEvent

class ServiceUpdate(MessageBaseModel):
    type: str = Field("service_update", frozen=True)
    service: ServiceInfo
    event: ServiceUpdateEvent

class Service(MessageBaseModel):
    type: str = Field("service", frozen=True)
    service: ServiceInfoWithRootCause
    event: RecoveryEvent

TYPE_MAP = {
    "problem_recovery": ProblemRecovery,
    "problem_update": ProblemUpdate,
    "problem": Problem,
    "service_recovery": ServiceRecovery,
    "service_update": ServiceUpdate,
    "service": Service
}
def parse_json_message(data: str | dict[str, Any]) -> MessageBaseModel:
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
