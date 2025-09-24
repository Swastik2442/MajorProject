from datetime import datetime
from typing import TypeVar, Generic, Literal

from pydantic import BaseModel, Field

from .utils import none

class PaginationParams(BaseModel):
    page: int = Field(1, ge=1)
    limit: int = Field(20, ge=1, le=100)

class TimePeriodParams(BaseModel):
    start: datetime = Field(description="Start Time")
    end: datetime = Field(default_factory=datetime.now, description="End Time")
    interval: Literal['hour', 'day', 'week', 'month'] = Field(default_factory=lambda: 'day', description="Time interval for aggregation")

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
    activeProblems: int = Field(ge=0)
    problemsInLast24Hours: int = Field(ge=0)
    problemsInLastWeek: int = Field(ge=0)
    problemsInLastMonth: int = Field(ge=0)

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
