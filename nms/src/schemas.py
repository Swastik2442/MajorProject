from collections.abc import Sequence
from typing import Self, TypeVar, Generic, Literal

from fastapi import Query
from pydantic import BaseModel, Field, model_validator

from src.models.utils import MyDatetime, PyObjectId, none, now
from src.templates.models import Severity

class PaginationParams(BaseModel):
    page: int = Query(1, ge=1)
    limit: int = Query(20, ge=1, le=100)

class TimePeriodParams(BaseModel):
    start: MyDatetime = Query(description="Start Time")
    end: MyDatetime | None = Query(default_factory=none, description="End Time")
    interval: Literal['hour', 'day', 'week', 'month'] = Query(default_factory=lambda: 'day', description="Time interval for aggregation")

    @model_validator(mode='after')
    def check_end_time(self) -> Self:
        if self.end is None:
            return self
        if self.end <= self.start:
            raise ValueError('End time must be after start time')
        if self.end > now():
            raise ValueError('End time must not be in future')
        return self

class InfiniteTimePeriodParams(BaseModel):
    start: MyDatetime | None = Query(default_factory=none, description="Start Time")
    end: MyDatetime | None = Query(default_factory=none, description="End Time")

    @model_validator(mode='after')
    def check_end_time(self) -> Self:
        if self.end is None:
            return self
        if self.end > now():
            raise ValueError('End time must not be in future')
        if self.start is not None and self.end <= self.start:
            raise ValueError('End time must be after start time')
        return self

class ClientsParams(BaseModel):
    client_id: str | Sequence[str] | None = Query(
        default_factory=none,
        title="Client ID(s)",
        description="ID(s) of the Client(s)"
    )
    org_id: str | None = Query(
        default_factory=none,
        title="Org ID",
        description="ID of the Org whose Clients are to be fetched"
    )

class PaginationWithOwnerIdParams(PaginationParams):
    owner_id: str | None = Query(
        default=None,
        title="Owner ID",
        description="ID of the Org whose Clients are to be fetched. If not provided, fetches clients from all Orgs the user belongs to."
    )

class PaginationWithClientsParams(PaginationParams, ClientsParams):
    pass
class TimePeriodWithClientsParams(TimePeriodParams, ClientsParams):
    pass
class InfiniteTimePeriodWithClientsParams(InfiniteTimePeriodParams, ClientsParams):
    pass

class Response(BaseModel):
    status: Literal["success", "error"] = Field(default_factory=lambda: "success")
    message: str | None = Field(default_factory=none)

TData = TypeVar('TData')
class DataResponse(Response, Generic[TData]):
    data: TData | None = Field(default_factory=none)

class PaginatedDataResponse(DataResponse, PaginationParams, Generic[TData]):
    # Override to provide Generic support
    data: TData | None = Field(default_factory=none)

class StatCounts(BaseModel):
    totalActiveProblems: int = Field(ge=0)
    activeProblemsInLast24Hours: int = Field(ge=0)
    problemsInLast24Hours: int = Field(ge=0)
    problemsInLastWeek: int = Field(ge=0)
    problemsInLastMonth: int = Field(ge=0)

class StatTrends(BaseModel):
    timestamp: MyDatetime
    new: int = Field(ge=0)
    resolved: int = Field(ge=0)
    active: int = Field(ge=0)

class StatHealthScores(BaseModel):
    id: str = Field(alias="_id", title="Zabbix Host ID")
    totalProblems: int = Field(ge=0)
    notClassified: int = Field(ge=0)
    information: int = Field(ge=0)
    warning: int = Field(ge=0)
    average: int = Field(ge=0)
    high: int = Field(ge=0)
    disaster: int = Field(ge=0)
    healthScore: int = Field(ge=0, le=100)

class StatHostProblemCount(BaseModel, frozen=True):
    clientId: PyObjectId
    hostname: str
    severity: Severity
    count: int
