"Service Model Schema"

from collections.abc import Sequence

from pydantic import BaseModel, Field

from src.templates.models import Severity
from .base import BaseInterface
from .utils import MyDatetime, PyObjectId, none, now

class Update(BaseModel):
    action: str = Field()
    timestamp: MyDatetime = Field()
    message: str = Field(default_factory=lambda: "")
    username: str | None = Field(default_factory=none)

class Service(BaseInterface):
    class Meta(BaseInterface.Meta):
        @classmethod
        def collection_name(cls) -> str:
            return "services"

    clientId: PyObjectId = Field(title="Client ID", description="ID of the Client who owns this Service")
    zid: str = Field(title="Zabbix Event ID")
    name: str = Field(title="Zabbix Event Name")
    startedAt: MyDatetime = Field()
    recoveryAt: MyDatetime | None = Field(default_factory=none)
    age: str | None = Field(default_factory=none)
    severity: Severity = Field()
    duration: str | None = Field(default_factory=none)
    status: str = Field()
    serviceName: str = Field()
    description: str = Field()
    rootcause: str = Field()
    updates: Sequence[Update] = Field(default_factory=list)

class ServiceUpdate(BaseModel):
    updatedAt: MyDatetime = Field(default_factory=now)

    recoveryAt: MyDatetime | None = Field(default_factory=none)
    status: str | None = Field(default_factory=none)
    severity: Severity = Field()
    duration: str | None = Field(default_factory=none)
    age: str | None = Field(default_factory=none)
