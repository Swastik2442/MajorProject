"Utilities"

from dataclasses import dataclass
from datetime import datetime
from functools import lru_cache
from typing import TYPE_CHECKING, Annotated, Any, Literal, TypeVar, cast
from uuid import uuid4
from zoneinfo import ZoneInfo, ZoneInfoNotFoundError

from bson import ObjectId
from pydantic import AfterValidator, BaseModel
from pydantic_core import core_schema

utc_tz = ZoneInfo("UTC")

def none() -> None:
    return None
def now() -> datetime:
    return datetime.now(utc_tz)
def uuid4_hex() -> str:
    return uuid4().hex
def to_doc(obj: BaseModel):
    return obj.model_dump(exclude_none=True)

def validate_iana_timezone(tz_name: str) -> str:
    try:
        tz_name = tz_name.strip()
        ZoneInfo(tz_name)
        return tz_name
    except ZoneInfoNotFoundError as e:
        raise ValueError(f"Invalid IANA timezone: {tz_name}") from e
TimezoneStr = Annotated[str, AfterValidator(validate_iana_timezone)]

def normalize_to_utc(dt: datetime) -> datetime:
    if dt.tzinfo is None:
        return dt.replace(tzinfo=utc_tz)
    return dt.astimezone(utc_tz)
MyDatetime = Annotated[datetime, AfterValidator(normalize_to_utc)]

Severity = Literal["Not classified", "Information", "Warning", "Average", "High", "Disaster"]

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
