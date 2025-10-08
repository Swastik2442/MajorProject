import abc

from pydantic import BaseModel, Field

from .utils import PyObjectId, MyDatetime, none, now

class BaseInterface(abc.ABC, BaseModel):
    """Base Interface for all models (collections)"""

    id: PyObjectId | None = Field(default_factory=none, alias="_id")
    createdAt: MyDatetime = Field(default_factory=now)
    updatedAt: MyDatetime = Field(default_factory=now)

    class Meta(abc.ABC):
        """Meta class for collection configuration"""
        @classmethod
        @abc.abstractmethod
        def collection_name(cls) -> str:
            return cls.__qualname__.split('.', maxsplit=1)[0]
