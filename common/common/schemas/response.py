from typing import TypeVar, Generic, Literal

from pydantic import BaseModel, Field

from common.models.utils import none

class Response(BaseModel):
    status: Literal["success", "error"] = Field(default_factory=lambda: "success")
    message: str | None = Field(default_factory=none)

TData = TypeVar('TData')
class DataResponse(Response, Generic[TData]):
    data: TData | None = Field(default_factory=none)

class PaginatedDataResponse(DataResponse, Generic[TData]):
    # Override to provide Generic support
    data: TData | None = Field(default_factory=none)
    page: int = Field(1, ge=1)
    limit: int = Field(20, ge=1, le=100)

__all__ = [
    "Response",
    "DataResponse",
    "PaginatedDataResponse",
]
