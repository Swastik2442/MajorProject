"Problem Model Schema"

from collections.abc import Sequence

from pydantic import BaseModel, Field

from .base import BaseInterface
from .utils import MyDatetime, PyObjectId, none, now, Severity

class Update(BaseModel):
    """Update model representing an action taken on a Problem."""
    action: str = Field(
        title="Action",
        description="Name of the action performed"
    )
    timestamp: MyDatetime = Field(
        title="Timestamp",
        description="Timestamp at which the action was performed"
    )
    message: str = Field(
        default_factory=lambda: "",
        title="Message",
        description="Optional message associated with the action"
    )
    username: str | None = Field(
        default_factory=none,
        title="Username",
        description="Username of the person who performed the action, if applicable"
    )

class Problem(BaseInterface):
    """Problem model representing a NMS Trigger Alert problem reported by a Client."""
    class Meta(BaseInterface.Meta):
        @classmethod
        def collection_name(cls) -> str:
            return "problems"

    clientId: PyObjectId = Field(
        title="Client ID",
        description="ID of the Client who reported this Problem"
    )
    zid: str = Field(
        title="NMS Event ID",
        description="ID of the Event in the NMS System"
    )
    name: str = Field(
        title="Event Name",
        description="Name of the Event"
    )
    startedAt: MyDatetime = Field(
        title="Problem Start Time",
        description="Timestamp when the problem started"
    )
    recoveryAt: MyDatetime | None = Field(
        default_factory=none,
        title="Problem Recovery Time",
        description="Timestamp when the problem was resolved"
    )
    age: str | None = Field(
        default_factory=none,
        title="Problem Age",
        description="Duration since the problem started",
        examples=["1d 18h 31m 41s", "8m 48s"]
    )
    status: str = Field(
        title="Problem Status",
        description="Current status of the problem",
        examples=["Started", "Recovered", "Updated"]
    )
    severity: Severity = Field(
        title="Problem Severity",
        description="Severity level of the problem",
        examples=["Not classified", "Information", "Warning", "Average", "High", "Disaster"]
    )
    duration: str | None = Field(
        default_factory=none,
        title="Problem Duration",
        description="Total Duration of the problem when resolved",
        examples=["2d 3h 15m 20s", "45m 10s"]
    )
    hostname: str = Field(
        title="Problem's Host Name",
        description="Name of the Host where the problem occurred"
    )
    updates: Sequence[Update] = Field(
        default_factory=list,
        title="Problem Updates",
        description="Updates done to the problem"
    )

class ProblemUpdate(BaseModel):
    updatedAt: MyDatetime = Field(default_factory=now)

    recoveryAt: MyDatetime | None = Field(default_factory=none)
    severity: Severity = Field()
    duration: str | None = Field(default_factory=none)
    status: str = Field()

class ProblemDatetimesAndStatus(BaseModel):
    startedAt: MyDatetime = Field()
    recoveryAt: MyDatetime | None = Field(default_factory=none)
    status: str = Field()

class ProblemDatetimesStatusAndSeverity(ProblemDatetimesAndStatus):
    severity: Severity = Field()

class ProblemClientIdAndHostname(BaseModel):
    clientId: PyObjectId = Field(title="Client ID", description="ID of the Client who reported this Problem")
    hostname: str = Field()
