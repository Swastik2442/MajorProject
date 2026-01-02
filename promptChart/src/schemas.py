from common.models.utils import PyObjectId, none
from fastapi import Query
from pydantic import BaseModel, Field


class PaginationParams(BaseModel):
    page: int = Query(1, ge=1)
    limit: int = Query(20, ge=1, le=100)

class InvokeParams(BaseModel):
    user_id: str | None = Field(default_factory=none, min_length=1, max_length=50)
    thread_id: PyObjectId | None = Field(default_factory=none)
class InvokeRequestSchema(InvokeParams):
    prompt: str = Field(min_length=3, max_length=5000)
class InvokeResponseSchema(BaseModel):
    thread_id: PyObjectId
