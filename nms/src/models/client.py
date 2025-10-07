"Client Model Schema"

from pydantic import BaseModel, Field
from pymongo import ASCENDING
from pymongo.asynchronous.collection import AsyncCollection

from .utils import PyObjectId, MyDatetime, fields, none, now

class Client(BaseModel):
    id: PyObjectId | None = Field(default_factory=none, alias="_id")
    createdAt: MyDatetime = Field(default_factory=now)
    updatedAt: MyDatetime = Field(default_factory=now)

    name: str = Field(title="Client Name")
    description: str = Field(default_factory=lambda: "", title="Client Description")
    addresses: set[str] = Field(title="Client Addresses", description="IP/DNS Addresses of the Client")

async def init_clients_col(collection: AsyncCollection):
    await collection.create_index([(fields(Client).name, ASCENDING)], unique=True)
