from collections.abc import Sequence

from logging import getLogger
from typing import Self, Literal

from fastapi import Query
from pydantic import BaseModel, Field, model_validator

from common.models.utils import MyDatetime, PyObjectId, none, now, Severity

logger = getLogger(__name__)

IntervalSeconds = {'hour': 3600, 'day': 86400, 'week': 604800, 'month': 2592000}

class PaginationParams(BaseModel):
    page: int = Query(1, ge=1)
    limit: int = Query(20, ge=1, le=100)

class TimePeriodParams(BaseModel):
    start: MyDatetime = Query(description="Start Time")
    end: MyDatetime | None = Query(default_factory=none, description="End Time")
    interval: Literal['hour', 'day', 'week', 'month'] = Query(default_factory=lambda: 'day', description="Time interval for aggregation")

    @model_validator(mode='after')
    def check_time(self) -> Self:
        if self.end is not None:
            if self.end <= self.start:
                raise ValueError('End time must be after start time')
            if self.end > now():
                raise ValueError('End time must not be in future')

        durationSeconds = ((self.end or now()) - self.start).total_seconds()
        intervalSeconds = IntervalSeconds[self.interval]
        if durationSeconds < intervalSeconds:
            raise ValueError('Time range too small for the selected interval')
        if durationSeconds / intervalSeconds > 1000:
            logger.warning('Time range too large for the selected interval')
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

class SeverityParams(BaseModel):
    severity: Severity | None = Query(
        default_factory=none,
        title="Severity Level",
        description="Severity level to filter/threshold by"
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
class TimePeriodWithClientsAndSeverityParams(TimePeriodParams, ClientsParams, SeverityParams):
    pass
class InfiniteTimePeriodWithClientsParams(InfiniteTimePeriodParams, ClientsParams):
    pass

class StatCounts(BaseModel):
    totalActiveProblems: int = Field(ge=0)
    activeProblemsInLast24Hours: int = Field(ge=0)
    problemsInLast24Hours: int = Field(ge=0)
    problemsInLastWeek: int = Field(ge=0)
    problemsInLastMonth: int = Field(ge=0)

class StatCommonCounts(BaseModel):
    problems: StatCounts
    services: StatCounts

class StatTrends(BaseModel):
    timestamp: MyDatetime
    active: int = Field(ge=0)

class StatProblematicAlertTrends(BaseModel):
    timestamp: MyDatetime
    problematic: int = Field(ge=0)
    total: int = Field(ge=0)

class StatCommonTrends(BaseModel):
    timestamp: MyDatetime
    activeProblems: int = Field(ge=0)
    activeServiceOutages: int = Field(ge=0)

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

class StatAlertCount(BaseModel, frozen=True):
    clientId: PyObjectId
    severity: Severity
    count: int

class StatHostAlertCount(StatAlertCount, frozen=True):
    hostname: str

class StatServiceAlertCount(StatAlertCount, frozen=True):
    serviceName: str

class StatAlertDurations(BaseModel):
    durationSeconds: Sequence[int | Literal["Infinity"]] = Field()

__all__ = [
    "IntervalSeconds",
    "StatCounts",
    "StatCommonCounts",
    "StatTrends",
    "StatProblematicAlertTrends",
    "StatCommonTrends",
    "StatHealthScores",
    "StatAlertCount",
    "StatHostAlertCount",
    "StatServiceAlertCount",
    "StatAlertDurations"
]
