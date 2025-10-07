"Problem Model Schema"

from pydantic import BaseModel, Field
from pymongo import ASCENDING
from pymongo.asynchronous.collection import AsyncCollection

from ..templates.models import Severity
from .utils import PyObjectId, MyDatetime, fields, none, now

class Update(BaseModel):
    action: str = Field()
    timestamp: MyDatetime = Field()
    message: str = Field(default_factory=lambda: "")
    username: str | None = Field(default_factory=none)

class Problem(BaseModel):
    id: PyObjectId | None = Field(default_factory=none, alias="_id")
    createdAt: MyDatetime = Field(default_factory=now)
    updatedAt: MyDatetime = Field(default_factory=now)

    zid: str = Field(title="Zabbix Event ID")
    name: str = Field(title="Zabbix Event Name")
    startedAt: MyDatetime = Field()
    recoveryAt: MyDatetime | None = Field(default_factory=none)
    age: str | None = Field(default_factory=none)
    status: str = Field()
    severity: Severity = Field()
    duration: str | None = Field(default_factory=none)
    hostname: str = Field()
    updates: list[Update] = Field(default_factory=list)

class ProblemUpdate(BaseModel):
    updatedAt: MyDatetime = Field(default_factory=now)

    recoveryAt: MyDatetime | None = Field(default_factory=none)
    severity: Severity = Field()
    duration: str | None = Field(default_factory=none)
    status: str = Field()

async def init_problems_col(collection: AsyncCollection):
    await collection.create_index([(fields(Problem).zid, ASCENDING)], unique=True)
