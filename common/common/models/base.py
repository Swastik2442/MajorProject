import abc

from pydantic import BaseModel, Field

from .utils import PyObjectId, MyDatetime, none, now

class BaseInterface(abc.ABC, BaseModel):
    """Base Interface for all models (collections)"""

    id: PyObjectId | None = Field(
        default_factory=none,
        alias="_id",
        title="ID",
        description="Unique identifier for the document"
    )
    createdAt: MyDatetime = Field(
        default_factory=now,
        title="Created At",
        description="Timestamp when the document was created"
    )
    updatedAt: MyDatetime = Field(
        default_factory=now,
        title="Updated At",
        description="Timestamp when the document was last updated"
    )

    class Meta(abc.ABC):
        """Meta class for collection configuration"""
        @classmethod
        @abc.abstractmethod
        def collection_name(cls) -> str:
            return cls.__qualname__.split('.', maxsplit=1)[0]
