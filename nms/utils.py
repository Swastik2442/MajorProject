from dataclasses import dataclass
from functools import lru_cache
from typing import TypeVar, cast, Any, Generic, Literal, TYPE_CHECKING

from bson import ObjectId
from pydantic import BaseModel, Field
from pydantic_core import core_schema

def none():
    return None
def to_doc(obj: BaseModel):
    return obj.model_dump(exclude_none=True)

class FilterParams(BaseModel):
    page: int = Field(1, ge=1)
    limit: int = Field(20, ge=1, le=100)

class Response(BaseModel):
    status: Literal["success", "error"] = Field(default_factory=lambda: "success")
    message: str | None = Field(default_factory=none)

TData = TypeVar('TData')
class DataResponse(Response, Generic[TData]):
    data: TData | None = Field(default_factory=none)

class PaginatedDataResponse(DataResponse, FilterParams, Generic[TData]):
    # Override to provide Generic support
    data: TData | None = Field(default_factory=none)

# Ref: https://github.com/pydantic/pydantic/discussions/8600#discussioncomment-8212526
@dataclass(frozen=True)
class _GetFields:
    _model: type[BaseModel]
    def __getattr__(self, item: str) -> Any:
        if item in self._model.model_fields:
            return item
        return getattr(self._model, item)

TModel = TypeVar("TModel", bound=type[BaseModel])
def fields(model: TModel, /) -> TModel:
    return cast(TModel, _GetFields(model))
if not TYPE_CHECKING:
    fields = lru_cache(maxsize=256)(fields)

# Ref: https://stackoverflow.com/a/77105412
class PyObjectId(str):
    @classmethod
    def __get_pydantic_core_schema__(
            cls, _source_type: Any, _handler: Any
    ) -> core_schema.CoreSchema:
        return core_schema.json_or_python_schema(
            json_schema=core_schema.str_schema(),
            python_schema=core_schema.union_schema([
                core_schema.is_instance_schema(ObjectId),
                core_schema.chain_schema([
                    core_schema.str_schema(),
                    core_schema.no_info_plain_validator_function(cls.validate),
                ])
            ]),
            serialization=core_schema.plain_serializer_function_ser_schema(
                str,
                when_used='json'
            )
        )

    @classmethod
    def validate(cls, value) -> ObjectId:
        if not ObjectId.is_valid(value):
            raise ValueError("Invalid ObjectId")
        return ObjectId(value)
