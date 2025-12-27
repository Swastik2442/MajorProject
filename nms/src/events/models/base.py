"""Base Model for Events."""

import abc
from typing import ClassVar

from pydantic import BaseModel


class BaseEventModel(BaseModel, abc.ABC):
    """Base Event Model."""
    client_id: str
    event_name: ClassVar[str]

    def __init_subclass__(cls, **kwargs):
        super().__init_subclass__(**kwargs)
        if not hasattr(cls, "event_name"):
            raise TypeError(f"{cls.__name__} must define class variable `event_name`")
