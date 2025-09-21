from dataclasses import dataclass
from functools import lru_cache
from typing import TypeVar, cast, Any, TYPE_CHECKING

from pydantic import BaseModel

def none():
    return None
def to_doc(obj: BaseModel):
    return {k: v for k, v in obj.model_dump().items() if v is not None}

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
