"Service Model Schema"

from collections.abc import Sequence

from pydantic import BaseModel, Field

from .base import BaseInterface
from .utils import MyDatetime, PyObjectId, none, now, Severity

class Update(BaseModel):
    """Update model representing an action taken on a Service alert."""
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

class Service(BaseInterface):
    """Service model representing a NMS Service Alert reported by a Client."""
    class Meta(BaseInterface.Meta):
        @classmethod
        def collection_name(cls) -> str:
            return "services"

    clientId: PyObjectId = Field(
        title="Client ID",
        description="ID of the Client who owns this Service"
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
    status: str = Field(
        title="Problem Status",
        description="Current status of the problem",
        examples=["Started", "Recovered", "Updated"]
    )
    serviceName: str = Field(
        title="Service Name",
        description="Name of the Service"
    )
    description: str = Field(
        title="Service Description",
        description="Description of the Service"
    )
    rootcause: str = Field(
        default_factory=lambda: "",
        title="Root Cause",
        description="Root cause of the service issue"
    )
    updates: Sequence[Update] = Field(
        default_factory=list,
        title="Service Updates",
        description="Updates done to the service"
    )

class ServiceUpdate(BaseModel):
    updatedAt: MyDatetime = Field(default_factory=now)

    recoveryAt: MyDatetime | None = Field(default_factory=none)
    status: str | None = Field(default_factory=none)
    severity: Severity = Field()
    duration: str | None = Field(default_factory=none)
    age: str | None = Field(default_factory=none)

class ServiceDatetimesAndStatus(BaseModel):
    startedAt: MyDatetime = Field()
    recoveryAt: MyDatetime | None = Field(default_factory=none)
    status: str = Field()

class ServiceDatetimesStatusAndSeverity(ServiceDatetimesAndStatus):
    severity: Severity = Field()

class ServiceClientIdAndServiceName(BaseModel):
    clientId: PyObjectId = Field(title="Client ID", description="ID of the Client who owns this Service")
    serviceName: str = Field()
