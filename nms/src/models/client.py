"Client Model Schema"

from pydantic import BaseModel, Field

from .base import BaseInterface
from .utils import none

class Client(BaseInterface):
    class Meta(BaseInterface.Meta):
        @classmethod
        def collection_name(cls) -> str:
            return "clients"

    ownerId: str = Field(title="Owner ID", description="ID of the Org who owns this Client")
    apiKey: str = Field(title="Client API Key", description="API Key for the Client")
    name: str = Field(title="Client Name", min_length=3, max_length=100)
    description: str | None = Field(default_factory=none, title="Client Description")

class ClientCreate(BaseModel):
    ownerId: str = Field(title="Owner ID", description="ID of the Org who owns this Client")
    name: str = Field(title="Client Name", min_length=3, max_length=100)
    description: str | None = Field(default_factory=none, title="Client Description")

class ClientUpdate(BaseModel):
    name: str | None = Field(default_factory=none, title="Client Name", min_length=3, max_length=100)
    description: str | None = Field(default_factory=none, title="Client Description")

class ClientListItem(BaseInterface, ClientCreate):
    pass
