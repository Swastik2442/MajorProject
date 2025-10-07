from typing import TypeVar, Generic, Literal

from pydantic import BaseModel, ValidationInfo, Field, field_validator

from .models.utils import MyDatetime, none, now

class PaginationParams(BaseModel):
    page: int = Field(1, ge=1)
    limit: int = Field(20, ge=1, le=100)

class TimePeriodParams(BaseModel):
    start: MyDatetime = Field(description="Start Time")
    end: MyDatetime = Field(default_factory=now, description="End Time")
    interval: Literal['hour', 'day', 'week', 'month'] = Field(default_factory=lambda: 'day', description="Time interval for aggregation")

    @field_validator('end', mode='after')
    @classmethod
    def check_end_time(cls, value: MyDatetime, info: ValidationInfo) -> MyDatetime:
        if value <= info.data['start']:
            raise ValueError('End time must be after start time')
        if value > now():
            raise ValueError('End time must not be in future')
        return value

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
