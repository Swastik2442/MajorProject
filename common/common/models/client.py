"Client Model Schema"

from annotated_types import Timezone
from pydantic import BaseModel, Field

from .base import BaseInterface
from .utils import TimezoneStr, none, uuid4_hex


class Client(BaseInterface):
    """Client model representing an NMS server sending alerts."""
    class Meta(BaseInterface.Meta):
        @classmethod
        def collection_name(cls) -> str:
            return "clients"

    idForApi: str = Field(
        default_factory=uuid4_hex,
        title="Client ID for API",
        description="Unique identifier for the Client in API requests"
    )
    secretForApi: str = Field(
        title="Client Secret for API",
        description="Secret Key for the Client"
    )

    ownerId: str = Field(
        title="Owner ID",
        description="ID of the Org who owns this Client"
    )
    name: str = Field(
        min_length=3,
        max_length=100,
        title="Client Name",
        description="Name for the Client given by the owner"
    )
    description: str | None = Field(
        default_factory=none,
        title="Client Description",
        description="Description for the Client given by the owner"
    )
    timezone: TimezoneStr = Field(
        default_factory=lambda: "UTC",
        title="Client Timezone",
        description="Timezone for the Client"
    )

class ClientCreate(BaseModel):
    ownerId: str = Field(
        title="Owner ID",
        description="ID of the Org who owns this Client"
    )
    name: str = Field(
        min_length=3,
        max_length=100,
        title="Client Name",
        description="Name for the Client given by the owner"
    )
    description: str | None = Field(
        default_factory=none,
        title="Client Description",
        description="Description for the Client given by the owner"
    )
    timezone: TimezoneStr = Field(
        default_factory=lambda: "UTC",
        title="Client Timezone",
        description="Timezone for the Client"
    )

class ClientUpdate(BaseModel):
    name: str | None = Field(
        default_factory=none,
        title="Client Name",
        min_length=3,
        max_length=100
    )
    description: str | None = Field(
        default_factory=none,
        title="Client Description"
    )
    timezone: TimezoneStr = Field(
        default_factory=lambda: "UTC",
        title="Client Timezone",
        description="Timezone for the Client"
    )

class ClientOwnerUpdate(BaseModel):
    ownerId: str = Field(
        title="Owner ID",
        description="ID of the Org who owns this Client"
    )

class ClientListItem(BaseInterface, ClientCreate):
    pass
