"Client Model Schema"

from pydantic import Field

from .base import BaseInterface

class Client(BaseInterface):
    class Meta(BaseInterface.Meta):
        @classmethod
        def collection_name(cls) -> str:
            return "clients"

    ownerId: str = Field(title="Owner ID", description="ID of the Org who owns this Client")
    apiKey: str = Field(title="Client API Key", description="API Key for the Client")
    name: str = Field(title="Client Name")
    description: str = Field(default_factory=lambda: "", title="Client Description")
