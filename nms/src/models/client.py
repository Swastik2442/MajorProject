"Client Model Schema"

from pydantic import Field

from .base import BaseInterface

class Client(BaseInterface):
    class Meta(BaseInterface.Meta):
        @classmethod
        def collection_name(cls) -> str:
            return "clients"

    name: str = Field(title="Client Name")
    description: str = Field(default_factory=lambda: "", title="Client Description")
    addresses: set[str] = Field(title="Client Addresses", description="IP/DNS Addresses of the Client")
