"Problem Model Schema"

from pydantic import BaseModel, Field

from src.templates.models import Severity
from .base import BaseInterface
from .utils import MyDatetime, PyObjectId, none, now

class Update(BaseModel):
    action: str = Field()
    timestamp: MyDatetime = Field()
    message: str = Field(default_factory=lambda: "")
    username: str | None = Field(default_factory=none)

class Problem(BaseInterface):
    class Meta(BaseInterface.Meta):
        @classmethod
        def collection_name(cls) -> str:
            return "problems"

    clientId: PyObjectId = Field(title="Client ID", description="ID of the Client who reported this Problem")
    zid: str = Field(title="Zabbix Event ID")
    name: str = Field(title="Zabbix Event Name")
    startedAt: MyDatetime = Field()
    recoveryAt: MyDatetime | None = Field(default_factory=none)
    age: str | None = Field(default_factory=none)
    status: str = Field()
    severity: Severity = Field()
    duration: str | None = Field(default_factory=none)
    hostname: str = Field()
    updates: list[Update] = Field(default_factory=list)

class ProblemUpdate(BaseModel):
    updatedAt: MyDatetime = Field(default_factory=now)

    recoveryAt: MyDatetime | None = Field(default_factory=none)
    severity: Severity = Field()
    duration: str | None = Field(default_factory=none)
    status: str = Field()
