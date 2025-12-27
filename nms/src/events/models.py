from typing import Generic, TypeVar

from common.models import Problem, ProblemUpdate, Service, ServiceUpdate
from common.models.problem import Update as PUpdate
from common.models.service import Update as SUpdate
from common.models.utils import PyObjectId
from pydantic import BaseModel

DataT = TypeVar("DataT", bound=BaseModel)
class Event(BaseModel, Generic[DataT]):
    client_id: str
    data: DataT

class TriggerAlert(Problem):
    class Config:
        EVENT_NAME = "new_triggerAlert"

class ServiceProblem(Service):
    class Config:
        EVENT_NAME = "new_serviceProblem"

class TriggerAlertUpdate(ProblemUpdate):
    class Config:
        EVENT_NAME = "update_triggerAlert"

    id: PyObjectId
    update: PUpdate

class ServiceProblemUpdate(ServiceUpdate):
    class Config:
        EVENT_NAME = "update_serviceProblem"

    id: PyObjectId
    update: SUpdate

class TriggerAlertRecovery(ProblemUpdate):
    class Config:
        EVENT_NAME = "recovery_triggerAlert"

    id: PyObjectId
    update: PUpdate

class ServiceProblemRecovery(ServiceUpdate):
    class Config:
        EVENT_NAME = "recovery_serviceProblem"

    id: PyObjectId
    update: SUpdate
